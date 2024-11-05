const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the SQLite database with synchronous and serialized mode
const db = new sqlite3.Database(path.resolve(__dirname, 'messages.db'), (err) => {
    if (err) {
        console.error('Failed to connect to database:', err);
    } else {
        console.log('Connected to SQLite database.');
        db.run("PRAGMA synchronous = FULL", (err) => {
            if (err) {
                console.error("Failed to set synchronous mode:", err);
            } else {
                console.log("Database set to synchronous mode.");
            }
        });
    }
});

// Create table for message mappings if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS message_mappings (
        sourceMessageId TEXT PRIMARY KEY,
        server1MessageId TEXT,
        server2MessageId TEXT,
        server3MessageId TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Function to insert or update a message mapping
const addMessageMapping = (sourceMessageId, mappings) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(
                `INSERT OR REPLACE INTO message_mappings (sourceMessageId, server1MessageId, server2MessageId, server3MessageId)
                 VALUES (?, ?, ?, ?)`,
                [sourceMessageId, mappings.server1MessageId, mappings.server2MessageId, mappings.server3MessageId],
                function(err) {
                    if (err) {
                        console.error(`Failed to add mapping for message ID ${sourceMessageId}:`, err);
                        reject(err);
                    } else {
                        console.log(`Successfully added mapping for message ID ${sourceMessageId}:`, mappings);
                        listAllMappings();  // Call the inspection function after adding each mapping
                        resolve();
                    }
                }
            );
        });
    });
};

// Function to get a message mapping by sourceMessageId
const getMessageMapping = (sourceMessageId) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(
                `SELECT server1MessageId, server2MessageId, server3MessageId FROM message_mappings WHERE sourceMessageId = ?`,
                [sourceMessageId],
                (err, row) => {
                    if (err) {
                        console.error(`Failed to retrieve mapping for message ID ${sourceMessageId}:`, err);
                        reject(err);
                    } else if (row) {
                        console.log(`Retrieved mapping for message ID ${sourceMessageId}:`, row);
                        resolve(row);
                    } else {
                        console.log(`No mapping found for message ID ${sourceMessageId}`);
                        resolve(null);
                    }
                }
            );
        });
    });
};

// Temporary function to list all database entries for debugging
const listAllMappings = () => {
    db.all(`SELECT * FROM message_mappings`, [], (err, rows) => {
        if (err) {
            console.error("Failed to retrieve all mappings:", err);
        } else {
            console.log("Current database mappings:");
            rows.forEach((row) => {
                console.log(row);
            });
        }
    });
};

// Function to delete old mappings (older than 24 hours)
const deleteOldMappings = () => {
    db.run(`DELETE FROM message_mappings WHERE timestamp < datetime('now', '-1 day')`);
};

// Clean up every hour
setInterval(deleteOldMappings, 60 * 60 * 1000);

// Export the functions
module.exports = { addMessageMapping, getMessageMapping };