const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const { EmojiEnums, GuildEnums } = require('../../../Addons/Enums');
const { InteractionError } = require('../../../Addons/Classes');

// Constants
const PING_THRESHOLD = [150, 300];
const STATUS_EMOJIS = ['✨', '🆗', '❗'];

// Get file name.
const fileName = path.basename(__filename).slice(0, -3).toLowerCase();

module.exports = {
	enabled: true,
	guild: GuildEnums.GLOBAL,
	data: new SlashCommandBuilder()
		.setName(fileName)
		.setDescription('Returns websocket connection ping.')
		.setDMPermission(false),

	async execute(interaction) {
		try {
			// Create reply to defer the command execution.
			const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });

			// Fake 2s delay to appear as if the bot is doing something 😂
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Get websocket ping value.
			const ping = Math.round(interaction.client.ws.ping);

			// Find the appropriate status based on the ping.
			const statusIndex = PING_THRESHOLD.findIndex((threshold) => ping < threshold);

			// if the ping is less than the first threshold, return the first status emoji
			// if the ping is greater than or equal to the last threshold, return the last status emoji
			// otherwise, return the status emoji corresponding to the current threshold
			const status = statusIndex === 0 ? STATUS_EMOJIS[0] : statusIndex === -1 ? STATUS_EMOJIS[STATUS_EMOJIS.length - 1] : STATUS_EMOJIS[statusIndex];

			// Example: if ping is below 150, statusIndex will be 0, and status will be '✨'
			// Example: if ping is above 150 and below 300, statusIndex will be 1, and status will be '🆗'
			// Example: if ping is 300 and above, statusIndex will be -1, and status will be '❗'

			// Send a reply with the appropriate status.
			await reply.edit({
				content: `> ${status} Websocket latency is **${ping}** ms.`,
			});

		} catch (error) {
			new InteractionError(interaction, fileName).issue(error);
		}
	}
};