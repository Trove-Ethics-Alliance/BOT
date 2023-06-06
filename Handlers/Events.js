const AsciiTable = require('ascii-table');
const { glob } = require('glob');
const path = require('path');
const log = require('../Addons/Logger');

const eventHandler = client =>
	// eslint-disable-next-line no-async-promise-executor
	new Promise(async (resolve, reject) => {
		log.debug('[EVENT HANDLER] Started loading event handler.');

		// Create a new table.
		const table = new AsciiTable('Application Event Listeners');
		table.setHeading('Name', 'File location');

		try {
			const appEventFiles = await glob('Events/*.js');

			for (const file of appEventFiles) {
				try {
					// Get full path to the event file.
					const event_dir_root = path.join(process.cwd(), file);

					const event = require(event_dir_root);
					if (!event.name) return;

					if (event.once) client.once(event.name, (...args) => event.execute(client, ...args));
					else client.on(event.name, (...args) => event.execute(client, ...args));

					table.addRow(event.name, file.split('/').slice(-3).join('/'));
				} catch (error) {
					reject(`Error loading application event file '${file}': ${error.message}`);
				}
			}

			// Resolve with table.
			resolve(table.toString());

		} catch (error) {
			reject(`Error loading application event files: ${error.message}`);
		}

		resolve('[EVENT HANDLER] ✅ Successfully loaded application event handler.');
		log.debug('🆗 [EVENT HANDLER] Finished resolving application event handler.');
	});


module.exports = eventHandler;