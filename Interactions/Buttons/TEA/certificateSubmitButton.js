const { ButtonBuilder } = require('discord.js');
const path = require('path');
const { GuildEnums, EmojiEnums } = require('../../../Addons/Enums');
const { InteractionError } = require('../../../Addons/Classes');
const { apiCall } = require('../../../Addons/API');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Function to determine whether it is a certfificate create or certificate modify.
async function determineCertificateFunction(interaction, option, reply) {

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
            const api = await apiCall('certificate/guild', await determineCertificateFunction(interaction, option, reply), JSON.stringify(option));

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
};