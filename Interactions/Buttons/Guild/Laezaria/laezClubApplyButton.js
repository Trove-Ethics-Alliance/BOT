const { ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const { showLaezClubApplyModal } = require('../../../Modals/Guild/Laezaria/laezClubApplyModal');
const { LaezariaEnums } = require('../../../../Addons/TempEnums');
const { InteractionError } = require('../../../../Addons/Classes');
const { EmojiEnums } = require('../../../../Addons/Enums');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

const laezClubApplyButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setLabel('Apply to the club!')
    .setEmoji('<:laezaria:582281105298817032>')
    .setStyle(ButtonStyle.Primary);

module.exports = {
    enabled: true,
    name: fileName,
    builder: laezClubApplyButtonBuilder,
    async execute(interaction) { // Logic when user interact with this button.

        try {
            // Check if interaction user is already a club member.
            const member = await interaction.guild.members.fetch(interaction.user.id);
            if (member.roles.cache.has(LaezariaEnums.MEMBER_ROLE_ID)) {
                return interaction.reply({ content: `${EmojiEnums.VERIFY} You are already a club member of **Laezaria**!`, ephemeral: true });
            }

            // Dislay the laezaria club application modal to the user.
            showLaezClubApplyModal(interaction);

        } catch (error) {
            new InteractionError(interaction, error).issue(error);
        }
    }
};
