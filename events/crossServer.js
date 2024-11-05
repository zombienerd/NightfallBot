const { WebhookClient } = require('discord.js');
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
    /**
     * Executes the cross-server message relay.
     * @param {Message} message - The message object from Discord.js
     */
    async execute(message) {
        // Check if the message was sent in a designated source channel
        if (![channelID1, channelID2, channelID3].includes(message.channel.id)) return;

        // Ensure message.member is defined (not null)
        if (!message.member) {
            //console.error('Message member is null. Unable to relay message.');
            return;
        }

        const serverAcronym = serverAcronyms[message.guild.id] || 'UNK';
        const webhookUsername = `${serverAcronym} ${message.member.displayName}`;
        const avatarURL = message.member.displayAvatarURL({ dynamic: true });

        // Webhooks for target channels
        const targetWebhooks = [];

        if (message.channel.id === channelID1) {
            targetWebhooks.push({ id: channelWHID2, token: channelWHTK2 });
            targetWebhooks.push({ id: channelWHID3, token: channelWHTK3 });
        } else if (message.channel.id === channelID2) {
            targetWebhooks.push({ id: channelWHID1, token: channelWHTK1 });
            targetWebhooks.push({ id: channelWHID3, token: channelWHTK3 });
        } else if (message.channel.id === channelID3) {
            targetWebhooks.push({ id: channelWHID1, token: channelWHTK1 });
            targetWebhooks.push({ id: channelWHID2, token: channelWHTK2 });
        }

        // Relay the message to each target webhook
        for (const webhookData of targetWebhooks) {
            const webhookClient = new WebhookClient(webhookData);

            await webhookClient.send({
                content: message.content,
                username: webhookUsername,
                avatarURL: avatarURL
            });
        }
    },
};