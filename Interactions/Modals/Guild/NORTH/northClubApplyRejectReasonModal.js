const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const { InteractionError } = require('../../../../Addons/Classes');
const { NorthEnums } = require('../../../../Addons/TempEnums');
const { EmojiEnums } = require('../../../../Addons/Enums');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

async function showNorthClubApplyRejectReasonModal(interaction) {
    // Make a modal using the discord builder module.
    try {
        // Variable with original embed data.
        const originalEmbed = await interaction.message.embeds[0];

        // Create the modal
        const northClubApplyRejectReasonModalBuilder = new ModalBuilder()
            .setCustomId(fileName)
            .setTitle(`Reject ${originalEmbed.fields[2].value.replace(/`/g, '')}'s Application`);

        // Create the text input components
        const northApplyRejectReasonQ1Input = new TextInputBuilder()
            .setCustomId('northApplyRejectReasonQ1')
            .setLabel('Reason')
            .setPlaceholder('Rejection reason for this application')
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1000);

        // Add inputs to the modal.
        northClubApplyRejectReasonModalBuilder.addComponents(
            new ActionRowBuilder().addComponents(northApplyRejectReasonQ1Input)
        );

        // Show the modal to the user.
        await interaction.showModal(northClubApplyRejectReasonModalBuilder);

    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

// Export logic that will be executed when the modal is submitted.
module.exports = {
    enabled: true,
    name: 'northClubApplyRejectReasonModal',
    showNorthClubApplyRejectReasonModal, // Function to show modal to the user. Used on different files as: showLaezClubApplyRejectReasonModal(interaction)
    async execute(interaction, args) { // That handles the interation submit response.

        try {
            // Create reply to defer the button execution.
            await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing response...`, ephemeral: true });

            // Vars
            const [reason] = args; // Destructuring assignment
            const userResponses = { reason }; // Object with user responses provided within the modal.
            const originalEmbed = await interaction.message.embeds[0];

            // Get a new embed instance for this interaction message.
            const newEmbed = new EmbedBuilder()
                .setTitle('Application succesfully finished')
                .setDescription(`${EmojiEnums.REJECT} Request is **CLOSED**\nRejected by ${interaction.user}.`)
                .setColor('Red')
                .setImage(NorthEnums.CLUB_LOGO_URL)
                .setThumbnail(originalEmbed.thumbnail.url)
                .setFooter(originalEmbed.footer)
                .setTimestamp()
                .setFields(originalEmbed.fields);

            // Assisng variable with template string for the reject response message.
            const denyTemplate = `Thank you for the time and effort you put into applying to **THE NORTH**.\nHowever, we regret to inform you that your application has been **denied** ${EmojiEnums.REJECT}`;

            // Modify userResponses.reason to include reason for the reject response message if present.
            if (userResponses.reason === '') {
                userResponses.reason = denyTemplate;
            } else {
                userResponses.reason = `${denyTemplate}\n**Reason**: ${userResponses.reason}`;
            }

            // Fetch applicant's member object.
            const userMember = await interaction.guild.members.fetch(newEmbed.data.footer.text);
            // Send user a Direct Message with the request response status.
            const dmEmbed = new EmbedBuilder()
                .setTitle('Application Response!')
                .setDescription(userResponses.reason)
                .setColor('Red')
                .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                .setImage(NorthEnums.CLUB_LOGO_URL);

            // Boolean variable to indicate whether direct message is received or not.
            let dmSentBoolean = true;

            // Send a direct message to the applicant with application results.
            await userMember.send({ embeds: [dmEmbed] })
                .catch(() => dmSentBoolean = false); // Change dmSentBoolean variable to false if DM wasn't sent successfully.

            // String with summary for user that interacted.
            let summaryString = `You have rejected ${newEmbed.data.fields[0].value}'s application successfully.`;

            // Check if applicant received a direct message and update summary string accordingly.
            if (!dmSentBoolean) {
                summaryString = summaryString + '\nHowever, direct message is not received due to privacy settings of this user.';
            }

            // Replace old embed with a new one and remove components.
            interaction.message.edit({ embeds: [newEmbed], components: [] })
                .then(() => {
                    // Edit initial reply with a summary string.
                    interaction.editReply({ content: summaryString, ephemeral: true });
                });
        } catch (error) { // Catch any potential errors.
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};