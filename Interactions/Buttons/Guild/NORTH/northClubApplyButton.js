const { ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const { showNorthClubApplyModal } = require('../../../Modals/Guild/NORTH/northClubApplyModal');
const { NorthEnums } = require('../../../../Addons/TempEnums');
const { InteractionError } = require('../../../../Addons/Classes');
const { EmojiEnums } = require('../../../../Addons/Enums');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

const northClubApplyButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setLabel('Apply')
    .setEmoji('<:northsigil:880166766372864040>')
    .setStyle(ButtonStyle.Primary);

module.exports = {
    enabled: true,
    name: fileName,
    builder: northClubApplyButtonBuilder,
    async execute(interaction) { // Logic when user interact with this button.

        try {
            // Check if interaction user is already a club member.
            const member = await interaction.guild.members.fetch(interaction.user.id);
            if (member.roles.cache.has(NorthEnums.roles.MEMBER_ID)) {
                return interaction.reply({ content: `${EmojiEnums.VERIFY} You are already a club member of **THE NORTH**!`, ephemeral: true });
            }

            // Display club application modal to the user.
            showNorthClubApplyModal(interaction);

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};