const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const { EmojiEnums, GuildEnums } = require('../../../../Addons/Enums');
const { InteractionError } = require('../../../../Addons/Classes');
const { apiCall } = require('../../../../Addons/API');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3).toLowerCase();

module.exports = {
    enabled: true,
    guild: GuildEnums.GLOBAL,
    data: new SlashCommandBuilder()
        .setName(fileName)
        .setDescription('Check remaining codes for this event.'),

    async execute(interaction) {
        try {

            // Create reply to defer the command execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });

            // Get data from the API.
            const APIres = await apiCall(`event/scramble/remaining?user=${interaction.user.id}`);

            // Edit the reply with the results.
            reply.edit({ content: APIres.response });
        } catch (error) {
            // Default error message to the user.
            new InteractionError(interaction, fileName).issue(error);
        }
    },
};
