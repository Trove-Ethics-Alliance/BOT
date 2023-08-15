const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { InteractionError } = require('../../../../Addons/Classes');
const path = require('path');
const { apiCall } = require('../../../../Addons/API');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

async function showCreateScrambleCodeModal(interaction) {

    try {
        // Create the modal.
        const createScrambleCodeModalBuilder = new ModalBuilder()
            .setCustomId(fileName)
            .setTitle('Create a new scramble event code');

        // Create modal options.
        const codeID = new TextInputBuilder()
            .setCustomId('codeID')
            .setLabel('Enter code to claim')
            .setPlaceholder('E.g. tea12345')
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(64)
            .setRequired(true)

        const codeDifficulty = new TextInputBuilder()
            .setCustomId('codeDifficulty')
            .setLabel('Set difficulty as a number between 1 and 3')
            .setPlaceholder('1 is hard, 2 is medium and 3 is easy')
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(1)
            .setRequired(true)

        const codeTip = new TextInputBuilder()
            .setCustomId('codeTip')
            .setLabel('Set tip to make it easier to find')
            .setPlaceholder('E.g. Near the tower on the club spawn point.')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(254)
            .setRequired(false)

        const codeEnabled = new TextInputBuilder()
            .setCustomId('codeEnabled')
            .setLabel('Enable right after creation? (true/false)')
            .setValue('true')
            .setStyle(TextInputStyle.Short)
            .setMinLength(4)
            .setMaxLength(5)
            .setRequired(true)

        const actionRow1 = new ActionRowBuilder().addComponents(codeID);
        const actionRow2 = new ActionRowBuilder().addComponents(codeDifficulty);
        const actionRow3 = new ActionRowBuilder().addComponents(codeTip);
        const actionRow4 = new ActionRowBuilder().addComponents(codeEnabled);

        createScrambleCodeModalBuilder.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

        // Show the modal
        interaction.showModal(createScrambleCodeModalBuilder);

    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

// Export logic when modal is submitted.
module.exports = {
    enabled: true,
    name: fileName,
    showCreateScrambleCodeModal,
    async execute(interaction, args) {

        try {
            // Destructuring assignment
            const [codeID, codeDifficulty, codeTip, codeEnabled] = args;

            // Data for the API call.
            const data = {
                'difficulty': codeDifficulty,
                'tip': codeTip,
                'enabled': codeEnabled
            };

            // Send API call and return response.
            const APIres = await apiCall(`event/scramble/code?id=${codeID}`, 'POST', JSON.stringify(data));

            // Send response back to the user.
            interaction.reply({ content: `### ${APIres.message}\n* ID: \`${APIres.doc.id}\`\n* Tip: \`${APIres.doc.tip ? APIres.doc.tip : 'Unavailable'}\`\n* Difficulty level: \`${APIres.doc.difficulty}\`\n* Enabled: **${APIres.doc.enabled === true ? 'Yes' : 'No'}**`, ephemeral: true });

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};
