const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the SQLite database (in-memory for temporary data)
const db = new sqlite3.Database(path.resolve(__dirname, 'messages.db'));

// Create table for message mappings if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS message_mappings (
    sourceMessageId TEXT PRIMARY KEY,
    server1MessageId TEXT,
    server2MessageId TEXT,
    server3MessageId TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Function to insert or update a message mapping
const addMessageMapping = (sourceMessageId, mappings) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO message_mappings (sourceMessageId, server1MessageId, server2MessageId, server3MessageId)
             VALUES (?, ?, ?, ?)`,
            [sourceMessageId, mappings.server1MessageId, mappings.server2MessageId, mappings.server3MessageId],
            function(err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
};

// Function to get a message mapping by sourceMessageId
const getMessageMapping = (sourceMessageId) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT server1MessageId, server2MessageId, server3MessageId FROM message_mappings WHERE sourceMessageId = ?`,
            [sourceMessageId],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
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