const { WebhookClient } = require('discord.js');
const db = require('./database');
const {
    serverID1,
    serverID2,
    serverID3,
    channelID1,
    channelID2,
    channelID3,
    channelWHID1,
    channelWHTK1,
    channelWHID2,
    channelWHTK2,
    channelWHID3,
    channelWHTK3,
} = require('../config.json');

const serverAcronyms = {
    [serverID1]: "[NGI]",
    [serverID2]: "[VIRT]",
    [serverID3]: "[12BG]",
};

// In-memory cache for recently added message mappings
const recentMappingsCache = {};

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore if the message is not in a monitored channel or if it's not a reply
        if (![channelID1, channelID2, channelID3].includes(message.channel.id)) return;
        if (!message.member || !message.reference) return;

        try {
            let repliedToMessageId = message.reference.messageId;
            console.log(`Checking for mapping of replied-to message ID: ${repliedToMessageId}`);

            // Helper function to retrieve a mapping, checking cache first
            const getMapping = async (id) => {
                // Check cache for immediate retrieval
                if (recentMappingsCache[id]) {
                    console.log(`Mapping found in cache for message ID: ${id}`);
                    return recentMappingsCache[id];
                }
                
                // Fall back to database retrieval
                let mapping = await db.getMessageMapping(id);
                if (!mapping) {
                    console.log(`Mapping not found initially for ID ${id}, retrying after delay...`);
                    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
                    mapping = await db.getMessageMapping(id);
                }

                // Cache mapping if found
                if (mapping) recentMappingsCache[id] = mapping;
                return mapping;
            };

            // Fetch the mapping for the replied-to message
            const mapping = await getMapping(repliedToMessageId);
            if (!mapping) {
                console.log(`No mapping found for replied message ID ${repliedToMessageId} after retries.`);
                return;
            }

            console.log(`Mapping found for replied message ID ${repliedToMessageId}:`, mapping);

            // Define the target channels and their associated message IDs
            const targetChannels = [
                { id: channelID1, messageId: mapping.server1MessageId },
                { id: channelID2, messageId: mapping.server2MessageId },
                { id: channelID3, messageId: mapping.server3MessageId },
            ];

            // Relay the reply to each mapped message in the target channels
            for (const target of targetChannels) {
                if (target.id !== message.channel.id && target.messageId) { // Exclude the origin channel
                    const webhookClient = new WebhookClient({
                        id: target.id === channelID1 ? channelWHID1 : target.id === channelID2 ? channelWHID2 : channelWHID3,
                        token: target.id === channelID1 ? channelWHTK1 : target.id === channelID2 ? channelWHTK2 : channelWHTK3,
                    });

                    await webhookClient.send({
                        content: `> ${message.content}`, // Format as a reply by quoting the original message
                        username: `${serverAcronyms[message.guild.id]} ${message.member.displayName}`,
                        avatarURL: message.member.displayAvatarURL({ dynamic: true }),
                        allowedMentions: { repliedUser: false },
                    });
                }
            }
        } catch (error) {
            console.error(`Failed to relay reply: ${error.message}`);
        }
    },
};