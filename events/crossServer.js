const { WebhookClient } = require('discord.js');
const db = require('./database');
const { 
    serverID1, 
    serverID2, 
    serverID3, 
    serverID4,
//    serverID5,
    channelID1, 
    channelID2, 
    channelID3,
    channelID4,
//    channelID5,
    channelID6,
    channelID7,
    channelID8,
    channelID9,
//    channelID10,    
    channelWHID1, 
    channelWHTK1, 
    channelWHID2, 
    channelWHTK2, 
    channelWHID3, 
    channelWHTK3, 
    channelWHID4, 
    channelWHTK4, 
//    channelWHID5, 
//    channelWHTK5, 
    channelWHID6, 
    channelWHTK6, 
    channelWHID7, 
    channelWHTK7, 
    channelWHID8, 
    channelWHTK8, 
    channelWHID9, 
    channelWHTK9, 
//    channelWHID10, 
//    channelWHTK10 
} = require('../config.json');

const serverAcronyms = {
    [serverID1]: "[NGI]",
    [serverID2]: "[VGAL]",
    [serverID3]: "[12BG]",
    [serverID4]: "[NFIA]",
 //   [serverID5]: "[FEX]"
};

module.exports = {
    name: 'messageCreate',
    async execute(message) {
       
        // Check if the message is in a designated source channel
        if (![channelID1, channelID2, channelID3, channelID4, channelID6, channelID7, channelID8, channelID9].includes(message.channel.id)) return;
        if (!message.member) return;

        const serverAcronym = serverAcronyms[message.guild.id] || 'UNK';
        const webhookUsername = `${serverAcronym} ${message.member.displayName}`;
        const avatarURL = message.member.displayAvatarURL({ dynamic: true });
        const targetWebhooks = [];

        const mappings = {
           channel1MessageId: null,
           channel2MessageId: null,
           channel3MessageId: null,
           channel4MessageId: null,
           channel6MessageId: null,
           channel7MessageId: null,
           channel8MessageId: null,
           channel9MessageId: null,
        };

        // Set the correct field in mappings based on the origin server
        if (message.channel.id === channelID1) {
            mappings.channel1MessageId = message.id;
            targetWebhooks.push({ id: channelWHID2, token: channelWHTK2 });
            targetWebhooks.push({ id: channelWHID3, token: channelWHTK3 });
            targetWebhooks.push({ id: channelWHID4, token: channelWHTK4 });
        } else if (message.channel.id === channelID2) {
            mappings.channel2MessageId = message.id;
            targetWebhooks.push({ id: channelWHID1, token: channelWHTK1 });
            targetWebhooks.push({ id: channelWHID3, token: channelWHTK3 });
            targetWebhooks.push({ id: channelWHID4, token: channelWHTK4 });
        } else if (message.channel.id === channelID3) {
            mappings.channel3MessageId = message.id;
            targetWebhooks.push({ id: channelWHID1, token: channelWHTK1 });
            targetWebhooks.push({ id: channelWHID2, token: channelWHTK2 });
            targetWebhooks.push({ id: channelWHID4, token: channelWHTK4 });
        } else if (message.channel.id === channelID4) {
            mappings.channel4MessageId = message.id;
            targetWebhooks.push({ id: channelWHID1, token: channelWHTK1 });
            targetWebhooks.push({ id: channelWHID2, token: channelWHTK2 });
            targetWebhooks.push({ id: channelWHID3, token: channelWHTK3 });
        } else if (message.channel.id === channelID6) {
            mappings.channel6MessageId = message.id;
            targetWebhooks.push({ id: channelWHID7, token: channelWHTK7 });
            targetWebhooks.push({ id: channelWHID8, token: channelWHTK8 });
            targetWebhooks.push({ id: channelWHID9, token: channelWHTK9 });
        } else if (message.channel.id === channelID7) {
            mappings.channel7MessageId = message.id;
            targetWebhooks.push({ id: channelWHID6, token: channelWHTK6 });
            targetWebhooks.push({ id: channelWHID8, token: channelWHTK8 });
            targetWebhooks.push({ id: channelWHID9, token: channelWHTK9 });
        } else if (message.channel.id === channelID8) {
            mappings.channel8MessageId = message.id;
            targetWebhooks.push({ id: channelWHID6, token: channelWHTK6 });
            targetWebhooks.push({ id: channelWHID7, token: channelWHTK7 });
            targetWebhooks.push({ id: channelWHID9, token: channelWHTK9 });
        } else if (message.channel.id === channelID9) {
            mappings.channel9MessageId = message.id;
            targetWebhooks.push({ id: channelWHID6, token: channelWHTK6 });
            targetWebhooks.push({ id: channelWHID7, token: channelWHTK7 });
            targetWebhooks.push({ id: channelWHID8, token: channelWHTK8 });
        }

        for (const webhookData of targetWebhooks) {
            const webhookClient = new WebhookClient(webhookData);

            // Include stickers if available
            const stickerURL = message.stickers.size > 0 ? message.stickers.first().url : null;

            const messageOptions = {
                username: webhookUsername,
                avatarURL: avatarURL,
                content: message.content || undefined,
                files: message.attachments.size > 0 
                    ? message.attachments.map(att => att.url) 
                    : message.stickers.size > 0 
                        ? message.stickers.map(sticker => sticker.url)
                        : undefined,
                embeds: message.embeds.length > 0 ? message.embeds.map(embed => ({
                    title: embed.title,
                    description: embed.description,
                    url: embed.url,
                    color: embed.color,
                    fields: embed.fields,
                    image: embed.image,
                    thumbnail: embed.thumbnail,
                    footer: embed.footer,
                    author: embed.author,
                })) : undefined
            };

            // Ensure the message isn't empty
            if (!messageOptions.content && messageOptions.files.length === 0 && !messageOptions.embeds) {
                console.error('Skipping message: Cannot send an empty message');
                continue;
            }

            const relayedMessage = await webhookClient.send(messageOptions);

            // Update the mapping with the relayed message IDs
            if (webhookData.id === channelWHID1) mappings.channel1MessageId = relayedMessage.id;
            if (webhookData.id === channelWHID2) mappings.channel2MessageId = relayedMessage.id;
            if (webhookData.id === channelWHID3) mappings.channel3MessageId = relayedMessage.id;
            if (webhookData.id === channelWHID4) mappings.channel4MessageId = relayedMessage.id;
            if (webhookData.id === channelWHID6) mappings.channel6MessageId = relayedMessage.id;
            if (webhookData.id === channelWHID7) mappings.channel7MessageId = relayedMessage.id;
            if (webhookData.id === channelWHID8) mappings.channel8MessageId = relayedMessage.id;
            if (webhookData.id === channelWHID9) mappings.channel9MessageId = relayedMessage.id;
        }

        // Save original and relayed message IDs to the database
        await db.addMessageMapping(message.id, mappings);
    },
};