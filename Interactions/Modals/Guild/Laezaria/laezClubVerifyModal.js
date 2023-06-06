const { ModalBuilder, TextInputBuilder, ActionRowBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { laezClubVerifyApproveButtonBuilder } = require('../../../Buttons/Guild/Laezaria/laezClubVerifyApproveButton');
const { laezClubVerifyRejectButtonBuilder } = require('../../../Buttons/Guild/Laezaria/laezClubVerifyRejectButton');
const path = require('path');
const { EmojiEnums } = require('../../../../Addons/Enums');
const { InteractionError } = require('../../../../Addons/Classes');
const { LaezariaEnums } = require('../../../../Addons/TempEnums');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

async function showLaezClubVerifyModal(interaction) {

    // Make a modal using the discord builder module.
    try {
        // Create the modal
        const laezClubVerifyModalBuilder = new ModalBuilder()
            .setCustomId(fileName)
            .setTitle('Laezaria IGN Verification');

        // Create the text input components
        const laezVerifyQ1Input = new TextInputBuilder()
            .setCustomId('laezVerifyQ1')
            .setLabel('What is your trove in game name?')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Example: Laezaria')
            .setMinLength(3)
            .setMaxLength(20)
            .setRequired(true);

        const laezVerifyQ2Input = new TextInputBuilder()
            .setCustomId('laezVerifyQ2')
            .setLabel('Image link for proof of Laezaria membership')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('See "How to get Image URL" section')
            .setMaxLength(300)
            .setRequired(true);

        // Add inputs to the modal.
        laezClubVerifyModalBuilder.addComponents(
            new ActionRowBuilder().addComponents(laezVerifyQ1Input),
            new ActionRowBuilder().addComponents(laezVerifyQ2Input)
        );

        // Show the modal to the user.
        await interaction.showModal(laezClubVerifyModalBuilder);

    } catch (error) { // Catch any potential errors.
        new InteractionError(interaction, fileName).issue(error);
    }
}

// Export logic that will be executed when the modal is submitted.
module.exports = {
    enabled: true,
    name: fileName,
    showLaezClubVerifyModal, // Function to show modal to the user. Used on different files as: showLaezClubVerifyModal(interaction)
    async execute(interaction, args) {

        /**
         * Checks if a URL is a valid image URL.
         * @param {string} url - The URL to check.
         * @returns {boolean} `true` if the URL is a valid image URL, `false` otherwise.
        */
        function isImage(url) {
            return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg|JPG|JPEG|PNG|WEBP|AVIF|GIF|SVG)$/.test(url);
        }

        try {
            // Create reply to defer the button execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing response...`, ephemeral: true });

            const [nickname, proofImage] = args; // Destructuring assignment
            const userResponses = { nickname, proofImage }; // // Object with user responses provided within the modal.
            let imgProofImage = userResponses.proofImage; // Set the proofImage.

            // If isImage() returns false for proofImage.
            if (isImage(imgProofImage) === false) {
                imgProofImage = LaezariaEnums.FAILED_PROOF_URL; // Set the proofImage to the default failure image.
            }

            // An embed builder to gather all information about the applicant and its responses for the guild staff members.
            const verificationEmbed = new EmbedBuilder()
                .setTitle('Laezaria IGN Verification')
                .setDescription(`${EmojiEnums.LOADING} Request is **OPEN** and awaiting staff approval.`)
                .setColor('Purple') // https://discord.js.org/#/docs/discord.js/main/typedef/ColorResolvable
                .setImage(imgProofImage)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: interaction.user.id, iconURL: interaction.client.user.displayAvatarURL() })
                .setFields(
                    {
                        name: 'Discord User',
                        value: `<@${interaction.user.id}>`,
                        inline: true,
                    },
                    {
                        name: 'Discord Tag',
                        value: `${interaction.user.tag}`,
                        inline: true,
                    },
                    {
                        name: 'What is your trove in game name?',
                        value: `\`\`\`${userResponses.nickname}\`\`\``,
                    },
                    {
                        name: 'Raw Image URL',
                        value: `\`\`\`${userResponses.proofImage}\`\`\``
                    }
                );

            // ActionRow with staff buttons to either approve or rejet the user application.
            const staffVerificatinActionRow = new ActionRowBuilder()
                .addComponents(laezClubVerifyApproveButtonBuilder, laezClubVerifyRejectButtonBuilder);

            // Get the channel object where to send the application message.
            const inboxChannel = interaction.guild.channels.cache.get(LaezariaEnums.INBOX_CHANNEL_ID);

            // Throw exception if channel is not found.
            if (!inboxChannel) throw new Error(`inboxChannel variable returns undefined which means this channel ID '${LaezariaEnums.INBOX_CHANNEL_ID}' is either invalid or has been removed from this guild.`);

            // Send message with the embed and button components to approve or reject the application.
            await inboxChannel.send({ embeds: [verificationEmbed], components: [staffVerificatinActionRow] });

            // Send a reply message confirming that the form has been submitted successfully.
            await reply.edit({ content: '**You submitted the verification request to the club!**\nNow you need to wait for a staff member to either approve or reject your request.', ephemeral: true });

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};