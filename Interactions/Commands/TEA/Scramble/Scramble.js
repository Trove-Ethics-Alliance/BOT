const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const { GuildEnums, EmojiEnums } = require('../../../../Addons/Enums');
const { InteractionError } = require('../../../../Addons/Classes');
const { showCreateScrambleCodeModal } = require('../../../Modals/TEA/Scramble/scrambleCreateCodeModal');
const { showEditScrambleCodeModal } = require('../../../Modals/TEA/Scramble/scrambleEditCodeModal');
const { apiCall } = require('../../../../Addons/API');
const { convertMongoDateToMoment } = require('../../../../Addons/Functions');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3).toLowerCase();

module.exports = {
    enabled: true,
    guild: GuildEnums.TEA,
    data: new SlashCommandBuilder()
        .setName(fileName)
        .setDescription('Manage scramble event codes')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommandGroup(subcommandgroup =>
            subcommandgroup
                .setName('code')
                .setDescription('Manage scramble event codes')

                .addSubcommand(subcommand =>
                    subcommand
                        .setName('list')
                        .setDescription('List all the scramble event codes')
                        .addStringOption(option =>
                            option
                                .setName('code-id')
                                .setDescription('Enter spefic event code identifier you wish to see the details of')
                                .setRequired(false)
                        )
                )

                .addSubcommand(subcommand =>
                    subcommand
                        .setName('create')
                        .setDescription('Create a new scramble event code')
                )

                .addSubcommand(subcommand =>
                    subcommand
                        .setName('edit')
                        .setDescription('Edit an existing scramble event code')
                        .addStringOption(option =>
                            option
                                .setName('code-id')
                                .setDescription('Enter the ID of the scramble event code you wish to edit')
                                .setRequired(true)
                        ))

                .addSubcommand(subcommand =>
                    subcommand
                        .setName('delete')
                        .setDescription('Delete an existing scramble event code')
                        .addStringOption(option =>
                            option
                                .setName('code-id')
                                .setDescription('Enter the ID of the scramble event code you wish to delete')
                                .setRequired(true)
                        )
                )
        ),

    async execute(interaction, args) {

        const [subcmdgrp, subcmd, value] = args;
        try {

            // Loop true with command logic.
            switch (true) {
                case (subcmdgrp === 'code' && subcmd === 'list'): return listCodes(value);
                case (subcmdgrp === 'code' && subcmd === 'create'): return showCreateScrambleCodeModal(interaction);
                case (subcmdgrp === 'code' && subcmd === 'edit'): return showEditScrambleCodeModal(interaction, value);
                case (subcmdgrp === 'code' && subcmd === 'delete'): return interaction.reply('delete a new scramble event code');
                default: return interaction.reply('That command is not yet implemented');
            }

            // Function to display the list of scramble event codes.
            async function listCodes(arg) {
                // Create reply to defer the command execution.
                const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });

                // Get API response.
                const APIres = await apiCall(`event/scramble/code?id=${arg ? arg : ''}`, 'GET');

                // If optional code ID is provided, get the code details.
                if (arg) {

                    // Reply when there is no API response with the code.
                    if (!APIres) return await reply.edit({ content: '🥶 This event code does not exist!' });

                    // Reply with the code details.
                    return await reply.edit({ content: `## Summary of \`${APIres._id}\` scramble event code.\nID: \`${APIres.id}\`\nDifficulty: ${stringDifficulty(APIres.difficulty)}\nEnabled:\`${APIres.enabled ? '🟢' : '🔴'}\`\nHint: \`${APIres.tip ? APIres.tip : 'This code doesn\'t have a hint.'}\`\nCreated at: \`${convertMongoDateToMoment(APIres.created, true)}\`` })

                    // Function with more human friendly representation of the code difficulty.
                    function stringDifficulty(difficulty) {
                        switch (true) {
                            case difficulty === 1: return '💀 Hard (1)'
                            case difficulty === 2: return '👌 Medium (2)'
                            case difficulty === 3: return '🤣 Easy (3)'
                            default: 'Invalid difficulty'
                        }
                    }
                }

                // Make a string representation of code IDs.
                const resultString = APIres.map(code => `\`${code.id}\``).join(' • ');

                // Get a random index of the list of codes.
                const randomIndex = Math.floor(Math.random() * APIres.length);

                // Send reply to the user.
                await reply.edit({ content: `# Scramble event codes\n> for details of each code: e.g.: '/scramble code list ${APIres[0]?.id ? APIres[randomIndex].id : 'tea1234'}'.\n${resultString}` });
            }

        } catch (error) {
            console.error(error);
            new InteractionError(interaction, fileName).issue(error);
        }
    },
};
