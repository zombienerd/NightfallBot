const { WebhookClient } = require('discord.js');
const { serverID1, serverID2, channelID1, channelID2, channelWHID2, channelWHTK2 } = require('../config.json');

const serverAcronyms = {
    [serverID1]: "[NGI]",
    [serverID2]: "[VIRT]",
    // Add more as needed
};

module.exports = {
    name: 'messageCreate',
    /**
     * Executes the cross-server message relay.
     * @param {Message} message - The message object from Discord.js
     */
    async execute(message) {
        if (message.channel.id !== channelID1) return;

        const serverAcronym = serverAcronyms[message.guild.id] || 'UNK';

        // Construct the webhook username with the server acronym and user's display name
        const webhookUsername = `${serverAcronym} ${message.member.displayName}`;

        // Initialize the webhook client
        const webhookClient = new WebhookClient({ id: channelWHID2, token: channelWHTK2 });

        // Send the message through the webhook with the modified username
        await webhookClient.send({
            content: message.content, // Send only the message content
            username: webhookUsername, // Username now includes the server acronym
            avatarURL: message.member.displayAvatarURL({ dynamic: true }), // Use the user's server-specific profile picture
        });
    },
};