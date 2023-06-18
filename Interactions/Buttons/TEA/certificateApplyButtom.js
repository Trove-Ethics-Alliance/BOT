const { ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const path = require('path');
const { GuildEnums, EmojiEnums } = require('../../../Addons/Enums');
const { InteractionError } = require('../../../Addons/Classes');
const { addCertificateAttributesMenu } = require('../../Menus/TEA/certificateAttributeMenu');

// Button on TEA Server (?) to open up modal to apply to be a part of TEA

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

const certificateApplyButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setStyle(ButtonStyle.Primary)
    .setLabel('Apply to join TEA')
    .setEmoji('📄');

// Export Logic behind button
module.exports = {
    enabled: true,
    guild: GuildEnums.TEA,
    name: fileName,
    certificateApplyButtonBuilder,
    async execute(interaction) {
        try {
            // console.log(interaction.message.components[0].components[0].data.label);

            // Create a reply to defer interaction
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });

            // Embed template to modify with selection menu options.
            const templateEmbed = new EmbedBuilder()
            .setColor('Grey')
            .setTitle('Apply to be a TEA certified club')
            .setDescription('- In selection menu below pick an option to modify, all fields will be automatically updated in this message.\n- **IMPORTANT**: Representative field must be filled with discord user IDs separated by space or a comma.\n- You **MUST** fill all the required fields before submit button is displayed under the selection menu.')
            .addFields(
                { name: 'name', value: '*Value required*' },
                { name: 'discord', value: 'Not set' },
                { name: 'description', value: '*Value required*' },
                { name: 'joinworld', value: 'Not set' },
                { name: 'requirements', value: 'Not set' },
                { name: 'representatives', value: '*Value required*' },
            );

            // Add Create category
            templateEmbed.setAuthor({ name: 'APPLY', iconURL: interaction.client.user.displayAvatarURL() });

            // Make a new certificate template message
            const myNewReply = await reply.edit({ content: '', embeds: [templateEmbed] });

            // Set interaction object to the temporary data collection.
            interaction.client.tempData.set(interaction.user.id, { interaction });

            // Configures the selection menu
            addCertificateAttributesMenu(interaction, myNewReply);
        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};