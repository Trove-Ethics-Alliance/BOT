const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const path = require('path');
const { InteractionError } = require('../../../Addons/Classes');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

/**
 * Adds a selection menu using the Discord builder module to the specified message.
 * @param {Interaction} interaction - The interaction that triggered this command.
 * @param {Object} message - The message object to add the selection menu to.
 * @returns {Promise<Message>} A Promise that resolves with the updated message with the selection menu added.
 */
async function addCreateClubButtonMenu(interaction, message) {

    // Make a selection menu using the discord builder module.
    try {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(fileName)
                    .setPlaceholder('Nothing selected')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions([
                        {
                            label: 'Laezaria Application Button',
                            description: 'Creates a button with application button for Laezaria Club.',
                            value: 'laezClubApplyButton',
                        },
                        {
                            label: 'THE NORTH Application Button',
                            description: 'Creates a button with application button for THE NORTH Club.',
                            value: 'northClubApplyButton',
                        },
                        {
                            label: 'Laezaria Verify Button',
                            description: 'Creates a button with with verification for Laezaria Club.',
                            value: 'laezClubVerifyButton',
                        },
                    ]),
            );

        return interaction.editReply({
            content: message, components: [row]
        });

    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

// Export logic that will be executed when the selection menu option is selected.
module.exports = {
    enabled: false,
    name: fileName,
    addCreateClubButtonMenu, // Function to add selection menu component to a provided message object. Used on different files as: addCreateClubButtonMenu(interaction, message)
    async execute(interaction, args) { // That handles the interation submit response.

        try {
            // Array with button builders.
            const componentArr = [];

            // Get the channel object from the message's mentions
            const channelFromMention = interaction.message.mentions.channels.first();

            // Loop through the args array. For each iteration check if button exist and push into the 'componentArr' array.
            for (const iterator of args) {
                const button = interaction.client.buttons.get(iterator);
                if (button) {
                    componentArr.push(button.builder);
                }
            }

            // Create the ActionRow object with selected components from 'componentArr' Array.
            const row = new ActionRowBuilder()
                .addComponents(componentArr);

            if (!row.components.length) {
                return interaction.reply({ content: 'No valid buttons were selected.', ephemeral: true });
            }

            // Send the message with components to the 'channelFromMention' object.
            const newMessage = await channelFromMention.send({ components: [row] });

            // Send a message confirming that the form has been submitted successfully.
            await interaction.reply({ content: `Selected button(s) has been added successfully.\n${newMessage.url}`, ephemeral: true });

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};