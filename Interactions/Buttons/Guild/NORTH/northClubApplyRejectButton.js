const { ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const { showNorthClubApplyRejectReasonModal } = require('../../../Modals/Guild/NORTH/northClubApplyRejectReasonModal');
const { NorthEnums } = require('../../../../Addons/TempEnums');
const { InteractionError } = require('../../../../Addons/Classes');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Button builder for THE NORTH's reject button.
const northClubApplyRejectButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setLabel('Reject')
    .setStyle(ButtonStyle.Danger);

module.exports = {
    enabled: true,
    name: fileName,
    northClubApplyRejectButtonBuilder,
    async execute(interaction) { // Logic when user interact with this button.

        try {
            // Get the member object in that guild.
            const member = await interaction.guild.members.fetch(interaction.user.id);

            // Check if interactor has permissions to use the button.
            if (!member.roles.cache.has(NorthEnums.roles.GRANDCOUSIL_ID) && !member.roles.cache.has(NorthEnums.roles.DEV_ID) && !member.roles.cache.has(NorthEnums.roles.ADMIN_ID)) {
                return interaction.reply({ content: 'You are not authorised to perform this action!', ephemeral: true });
            }

            // Display modal to the interaction.user interface.
            showNorthClubApplyRejectReasonModal(interaction); // Entire logic to reject application is under this reason modal.

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};