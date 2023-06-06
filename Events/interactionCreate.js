const { Events, ApplicationCommandOptionType } = require('discord.js');
const log = require('../Addons/Logger');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(client, interaction) {


        switch (true) {
            case (interaction.isChatInputCommand()): { // Slash command handler.
                try {
                    // Log who and what interaction used.
                    log.info(`[/${interaction.commandName}${interaction.options._subcommand ? ` ${interaction.options._subcommand}` : ''}] command used by '${interaction.user?.tag}' on the ${interaction.guild?.name ? `'${interaction.guild.name}' guild.` : 'direct message.'}`);

                    // Assing variable to a command.
                    const command = client.commands.get(interaction.commandName);

                    // Check if command exist.
                    if (!client.commands.get(interaction.commandName)) return interaction.reply({ content: '⛔ It seems that this command is not valid and cannot be executed.\nTry again later...', ephemeral: true });

                    // Create args array
                    const args = [];

                    // Loop through interaction.options.data to get arguments into args array
                    for (const option of interaction.options.data) {

                        switch (option.type) {

                            // When command has a group option.
                            case ApplicationCommandOptionType.SubcommandGroup: {

                                // Get group name
                                if (option.name) args.push(option.name);

                                // Get sub command name
                                if (option.options[0].name) args.push(option.options[0].name);

                                // Get sub command arguments
                                option.options[0]?.options.forEach((x) => {
                                    if (x.value) args.push(x.value);
                                });

                                break;
                            }

                            // When command has a sub command option.
                            case ApplicationCommandOptionType.Subcommand: {

                                // Get sub command name
                                if (option.name) args.push(option.name);

                                // Get sub command arguments
                                option.options?.forEach((x) => {
                                    if (x.value) args.push(x.value);
                                });

                                break;
                            }

                            // When main command has arguments.
                            default: {
                                // Get option value
                                args.push(option.value);
                                break;
                            }
                        }
                    }

                    // Execute the command.
                    return command.execute(interaction, args);

                } catch (error) {
                    log.bug('Error with interactionCreate event', error);
                    return interaction.reply({ content: '🐛 An error occurred while executing this command!', ephemeral: true }).catch(err => log.bug('Error to send interaction response', err));
                }
            }

            case (interaction.isButton()): { // Button handler.
                try {
                    // Log who used this interaction.
                    log.info(`[${interaction.customId}] button used by '${interaction.user?.tag}' on the ${interaction.guild?.name ? `'${interaction.guild.name}' guild.` : 'direct message.'}`);

                    // Assing variable to a button.
                    const button = client.buttons.get(interaction.customId);

                    // Check if button exist.
                    if (!client.buttons.get(interaction.customId)) {
                        log.bug('Non supported interaction button used:', interaction.customId);
                        return interaction.reply({ content: '🐛 It seems that this button is not valid and cannot be executed.\nTry again later...', ephemeral: true });
                    }

                    // Execute the button.
                    return button.execute(interaction);

                } catch (error) {
                    log.bug('Error with interactionCreate event', error);
                    return interaction.reply({ content: '🐛 An error occurred while executing this button!', ephemeral: true })
                        .catch(err => log.bug('Error to send interaction response', err));
                }
            }

            case (interaction.isUserContextMenuCommand()): { // User context command handler.
                try {
                    // Log who used this interaction.
                    log.info(`[${interaction.commandName}] user context command used by '${interaction.user?.tag}' on the ${interaction.guild?.name ? `'${interaction.guild.name}' guild.` : 'direct message.'}`);

                    // Assing variable to a context command.
                    const context = client.commands.get(interaction.commandName);

                    // Check if context command exist.
                    if (!context) return interaction.reply({ content: '⛔ It seems that this interaction is not valid and cannot be executed.\nTry again later...', ephemeral: true });

                    // Execute the command.
                    return context.execute(interaction, interaction.options.data[0].user);

                } catch (error) {
                    log.bug('Error with interactionCreate event', error);
                    return interaction.reply({ content: '🐛 An error occurred while executing this user context command!', ephemeral: true })
                        .catch(err => log.bug('Error to send interaction response', err));
                }
            }

            case (interaction.isMessageContextMenuCommand()): { // Message context command handler.
                try {
                    // Log who used this interaction.
                    log.info(`[${interaction.commandName}] user context command used by '${interaction.user?.tag}' on the ${interaction.guild?.name ? `'${interaction.guild.name}' guild.` : 'direct message.'}`);

                    // Assing variable to a context command.
                    const context = client.commands.get(interaction.commandName);

                    // Check if context command exist.
                    if (!context) return interaction.reply({ content: '⛔ It seems that this interaction is not valid and cannot be executed.\nTry again later...', ephemeral: true });

                    // Execute the command.
                    return context.execute(interaction, interaction.options.data[0].message);

                } catch (error) {
                    log.bug('Error with interactionCreate event', error);
                    return interaction.reply({ content: '🐛 An error occurred while executing this message context command!', ephemeral: true })
                        .catch(err => log.bug('Error to send interaction response', err));
                }
            }

            case (interaction.isModalSubmit()): { // Modal handler.
                try {
                    // Log who used this interaction.
                    log.info(`[${interaction.customId}] modal used by '${interaction.user?.tag}' on the ${interaction.guild?.name ? `'${interaction.guild.name}' guild.` : 'direct message.'}`);

                    // Assing variable to a modal.
                    const modal = client.modals.get(interaction.customId);

                    // Check if modal exist.
                    if (!modal) {
                        log.bug('Non supported interaction modal used:', interaction.customId);
                        return interaction.reply({ content: '🐛 It seems that this modal is not valid and cannot be executed.\nTry again later...', ephemeral: true });
                    }

                    // Create args array
                    const args = [];

                    // Push user input into args array.
                    for (const iterator of interaction.fields.components) {
                        args.push(iterator.components[0].value);
                    }

                    // Execute the modal.
                    return modal.execute(interaction, args);

                } catch (error) {
                    log.bug('Error with interactionCreate event', error);
                    return interaction.reply({ content: '🐛 An error occurred while executing this modal!', ephemeral: true })
                        .catch(err => log.bug('Error to send interaction response', err));
                }
            }

            case (interaction.isStringSelectMenu()): { // Select menu handler.
                try {
                    // Log who used this interaction.
                    log.info(`[${interaction.customId}] select menu used by '${interaction.user?.tag}' on the ${interaction.guild?.name ? `'${interaction.guild.name}' guild.` : 'direct message.'}`);

                    // Assing variable to a selection.
                    const selection = client.menus.get(interaction.customId);

                    // Check if selection exist.
                    if (!selection) {
                        log.bug('Non supported interaction selection menu used:', interaction.customId);
                        return interaction.reply({ content: '🐛 It seems like this selection menu is not valid and cannot be executed.\nTry again later...', ephemeral: true });
                    }

                    // Create args array
                    const args = [];

                    // Loop through interaction.values to get arguments into args array
                    for (const option of interaction.values) {
                        args.push(option);
                    }

                    // Execute the selection.
                    return selection.execute(interaction, args);
                } catch (error) {
                    log.bug('Error with interactionCreate event', error);
                    return interaction.reply({ content: '🐛 An error occurred while executing the selection menu!', ephemeral: true })
                        .catch(err => log.bug('Error to send interaction response', err));
                }
            }
        }
    },

};