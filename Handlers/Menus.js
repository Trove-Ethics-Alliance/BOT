const { Collection } = require('discord.js');
const log = require('../Addons/Logger');
const AsciiTable = require('ascii-table');
const { glob } = require('glob');
const path = require('path');

/**
* Loads application interaction menu handler.
* @param {Discord.Client} client - The Discord.js client instance.
* @returns {Promise<string>} - A promise that resolves with a table of loaded menus as a string, or rejects with an error message.
* @example await loadAppMenus(client).then(function).catch(error);
*/
const loadAppMenus = (client) =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve, reject) => {
        log.debug('[LOAD MENUS] Started loading application interaction selection menu handler.');

        // Create a new table.
        const table = new AsciiTable('Application Interaction Selection Menus');
        table.setHeading('Status', 'Name', 'File');

        // Application interaction collection.
        client.menus = new Collection();

        try {
            // Load application interaction menus files.
            const appMenuFiles = await glob('Interactions/Menus/**/*.js');

            for (const file of appMenuFiles) {
                try {
                    // Get full path to the menu file.
                    const menu_dir_root = path.join(process.cwd(), file);

                    // Assign variable to a menu file.
                    const menuInteraction = require(menu_dir_root);

                    // Check if menu has name.
                    if (!menuInteraction?.name) {
                        log.bug('This menu doesn\'t have a name variable:', file);
                        continue;
                    }

                    // Log menu being loaded.
                    log.debug(`[LOAD MENUS] Loaded '${menuInteraction.name}' application interaction selection menu.`);

                    // Add table row for this menu.
                    table.addRow(
                        menuInteraction.enabled ? 'ENABLED' : 'DISABLED',
                        menuInteraction.name,
                        file.split('/').slice(-4).join('/')
                    );

                    // Check if menu is disabled.
                    if (!menuInteraction.enabled) {
                        continue;
                    }

                    // Set menu into menus collector.
                    client.menus.set(menuInteraction.name, menuInteraction);

                } catch (error) {
                    reject(`Error loading application interaction selection menu file '${file}': ${error.message}`);
                }
            }

            // Send a log when there are no menus loaded.
            if (client.menus.size === 0) {
                resolve('[LOAD MENUS] ❌ No enabled interaction selection menus were found.');
            } else {
                resolve(table.toString());
            }
        } catch (error) {
            reject(`Error loading application interaction selection menu files: ${error.message}`);
        }

        log.debug('🆗 [LOAD MENUS] Finished loading application interaction selection menu handler.');
    });

module.exports = loadAppMenus;
