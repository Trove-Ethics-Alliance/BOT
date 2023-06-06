const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { InteractionError } = require('../../../Addons/Classes');
const path = require('path');
const { EmojiEnums } = require('../../../Addons/Enums');
const { certificateSubmitButtonBuilder } = require('../../Buttons/TEA/certificateSubmitButton');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

async function showCertificateAttributeModal(interaction, args) {

    try {

        // Embed with certificate template
        const certEmbed = interaction.message.embeds[0];

        // Create the modal.
        const editCertificateAttributeModalBuilder = new ModalBuilder()
            .setCustomId(fileName)
            .setTitle('Create a new club certificate');

        // Object with limitations for modal text field.
        const maxAttLength = {
            description: 1024,
            representatives: 512,
        };

        // adding selected options from select menu and showing it on modal.
        for (const attributes of args) {

            // Splitting Arguements to individual data.
            const index = attributes.split(':')[0].toString();
            const attribute = attributes.split(':')[1].toString();

            const modalInput = new TextInputBuilder()
                .setCustomId(attribute.toString())
                .setStyle(maxAttLength[attribute] >= 1024 ? TextInputStyle.Paragraph : TextInputStyle.Short)
                .setLabel(attribute)
                .setValue(certEmbed.data.fields[index].value)
                .setMinLength(3)
                .setMaxLength(maxAttLength[attribute] ? maxAttLength[attribute] : 64)
                .setRequired(true);

            editCertificateAttributeModalBuilder.addComponents(new ActionRowBuilder().addComponents(modalInput));
        }

        // Show the modal
        interaction.showModal(editCertificateAttributeModalBuilder);

    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

// Export logic when modal is submitted.
module.exports = {
    enabled: true,
    name: fileName,
    showCertificateAttributeModal,
    async execute(interaction, args) {

        try {
            // Create reply to defer interaction
            const modalReply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });
            // const newArgs = interaction.components[0].components[0];

            // Push Question Args into a variable
            const dataArgs = [];
            for (const iterator of interaction.fields.components) {
                dataArgs.push(iterator.components[0].customId);
            }

            // Creating the object where question : answer
            const object = {};
            for (let i = 0; i < args.length; i++) {
                object[dataArgs[i]] = args[i];
            }

            // Get certificate template embed.
            const certEmbed = interaction.message.embeds[0];

            // Retrieve Select menu component from interaction message.
            const selectMenuComponent = interaction.message.components[0].components;

            // Modify the field value with provided customId which is embed index for the value.
            for (let i = 0; i < certEmbed.data.fields.length; i++) {
                for (const key in object) {
                    if (certEmbed.data.fields[i].name === key) certEmbed.data.fields[i].value = object[key];
                }
            }
            // certEmbed.data.fields[newArgs.customId].value = newArgs.value;

            // Get original interaction object.
            const templateReply = await interaction.client.tempData.get(interaction.user.id).interaction;

            // See if any fields still has Value Required, if it does then readyForSubmit = false.
            const readyForSubmit = !certEmbed.data.fields.some(fields => fields.value === '*Value required*');

            // Determine whether it is a Modify or Create Embed.
            let label = ['Modify Certificate', ButtonStyle.Primary];
            if (interaction.message.embeds[0].author.name === 'CREATE') label = ['Create a Certificate', ButtonStyle.Success];

            // If all Value Reuired fields are filled, then add submit button.
            const row = [new ActionRowBuilder().addComponents(selectMenuComponent)];
            if (readyForSubmit) row.push(new ActionRowBuilder().addComponents(certificateSubmitButtonBuilder.setLabel(label[0]).setStyle(label[1])));

            // Finally, modify the template reply embed message.
            await templateReply.editReply({ embeds: [certEmbed], components: row });

            // Send interaction reply to the modal to notify the user that changes has been made.
            modalReply.edit({ content: `Successfully set **${dataArgs.toString().replace(/,/g, ', ')}** field ${EmojiEnums.APPROVE}\n> New content for this field is: '${args.toString().replace(/,/g, ', ')}' respectfully.` });
        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};
