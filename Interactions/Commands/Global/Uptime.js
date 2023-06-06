const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const { EmojiEnums, GuildEnums } = require('../../../Addons/Enums');
const { InteractionError } = require('../../../Addons/Classes');
const moment = require('moment');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3).toLowerCase();

module.exports = {
    enabled: true,
    guild: GuildEnums.GLOBAL,
    data: new SlashCommandBuilder()
        .setName(fileName)
        .setDescription('Check bot uptime.')
        .setDMPermission(false),

    async execute(interaction) {
        try {
            // Create reply to defer the command execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });

            // Get current time in milliseconds.
            const currMS = moment().format('x');

            // Calculate the difference between current time and bot startup date.
            const timeDiffinMS = Math.floor(currMS - interaction.client.uptime);

            // Create a new date object with the results.
            const botStartDate = new Date(timeDiffinMS);

            // Moment format string
            const format = 'dddd, Do MMMM YYYY [at] h:m A z';

            // Send interaction reply message.
            reply.edit({
                content: `🕜 Last application downtime was **${moment(botStartDate).fromNow()}**.\n> ${moment(botStartDate).utc().format(format)}.`,
                ephemeral: true,
            });
        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};