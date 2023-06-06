const { ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const { showLaezClubApplyRejectReasonModal } = require('../../../Modals/Guild/Laezaria/laezClubApplyRejectReasonModal');
const { InteractionError } = require('../../../../Addons/Classes');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Button builder for laezaria's reject button.
const laezClubApplyRejectButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setLabel('Reject')
    .setStyle(ButtonStyle.Danger);

module.exports = {
    enabled: true,
    name: fileName,
    laezClubApplyRejectButtonBuilder,
    async execute(interaction) { // Logic when user interact with this button.

        try {
            // Display modal to the interaction.user interface.
            showLaezClubApplyRejectReasonModal(interaction); // Entire logic to reject application is under this reason modal.

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};
