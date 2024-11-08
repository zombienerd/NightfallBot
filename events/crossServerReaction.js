const db = require('./database');
const {
    serverID1,
    serverID2,
    serverID3,
    channelID1,
    channelID2,
    channelID3,
    channelID6,
    channelID7,
    channelID8
} = require('../config.json');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        if (user.bot) return;

        const sourceChannelId = reaction.message.channel.id;

        // Only proceed if the reaction was added in one of the designated source channels
        if (![channelID1, channelID2, channelID3, channelID6, channelID7, channelID8].includes(sourceChannelId)) return;

        // Find the original message ID using the relayed message's ID
        const originalMessageId = await getOriginalMessageId(reaction.message.id);

        if (!originalMessageId) {
            console.log(`No mapping found for message ID ${reaction.message.id}`);
            return;
        }

        const mapping = await db.getMessageMapping(originalMessageId);

        if (!mapping) {
            console.log(`No mapping found for original message ID ${originalMessageId}`);
            return;
        } else {
            console.log(`Mapping found for original message ID ${originalMessageId}:`, mapping);
        }

        // Define the target channels and their associated message IDs
        const targetChannels = [
            { id: channelID1, messageId: mapping.channel1MessageId },
            { id: channelID2, messageId: mapping.channel2MessageId },
            { id: channelID3, messageId: mapping.channel3MessageId },
            { id: channelID6, messageId: mapping.channel6MessageId },
            { id: channelID7, messageId: mapping.channel7MessageId },
            { id: channelID8, messageId: mapping.channel8MessageId },
        ];

        // Format the emoji correctly for custom and standard cases
        const emoji = reaction.emoji;
        const emojiIdentifier = emoji.id ? `<:${emoji.name}:${emoji.id}>` : emoji.name;

        // Relay the reaction to each mapped message in the target channels, excluding the origin channel
        for (const target of targetChannels) {
            if (target.id !== sourceChannelId && target.messageId) { // Exclude the origin channel
                try {
                    const targetChannel = await reaction.message.client.channels.fetch(target.id);
                    const targetMessage = await targetChannel.messages.fetch(target.messageId);

                    // React using the correct format for custom vs standard emojis
                    await targetMessage.react(emojiIdentifier);
                } catch (error) {
                    console.error(`Failed to relay reaction in channel ${target.id}: ${error.message}`);
                }
            } else if (target.id === sourceChannelId) {
                console.log(`Skipping reaction on the origin channel ${sourceChannelId}`);
            } else {
                console.log(`No target message ID found in mapping for channel ${target.id}`);
            }
        }
    },
};

// Helper function to get the original message ID for reactions on relayed messages
async function getOriginalMessageId(relayedMessageId) {
    const mappings = await db.getAllMappings(); // Fetches all mappings as an array

    for (const mapping of mappings) {
        if (
            mapping.channel1MessageId === relayedMessageId ||
            mapping.channel2MessageId === relayedMessageId ||
            mapping.channel3MessageId === relayedMessageId ||
            mapping.channel6MessageId === relayedMessageId ||
            mapping.channel7MessageId === relayedMessageId ||
            mapping.channel8MessageId === relayedMessageId
        ) {
            return mapping.sourceMessageId;
        }
    }
    return null;
}