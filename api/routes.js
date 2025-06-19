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
            return res.status(500).json({ message: "Failed to register user. Email may already be in use." });
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
            return res.status(404).json({ message: "User not found." });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
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
// All routes below this middleware require a valid token
router.use(authenticateToken);

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
    db.run("INSERT INTO inventory (name, sku, category, stock, price, userId) VALUES (?, ?, ?, ?, ?, ?)", 
        [name, sku, category, stock, price, req.user.id], 
        function(err) {
            if (err) {
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
    const { id } = req.params;
    db.run("UPDATE inventory SET name = ?, sku = ?, category = ?, stock = ?, price = ? WHERE id = ? AND userId = ?", 
        [name, sku, category, stock, price, id, req.user.id], 
        function(err) {
            if (err) {
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
