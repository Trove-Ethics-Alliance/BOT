const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { showLaezClubVerifyRejectReasonModal } = require('../../../Modals/Guild/Laezaria/laezClubVerifyRejectReasonModal');
const path = require('path');
const { InteractionError } = require('../../../../Addons/Classes');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Button builder for laezaria's reject button.
const laezClubVerifyRejectButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setLabel('Reject')
    .setStyle(ButtonStyle.Danger);

module.exports = {
    enabled: true,
    name: fileName,
    laezClubVerifyRejectButtonBuilder,
    async execute(interaction) { // Logic when use interacts with this button.

        try {
            // Display modal to the interaction.user interface.
            showLaezClubVerifyRejectReasonModal(interaction); // Entire logic to reject application is under this reason modal.

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }

    }
};