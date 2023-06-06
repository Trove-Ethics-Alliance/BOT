const { Collection } = require('discord.js');
const log = require('../Addons/Logger');
const AsciiTable = require('ascii-table');
const { glob } = require('glob');
const path = require('path');

/**
* Loads application interaction button handler.
* @param {Discord.Client} client - The Discord.js client instance.
* @returns {Promise<string>} - A promise that resolves with a table of loaded buttons as a string, or rejects with an error message.
* @example await loadAppButtons(client).then(function).catch(error);
*/
const loadAppButtons = (client) =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve, reject) => {
        log.debug('[LOAD BUTTONS] Started loading application interaction button handler.');

        // Create a new table.
        const table = new AsciiTable('Application Interaction Buttons');
        table.setHeading('Status', 'Name', 'File');

        // Application interaction collection.
        client.buttons = new Collection();

        try {
            // Load application interaction button files.
            const appButtonFiles = await glob('Interactions/Buttons/**/*.js');

            for (const file of appButtonFiles) {
                try {

                    // Get full path to the button file.
                    const button_dir_root = path.join(process.cwd(), file);

                    // Assign variable to a button file.
                    const buttonInteraction = require(button_dir_root);

                    // Check if button has name.
                    if (!buttonInteraction?.name) {
                        log.bug('This button doesn\'t have a name variable:', file);
                        continue;
                    }

                    // Log button being loaded.
                    log.debug(`[LOAD BUTTONS] Loaded '${buttonInteraction.name}' application interaction button.`);

                    // Add table row for this button.
                    table.addRow(
                        buttonInteraction.enabled ? 'ENABLED' : 'DISABLED',
                        buttonInteraction.name,
                        file.split('/').slice(-4).join('/')
                    );

                    // Check if button is disabled.
                    if (!buttonInteraction.enabled) {
                        continue;
                    }

                    // Set button into buttons collector.
                    client.buttons.set(buttonInteraction.name, buttonInteraction);

                } catch (error) {
                    reject(`Error loading application interaction button file '${file}': ${error.message}`);
                }
            }

            // Send a log when there are no buttons loaded.
            if (client.buttons.size === 0) {
                resolve('[LOAD BUTTONS] ❌ No enabled interaction buttons were found.');
            } else {
                resolve(table.toString());
            }
        } catch (error) {
            reject(`Error loading application interaction button files: ${error.message}`);
        }

        log.debug('🆗 [LOAD BUTTONS] Finished loading application interaction button handler.');
    });

module.exports = loadAppButtons;
