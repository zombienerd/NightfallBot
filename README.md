Welcome to NightfallBot

A discord bot for cross-server communications.

Created with Node.js and Discord.js for the Nightfall Alliance (A Star Citizen Alliance).  Uses webhooks to "appear" as the person from the other server (with APP tag). Base reactions and reactions from servers the bot is on are transferred.  Reply text is sent, but it is not marked as a reply, just plain text.  I want to implent reply handling someday.

Work in progress.  Don't expect much, I'm an unskilled monkey slapping a typewriter.  I made this for my org and alliance, not "for everyone". I offer the code freely as a base to anyone who thinks it'll work for them. BSD-3-clause license means you can do whatever you want with it, just keep the license attached.  If you can make it work for your situation, please feel free, you do so with my blessings and cheers. 

Install node.js
Install discord.js

Copy demo-config.json to config.json - edit the guts

use node index.js to start the bot.

If you found this useful, buy me a coffee!  https://ko-fi.com/yestergearpc


This code is desgined to work on 3-5 servers with 2 channels on each.  You can comment/uncomment lines necessary in crossServer.js to add/remove functionality.  The codebase is currently configured for 3 servers with 2 channels on each. Channels 1-5 are linked, Channels 6-10 are linked.  If you want different, comment/uncomment lines, and debug. You'll want to edit the serverAcronyms in crossServer.js to match your guild/org/server name or delete the text between the quotes to have it blanked.

It should be relatively easy to follow, if you have basic understanding of node.js discord.js and the like.  If not, feel free to drop a message here on github, or a DM on discord @yestergearpc  -  No promises I'll have time to answer and assist.
