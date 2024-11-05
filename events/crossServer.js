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
    channelWHTK3 
} = require('../config.json');

const serverAcronyms = {
    [serverID1]: "[NGI]",
    [serverID2]: "[VIRT]",
    [serverID3]: "[12BG]"
};

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore if the message is a reply (handled by crossServerReply.js)
        if (message.reference) return;

        // Check if the message is in a designated source channel
        if (![channelID1, channelID2, channelID3].includes(message.channel.id)) return;
        if (!message.member) return;

        const serverAcronym = serverAcronyms[message.guild.id] || 'UNK';
        const webhookUsername = `${serverAcronym} ${message.member.displayName}`;
        const avatarURL = message.member.displayAvatarURL({ dynamic: true });
        const targetWebhooks = [];

        const mappings = {
            server1MessageId: null,
            server2MessageId: null,
            server3MessageId: null
        };

        // Set the correct field in mappings based on the origin server
        if (message.channel.id === channelID1) {
            mappings.server1MessageId = message.id;
            targetWebhooks.push({ id: channelWHID2, token: channelWHTK2 });
            targetWebhooks.push({ id: channelWHID3, token: channelWHTK3 });
        } else if (message.channel.id === channelID2) {
            mappings.server2MessageId = message.id;
            targetWebhooks.push({ id: channelWHID1, token: channelWHTK1 });
            targetWebhooks.push({ id: channelWHID3, token: channelWHTK3 });
        } else if (message.channel.id === channelID3) {
            mappings.server3MessageId = message.id;
            targetWebhooks.push({ id: channelWHID1, token: channelWHTK1 });
            targetWebhooks.push({ id: channelWHID2, token: channelWHTK2 });
        }

        for (const webhookData of targetWebhooks) {
            const webhookClient = new WebhookClient(webhookData);

            const messageOptions = {
                username: webhookUsername,
                avatarURL: avatarURL,
                content: message.content || undefined,
                files: message.attachments.map(att => att.url),
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

            const relayedMessage = await webhookClient.send(messageOptions);

            // Update the mapping with the relayed message IDs
            if (webhookData.id === channelWHID1) mappings.server1MessageId = relayedMessage.id;
            if (webhookData.id === channelWHID2) mappings.server2MessageId = relayedMessage.id;
            if (webhookData.id === channelWHID3) mappings.server3MessageId = relayedMessage.id;
        }

        // Save original and relayed message IDs to the database
        console.log(`Adding mapping to database for message ID ${message.id}:`, mappings);
        await db.addMessageMapping(message.id, mappings);
    },
};