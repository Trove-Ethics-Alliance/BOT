const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const { northClubApplyApproveButtonBuilder } = require('../../../Buttons/Guild/NORTH/northClubApplyApproveButton');
const { northClubApplyRejectButtonBuilder } = require('../../../Buttons/Guild/NORTH/northClubApplyRejectButton');
const { InteractionError } = require('../../../../Addons/Classes');
const { NorthEnums } = require('../../../../Addons/TempEnums');
const { EmojiEnums } = require('../../../../Addons/Enums');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

async function showNorthClubApplyModal(interaction) {
    // Make a modal using the discord builder module
    try {
        // Create the modal
        const northClubApplyModalBuilder = new ModalBuilder()
            .setCustomId(fileName)
            .setTitle('THE NORTH Club Application');

        // Create the text input components
        const northApplyQ1Input = new TextInputBuilder()
            .setCustomId('northApplyQ1')
            .setLabel('Key in your Trove In Game Name')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('E.g. Surge')
            .setMinLength(3)
            .setMaxLength(20)
            .setRequired(true);

        const northApplyQ2Input = new TextInputBuilder()
            .setCustomId('northApplyQ2')
            .setLabel('What about Trove keeps you playing')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('E.g. Trove is fun...')
            .setMaxLength(500)
            .setRequired(true);

        const northApplyQ3Input = new TextInputBuilder()
            .setCustomId('northApplyQ3')
            .setLabel('What can you tell us about yourself?')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('E.g. My Hobbies are...')
            .setMaxLength(500)
            .setRequired(true);

        const northApplyQ4Input = new TextInputBuilder()
            .setCustomId('northApplyQ4')
            .setLabel('Why do you want to join The North?')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('E.g. Because The North is...')
            .setMaxLength(500)
            .setRequired(true);

        const northApplyQ5Input = new TextInputBuilder()
            .setCustomId('northApplyQ5')
            .setLabel('Image Proof for your Total Mastery Rank')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Image URL')
            .setMaxLength(200)
            .setRequired(true);

        // Add inputs to the modal.
        northClubApplyModalBuilder.addComponents(
            new ActionRowBuilder().addComponents(northApplyQ1Input),
            new ActionRowBuilder().addComponents(northApplyQ2Input),
            new ActionRowBuilder().addComponents(northApplyQ3Input),
            new ActionRowBuilder().addComponents(northApplyQ4Input),
            new ActionRowBuilder().addComponents(northApplyQ5Input),
        );

        // Show the modal to the user.
        await interaction.showModal(northClubApplyModalBuilder);

    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

// Export logic that will be executed when the modal is submitted.
module.exports = {
    enabled: true,
    name: fileName,
    showNorthClubApplyModal, // Function to show modal to the user. Used on different files as: showNorthClubApplyModal(interaction)
    async execute(interaction, args) { // That handles the interaction submit response.

        /**
         * Checks if a URL is a valid image URL.
         * @param {string} url - The URL to check.
         * @returns {boolean} `true` if the URL is a valid image URL, `false` otherwise.
         */
        function isImage(url) {
            return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg|JPG|JPEG|PNG|WEBP|AVIF|GIF|SVG)$/.test(url);
        }

        try {
            const [nickname, whatPlaying, aboutYourself, whyJoin, proofImage] = args; // Destructuring assignment
            const userResponses = { nickname, whatPlaying, aboutYourself, whyJoin, proofImage }; // Object with user responses provided with the modal
            let imgProofImage = userResponses.proofImage; // Variable to check if proof image is actually an image.

            // If isImage() returns false for proofImage.
            if (isImage(imgProofImage) === false) {
                imgProofImage = NorthEnums.CLUB_LOGO_URL;
            }

            // An embed builder to gather all information about the applicant and its responses for guild staff members.
            const applicationEmbed = new EmbedBuilder()
                .setTitle('A new application to join THE NORTH')
                .setDescription(`${EmojiEnums.LOADING} Request is **OPEN** and awaiting staff approval`)
                .setColor('Aqua')
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
                        name: 'Trove In game Name',
                        value: `\`\`\`${userResponses.nickname}\`\`\``,
                    },
                    {
                        name: 'What about Trove keeps you playing?',
                        value: `\`\`\`${userResponses.whatPlaying}\`\`\``
                    },
                    {
                        name: 'What can you tell us about yourself?',
                        value: `\`\`\`${userResponses.aboutYourself}\`\`\``
                    },
                    {
                        name: 'Why do you want to join The North?',
                        value: `\`\`\`${userResponses.whyJoin}\`\`\``
                    },
                    {
                        name: 'Image for proof of Total Mastery Level ',
                        value: 'If you do not see a image of proof, it means the Applicant either did not give a valid Image URL or left this part Blank'
                    },
                    {
                        name: 'Raw Image URL',
                        value: `\`\`\`${userResponses.proofImage}\`\`\``
                    },
                );

            // ActionRow with staff buttons to either approve or reject the user application.
            const staffApplicationActionRow = new ActionRowBuilder()
                .addComponents(northClubApplyApproveButtonBuilder, northClubApplyRejectButtonBuilder);

            // Get the channel object where to send the application message.
            const inboxChannel = interaction.guild.channels.cache.get(NorthEnums.channels.INBOX_ID);

            // Throw exception if channel is not found.
            if (!inboxChannel) throw new Error(`inboxChannel variable returns undefined which means this channel ID '${NorthEnums.channels.INBOX_ID}' is either invalid or has been removed from this guild.`);

            // Send message with the embed button components to accept or reject application.
            await inboxChannel.send({ embeds: [applicationEmbed], components: [staffApplicationActionRow] });

            // Send a reply message confirming that the form has been submitted successfully.
            await interaction.reply({ content: '**You submitted application to the club!**\nNow you need to wait for a staff member to either approve or reject your request.', ephemeral: true });

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};