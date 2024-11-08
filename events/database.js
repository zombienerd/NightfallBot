const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the SQLite database (in-memory for temporary data)
const db = new sqlite3.Database(path.resolve(__dirname, 'messages.db'));

// Drop the table if it exists (for development purposes)
db.run(`DROP TABLE IF EXISTS message_mappings`);

// Create the table again with the correct schema
db.run(`CREATE TABLE IF NOT EXISTS message_mappings (
    sourceMessageId TEXT PRIMARY KEY,
    channel1MessageId TEXT,
    channel2MessageId TEXT,
    channel3MessageId TEXT,
    channel4MessageId TEXT,
    channel6MessageId TEXT,
    channel7MessageId TEXT,
    channel8MessageId TEXT,
    channel9MessageId TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Function to insert or update a message mapping
const addMessageMapping = (sourceMessageId, mappings) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO message_mappings 
            (sourceMessageId, channel1MessageId, channel2MessageId, channel3MessageId, channel4MessageId, channel6MessageId, channel7MessageId, channel8MessageId, channel9MessageId) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                sourceMessageId, 
                mappings.channel1MessageId, 
                mappings.channel2MessageId, 
                mappings.channel3MessageId, 
                mappings.channel4MessageId,
                mappings.channel6MessageId, 
                mappings.channel7MessageId, 
                mappings.channel8MessageId,
                mappings.channel9MessageId
            ],
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
            `SELECT channel1MessageId, channel2MessageId, channel3MessageId, channel6MessageId, channel7MessageId, channel8MessageId 
             FROM message_mappings WHERE sourceMessageId = ?`,
            [sourceMessageId],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
};

// Function to get all message mappings
const getAllMappings = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM message_mappings", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Function to delete old mappings (older than 24 hours)
const deleteOldMappings = () => {
    db.run(`DELETE FROM message_mappings WHERE timestamp < datetime('now', '-1 day')`);
};

// Clean up every hour
setInterval(deleteOldMappings, 60 * 60 * 1000);

// Export the functions
module.exports = { addMessageMapping, getMessageMapping, getAllMappings };