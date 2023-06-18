const { ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const { GuildEnums, EmojiEnums } = require('../../../Addons/Enums');
const { InteractionError } = require('../../../Addons/Classes');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Create the button
const certificateApplyRejectButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setLabel('Reject')
    .setStyle(ButtonStyle.Danger);

// Export button function.
module.exports = {
    enabled: true,
    guild: GuildEnums.TEA,
    name: fileName,
    certificateApplyRejectButtonBuilder,
    async execute(interaction) {
        try {
            // Create reply to defer interaction.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });

            // retrieve the Embed from interaction.
            const messageEmbed = interaction.message.embeds[0];

            // Edit the title to rejected.
            messageEmbed.data.title = `${messageEmbed.data.fields[0].value} has been rejected by ${interaction.user.username}`;

            // Remove the button component from the message and edit the embed to the new embed
            await interaction.message.edit({ embeds: [messageEmbed], components: [] });

            // Edit the reply
            reply.edit({ content: `${messageEmbed.data.fields[0].value}'s application to join TEA has been rejected`, ephemeral: true });
        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};