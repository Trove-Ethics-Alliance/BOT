const { Collection } = require('discord.js');
const log = require('../Addons/Logger');
const AsciiTable = require('ascii-table');
const { glob } = require('glob');
const path = require('path');

/**
* Loads application interaction modal handler.
* @param {Discord.Client} client - The Discord.js client instance.
* @returns {Promise<string>} - A promise that resolves with a table of loaded modals as a string, or rejects with an error message.
* @example await loadAppModals(client).then(function).catch(error);
*/
const loadAppModals = (client) =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve, reject) => {
        log.debug('[LOAD MODALS] Started loading application interaction modal handler.');

        // Create a new table.
        const table = new AsciiTable('Application Interaction Modals');
        table.setHeading('Status', 'Name', 'File');

        // Application interaction collection.
        client.modals = new Collection();

        try {
            // Load application interaction modals files.
            const appModalFiles = await glob('Interactions/Modals/**/*.js');

            for (const file of appModalFiles) {
                try {
                    // Get full path to the modal file.
                    const modal_dir_root = path.join(process.cwd(), file);

                    // Assign variable to a modal file.
                    const modalInteraction = require(modal_dir_root);

                    // Check if modal has name.
                    if (!modalInteraction?.name) {
                        log.bug('This modal doesn\'t have a name variable:', file);
                        continue;
                    }

                    // Log modal being loaded.
                    log.debug(`[LOAD MODALS] Loaded '${modalInteraction.name}' application interaction modal.`);

                    // Add table row for this modal.
                    table.addRow(
                        modalInteraction.enabled ? 'ENABLED' : 'DISABLED',
                        modalInteraction.name,
                        file.split('/').slice(-4).join('/')
                    );

                    // Check if modal is disabled.
                    if (!modalInteraction.enabled) {
                        continue;
                    }

                    // Set modal into modals collector.
                    client.modals.set(modalInteraction.name, modalInteraction);

                } catch (error) {
                    reject(`Error loading application interaction modal file '${file}': ${error.message}`);
                }
            }

            // Send a log when there are no modals loaded.
            if (client.modals.size === 0) {
                resolve('[LOAD MODALS] ❌ No enabled interaction modals were found.');
            } else {
                resolve(table.toString());
            }
        } catch (error) {
            reject(`Error loading application interaction modal files: ${error.message}`);
        }

        log.debug('🆗 [LOAD MODALS] Finished loading application interaction modal handler.');
    });

module.exports = loadAppModals;
