const { ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const { GuildEnums, EmojiEnums } = require('../../../Addons/Enums');
const { InteractionError } = require('../../../Addons/Classes');
const { apiCall } = require('../../../Addons/API');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Create the button.
const certificateApplyApproveButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setLabel('Approve')
    .setStyle(ButtonStyle.Success);

// Export logic behind button
module.exports = {
    enabled: true,
    guild: GuildEnums.TEA,
    name: fileName,
    certificateApplyApproveButtonBuilder,
    async execute(interaction) {
        try {
            // Create reply to defer interaction.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });

            // Retrieve the Embed from interaciton.
            const messageEmbed = interaction.message.embeds[0];

            // Edit the title to approve.
            messageEmbed.data.title = `${messageEmbed.data.fields[0].value} has been approved by ${interaction.user.username}`;

            // Edit the colour to Green.
            messageEmbed.data.color = 5763719;

            // Remove the button component from the message and add the new embed.
            await interaction.message.edit({ embeds: [messageEmbed], components: [] });

            // API Call to upload the data.
            await createCertificate(interaction, reply);

            // Create followUp
            interaction.followUp({ content: `${messageEmbed.data.fields[0].value} is now officially a part of TEA.`, ephemeral: true });
        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};

/**
 * Creates a certificate.
 *
 * @param {Interaction} interaction - The Discord interaction objet.
 * @param {Interaction} reply - The interaction object to reply
 * @returns {Promise<void>} - Returns a reply that a certificate is successfully created.
 * @throws {InteractionError} - If there is an error during the creation process.
 */
async function createCertificate(interaction, reply) {
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
        const api = await apiCall('certificate/guild', 'POST', JSON.stringify(option));

        // Edit reply.
        reply.edit({ content: api.message ? api.message : '🥶 Something went wrong, please try later.' });
    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}