const express = require("express");
const router = express.Router();
const db = require("./database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./middleware");

// Public routes
router.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], function(err) {
        if (err) {
            console.error(err.message);
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ message: "Email already in use." });
            }
            return res.status(500).json({ message: "Failed to register user." });
        }
        res.status(201).json({ message: "User registered successfully", userId: this.lastID });
    });
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;
     if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password." });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Server error during login." });
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "24h"
        });

        res.status(200).json({ 
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
});

// Protected Routes
router.use(authenticateToken);

// Get inventory statistics
router.get("/inventory/stats", (req, res) => {
    const userId = req.user.id;
    const stats = {};
    db.get("SELECT COUNT(*) as totalItems FROM inventory WHERE userId = ?", [userId], (err, row) => {
        if (err) return res.status(500).json({ message: "Error fetching stats", error: err.message });
        stats.totalItems = row.totalItems;
        db.get("SELECT COUNT(*) as lowStock FROM inventory WHERE stock > 0 AND stock < 10 AND userId = ?", [userId], (err, row) => {
            if (err) return res.status(500).json({ message: "Error fetching stats", error: err.message });
            stats.lowStock = row.lowStock;
            db.get("SELECT COUNT(*) as outOfStock FROM inventory WHERE stock = 0 AND userId = ?", [userId], (err, row) => {
                if (err) return res.status(500).json({ message: "Error fetching stats", error: err.message });
                stats.outOfStock = row.outOfStock;
                db.get("SELECT COUNT(DISTINCT category) as categories FROM inventory WHERE userId = ?", [userId], (err, row) => {
                    if (err) return res.status(500).json({ message: "Error fetching stats", error: err.message });
                    stats.categories = row.categories;
                    res.json(stats);
                });
            });
        });
    });
});

// Generate inventory reports
router.get("/inventory/report", (req, res) => {
    const { reportType, category, dateFrom, dateTo } = req.query;
    const userId = req.user.id;

    let query;
    let params = [];
    let headers = [];
    let title = "";
    let summary = null;

    let whereClauses = ["userId = ?"];
    params.push(userId);

    if (category && category !== 'all') {
        whereClauses.push("category = ?");
        params.push(category);
    }
    if (dateFrom) {
        whereClauses.push("createdAt >= ?");
        params.push(dateFrom);
    }
    if (dateTo) {
        whereClauses.push("createdAt <= ?");
        params.push(dateTo + 'T23:59:59.999Z');
    }

    let whereString = whereClauses.join(" AND ");

    switch (reportType) {
        case 'stock-levels':
            title = "Current Stock Levels Report";
            headers = ["SKU", "Name", "Category", "Stock"];
            query = `SELECT sku, name, category, stock FROM inventory WHERE ${whereString} ORDER BY name ASC`;
            break;
        case 'low-stock':
            title = "Low Stock Report";
            headers = ["SKU", "Name", "Category", "Stock"];
            whereClauses.push("stock > 0 AND stock < 10");
            query = `SELECT sku, name, category, stock FROM inventory WHERE ${whereClauses.join(" AND ")} ORDER BY stock ASC`;
            break;
        case 'inventory-value':
            title = "Inventory Value Report";
            headers = ["SKU", "Name", "Category", "Stock", "Price", "Total Value"];
            query = `SELECT sku, name, category, stock, price, (stock * price) as totalValue FROM inventory WHERE ${whereString} ORDER BY name ASC`;
            break;
        default:
            return res.status(400).json({ message: "Invalid report type." });
    }

    db.all(query, params, (err, items) => {
        if (err) {
            return res.status(500).json({ message: "Failed to generate report.", error: err.message });
        }
        
        if (reportType === 'inventory-value') {
            const totalValue = items.reduce((acc, item) => acc + item.totalValue, 0);
            summary = { label: "Total Inventory Value", value: totalValue };
        }

        res.json({ title, headers, items, summary });
    });
});

// Get all inventory items for the logged-in user
router.get("/inventory", (req, res) => {
    db.all("SELECT * FROM inventory WHERE userId = ?", [req.user.id], (err, rows) => {
        if (err) {
            res.status(500).json({ message: "Failed to retrieve inventory." });
            return;
        }
        res.json(rows);
    });
});

// Add a new inventory item
router.post("/inventory", (req, res) => {
    const { name, sku, category, stock, price } = req.body;
    if (!name || !sku || !category || stock == null || price == null) {
        return res.status(400).json({ message: "Please provide all required fields: name, sku, category, stock, price." });
    }
    db.run("INSERT INTO inventory (name, sku, category, stock, price, userId) VALUES (?, ?, ?, ?, ?, ?)", 
        [name, sku, category, stock, price, req.user.id], 
        function(err) {
            if (err) {
                 if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ message: "SKU already exists." });
                }
                res.status(500).json({ message: "Failed to add item to inventory." });
                return;
            }
            res.status(201).json({ id: this.lastID, ...req.body });
        }
    );
});

// Update an inventory item
router.put("/inventory/:id", (req, res) => {
    const { name, sku, category, stock, price } = req.body;
    if (!name || !sku || !category || stock == null || price == null) {
        return res.status(400).json({ message: "Please provide all required fields: name, sku, category, stock, price." });
    }
    const { id } = req.params;
    db.run("UPDATE inventory SET name = ?, sku = ?, category = ?, stock = ?, price = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?", 
        [name, sku, category, stock, price, id, req.user.id], 
        function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                     return res.status(409).json({ message: "SKU already exists." });
                }
                res.status(500).json({ message: "Failed to update inventory item." });
                return;
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Item not found or user not authorized." });
            }
            res.json({ message: "Item updated successfully." });
        }
    );
});

// Delete an inventory item
router.delete("/inventory/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM inventory WHERE id = ? AND userId = ?", [id, req.user.id], function(err) {
        if (err) {
            res.status(500).json({ message: "Failed to delete inventory item." });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Item not found or user not authorized." });
        }
        res.json({ message: "Item deleted successfully." });
    });
});

module.exports = router;
