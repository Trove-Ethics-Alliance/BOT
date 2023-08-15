const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const path = require('path');
const { InteractionError } = require('../../../../Addons/Classes');
const { apiCall } = require('../../../../Addons/API');
const fileName = path.basename(__filename).slice(0, -3);

// Selection menu builder.
const scrambleRanksMenuRow = new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(fileName)
            .setPlaceholder('Nothing selected')
            .setMinValues(1)
            .setMaxValues(6)
            .addOptions([
                {
                    label: 'Unranked',
                    description: 'Include people from the unranked bracket list.',
                    value: 'Unranked',
                },
                {
                    label: 'Silver',
                    description: 'Include people from the silver bracket list.',
                    value: 'Silver',
                },
                {
                    label: 'Gold',
                    description: 'Include people from the gold bracket list.',
                    value: 'Gold',
                },
                {
                    label: 'Platinum',
                    description: 'Include people from the Platinum bracket list.',
                    value: 'Platinum',
                },
                {
                    label: 'Diamond',
                    description: 'Include people from the diamond bracket list.',
                    value: 'Diamond',
                },
                {
                    label: 'Obsidian',
                    description: 'Include people from the obsidian bracket list.',
                    value: 'Obsidian',
                },
            ]),
    );

// Export logic that will be executed when the selection menu option is selected.
module.exports = {
    enabled: true,
    name: fileName,
    scrambleRanksMenuRow,
    async execute(interaction, args) { // That handles the interation submit response.

        try {
            // Split the string by spaces and get 5th element from it aka the number.
            const amount = interaction.message.content.split(' ')[4];

            // Join selected ranks with a comma.
            const rank = args.join(', ');

            // Get data from the API.
            const APIres = await apiCall(`event/scramble/pick_winner?rank=${rank}&amount=${amount}`);

            // Assign an array.
            const winnerArray = [];

            // Push into the array formatted string with the winner data.
            APIres.winners.every(winner => winnerArray.push(`* <@${winner.id}> with ${winner.points} points at ${winner.rank.toLowerCase()} rank!`))

            // Variable with the content of the message to send.
            const content = `# Scramble event results!\n\n> \`${APIres.winners.length} winner(s) were randomly selected from the following rank(s): ${APIres.rank.join(', ')}\`\n\n# List of winners [${APIres.winners.length} out of ${APIres.participants}]\n> ${APIres.chances}% to win\n${winnerArray.join('\n')}`;

            // Send reply to the interaction.
            interaction.reply({ content: 'Picking winners...', ephemeral: true });

            // Send the message to the interaction channel.
            interaction.channel.send({ content });


        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};