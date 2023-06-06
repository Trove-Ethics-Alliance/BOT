/**
 * Finds an emoji by name on a specific guild and returns its string representation.
 *
 * @param {import("discord.js").Client} client - The Discord client instance.
 * @param {string} emojiName - The name of the emoji to find.
 * @returns {string} The string representation of the emoji, or '🐛' if the emoji is not found.
 */
function findEmoji(client, emojiName) {
    const guild = client.guilds.cache.get(process.env.TEA_GUILD_ID); // get the guild object from the cache
    const emoji = guild.emojis.cache.find(e => e.name === emojiName); // find the emoji by name

    if (emoji) {
        return emoji.toString();
    } else {
        return '🐛';
    }
}

module.exports = {
    findEmoji
};