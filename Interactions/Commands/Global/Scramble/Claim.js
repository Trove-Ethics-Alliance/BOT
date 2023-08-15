const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const { EmojiEnums, GuildEnums } = require('../../../../Addons/Enums');
const { InteractionError } = require('../../../../Addons/Classes');
const { apiCall } = require('../../../../Addons/API');
const { ScrambleEnums } = require('../../../../Addons/TempEnums');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3).toLowerCase();

module.exports = {
    enabled: true,
    guild: GuildEnums.GLOBAL,
    data: new SlashCommandBuilder()
        .setName(fileName)
        .setDescription('Claim scramble 2023 event code')

        .addStringOption((option) =>
            option
                .setName('code')
                .setDescription('Code to claim')
                .setMaxLength(128)
                .setRequired(true)
        ),

    async execute(interaction, args) {
        try {
            const [text] = args; // Destructuring assignment

            // Create reply to defer the command execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });

            // Get data from the API.
            const APIres = await apiCall(`event/scramble/code/claim?id=${text}&user=${interaction.user.id}`);

            // Edit the reply with the results.
            reply.edit({ content: `> <#${ScrambleEnums.NOTIF_CHANNEL_ID}>\n\`\`\`You have claimed '${APIres.code.id}' code and ${APIres.code.difficulty} point(s) were added to your account.\`\`\`\n> Your current rank is **${APIres.participant.rank}** with **${APIres.participant.points}** out of **${APIres.total}** points.\n\`So far you have accumulated ~${APIres.percentage}% of the total points available in this event.\`` });
        } catch (error) {
            // Default error message to the user.
            new InteractionError(interaction, fileName).issue(error);
        }
    },
};
