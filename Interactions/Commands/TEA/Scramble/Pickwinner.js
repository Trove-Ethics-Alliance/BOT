const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const { EmojiEnums, GuildEnums } = require('../../../../Addons/Enums');

const { InteractionError } = require('../../../../Addons/Classes');
const { scrambleRanksMenuRow } = require('../../../Menus/TEA/Scramble/scrambleRanksMenu');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3).toLowerCase();

module.exports = {
    enabled: true,
    guild: GuildEnums.TEA,
    data: new SlashCommandBuilder()
        .setName(fileName)
        .setDescription('Pick winners for scramble event')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addIntegerOption((option) =>
            option
                .setName('amount')
                .setDescription('Amount of winners for the event')
                .setRequired(true)
        ),


    async execute(interaction, args) {
        try {
            // Create reply to defer the command execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });
            const [amount] = args; // Destructuring assignment

            return reply.edit({
                content: `Select ranks to choose ${amount} winner(s) from.`, components: [scrambleRanksMenuRow]
            });

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    },
};
