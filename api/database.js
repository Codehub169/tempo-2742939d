const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'db.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
      throw err;
    }
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) console.error("Failed to enable foreign keys:", err.message);
        });

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )`, (err) => {
            if (err) console.error("Error creating users table:", err.message);
        });

        db.run(`CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            name TEXT NOT NULL,
            sku TEXT NOT NULL UNIQUE,
            category TEXT,
            stock INTEGER NOT NULL DEFAULT 0,
            price REAL NOT NULL DEFAULT 0.0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
        )`, (err) => {
            if (err) console.error("Error creating inventory table:", err.message);
        });
    });
});

module.exports = db;
