const { Events, ActivityType } = require('discord.js');
const log = require('../Addons/Logger');
const refreshTime = 1000 * 60 * 1;

// Status emojis.
const statusEmojis = ['👮‍♂️', '🕵️‍♂️', '💂‍♂️', '👨‍🎓', '🤵', '🚨', '🚔', '🚓', '🤙'];

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        log.info(`⭐ ${process.env.BOT_NAME} started successfully as '${client.user.tag}'. Version: ${process.env.BOT_VERSION}`);

        // Set the client user's presence
        client.user.setPresence({ status: 'idle' });

        // Update bot's setPresence every refreshTime time.
        setInterval(() => {

            try {
                let memberCount = 0;
                for (const guild of client.guilds.cache) memberCount = memberCount + guild[1].memberCount; // Count members in all guilds.

                // Set client presence status.
                client.user.setPresence({
                    activities: [{
                        name: `${memberCount} users ${statusEmojis[Math.floor(Math.random() * statusEmojis.length)]}`,
                        type: ActivityType.Watching
                    }], status: 'online'
                });

            } catch (error) {
                log.bug('Error to set presence status for the bot', error);
            }
        }, refreshTime);
    },
};