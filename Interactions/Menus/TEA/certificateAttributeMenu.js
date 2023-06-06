const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const path = require('path');
const { InteractionError } = require('../../../Addons/Classes');
const { showCertificateAttributeModal } = require('../../Modals/TEA/certificateEditAttributeModal');
// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

async function addCertificateAttributesMenu(interaction, embedReply) {

    try {
        // Array of embed fields objects.
        const embedFields = embedReply.embeds[0].data.fields;

        // Array to store option objects.
        const options = [];

        // Make options for MenuBuilder.
        for (let index = 0; index < embedFields.length; index++) {
            const element = embedFields[index];

            const menuOptionObject = {
                label: element.name,
                value: `${index.toString()}:${element.name}`
            };

            // Push new object into the array.
            options.push(menuOptionObject);
        }

        // Selection menu builder.
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(fileName)
                    .setPlaceholder('Select field to modify')
                    .setMinValues(1)
                    .setMaxValues(5)
                    .addOptions(options),
            );

        // Add selection menu for this interaction.
        await interaction.editReply({ components: [row] });

    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

// Export logic that will be executed when the selection menu option is selected.
module.exports = {
    enabled: true,
    name: fileName,
    addCertificateAttributesMenu,
    async execute(interaction, args) { // That handles the interation submit response.

        try {

            // Show the modal dialog with the selected value index from embed.
            showCertificateAttributeModal(interaction, args);

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};