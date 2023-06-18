const { ButtonBuilder, ActionRowBuilder } = require('discord.js');
const path = require('path');
const { GuildEnums, EmojiEnums } = require('../../../Addons/Enums');
const { InteractionError } = require('../../../Addons/Classes');
const { apiCall } = require('../../../Addons/API');
const { certificateApplyApproveButtonBuilder } = require('./certificateApplyApproveButton');
const { certificateApplyRejectButtonBuilder } = require('./certificateApplyRejectButton');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

/**
 * Certificate Submit Button Builder
 *
 * @requires setLabel() - to make a complete Button Builder
 * @requires setStyle() - to make a complete Button Builder
 * @example certificateSubmitButtonBuilder.setLabel('Test').setStyle(ButtonStyle.Primary)
 */
const certificateSubmitButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setEmoji('📄');

module.exports = {
    enabled: true,
    guild: GuildEnums.TEA,
    name: fileName,
    certificateSubmitButtonBuilder,
    async execute(interaction) {

        try {
            // Create reply to defer interaction
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });

            // Get from setAuthor Category
            const category = interaction.message.embeds[0].author.name;

            switch (category) {
                case 'CREATE': return adminCertificateFunction(interaction, reply);
                case 'MODIFY': return adminCertificateFunction(interaction, reply);
                case 'DELETE': return adminCertificateFunction(interaction, reply);
                case 'APPLY': return certificateApplyFunction(interaction, reply);
            }

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }

    }
};

/**
 * Determines whether it is a CREATE, MODIFY, DELETE function for certificates.
 *
 * @param {Interaction} interaction - The Discord interaction object.
 * @param {Interaction} reply - The interaction objet to reply.
 * @param {Variable} option - The option to pass into the apiCall.
 * @returns {Promise<void>} - method POST/DELETE/PATCH.
 * @throws {InteractionError} - if there is an error during the determining of creation/modification/deletion process.
 */
async function determineAdminCertificateFunction(interaction, option, reply) {

    try {
        // Get from setAuthor the category
        const category = interaction.message.embeds[0].author.name;
        let method;

        switch (category) {

            case 'CREATE':
                method = 'POST';
                break;

            case 'MODIFY':
                method = 'PATCH';
                option.id = interaction.message.embeds[0].footer.text;
                break;

            case 'DELETE':
                method = 'DELETE';
                option.id = interaction.message.embeds[0].footer.text;
                break;

            default: return reply.edit({ content: 'This certificate category is not available yet.\nPlease try again later.' });

        }

        return method;
    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

/**
 * Create, Modify, Delete function for certificates
 *
 * @param {Interaction} interaction - The Discord interaction object.
 * @param {Interaction} reply - The interaction object to reply.
 * @returns {Promise<void>} API successful Response from the creation/modification/deletion of certificates.
 * @throws {InteractionError} - If there is an error during the creation/modification/deletion of certificates.
 */
async function adminCertificateFunction(interaction, reply) {
    try {
        // Retrieve embed fields from interaction.message.emebeds
        const messageEmbedFieldsArray = interaction.message.embeds[0].data.fields;

        // Destructure assignment
        const [gName, dDiscord, gDescription, gJoinworld, gRequirements, gRepresentatives] = messageEmbedFieldsArray;

        // Create object to pass into apiCall to register/modify certificate
        const option = {
            'name': gName.value,
            'discord': dDiscord.value === 'Not set' ? null : dDiscord.value,
            'description': gDescription.value,
            'joinworld': gJoinworld.value === 'Not set' ? null : gJoinworld.value,
            'requirements': gRequirements.value === 'Not set' ? null : gRequirements.value,
            'representatives': gRepresentatives.value
        };

        // API Post request to register club to database
        const api = await apiCall('certificate/guild', await determineAdminCertificateFunction(interaction, option, reply), JSON.stringify(option));

        // Retrieve the initial interaction
        const templateReply = interaction.client.tempData.get(interaction.user.id).interaction;

        // Remove the select menu and button.
        templateReply.editReply({ components: [] });

        // Edit reply.
        reply.edit({ content: api.message ? api.message : '🥶 Something went wrong, please try later.' });

        // Remove tempData.
        interaction.client.tempData.delete(interaction.user.id);
    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

/**
 * Certificate Application
 *
 * @param {Interaction} interaction - The Discord interaction object
 * @param {Interaction} reply - The interaction object to reply.
 * @returns {Promise<void>} Successful application sent to inbox channel.
 * @throws {InteractionError} - If there is an error during the Application process.
 */
async function certificateApplyFunction(interaction, reply) {
    try {
        // Retrieve embed fields from interaction.message.emebeds
        const messageEmbed = interaction.message.embeds[0];

        // Customize Embed into an application.
        messageEmbed.data.title = `Application for Club: ${messageEmbed.data.fields[0].value}`;

        // Fetch inbox channel.
        const inbox = await interaction.client.channels.fetch('1107404733712445461');

        // Send the embed to inbox with Approve or Reject button
        await inbox.send({ embeds: [messageEmbed], components: [new ActionRowBuilder().addComponents(certificateApplyApproveButtonBuilder).addComponents(certificateApplyRejectButtonBuilder)] });

        reply.edit({ content: 'Successfully Applied to be a Certified TEA Club, please be patient for the results.' });
    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}