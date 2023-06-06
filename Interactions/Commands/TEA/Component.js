const { ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const { EmojiEnums, GuildEnums } = require('../../../Addons/Enums');
const { InteractionError } = require('../../../Addons/Classes');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3).toLowerCase();

module.exports = {
    enabled: true,
    guild: GuildEnums.TEA,
    data: new SlashCommandBuilder()
        .setName(fileName)
        .setDescription('This interaction gives you the ability to add components buttons to your guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        // Set the commandGroup for creating the interaction for guild.
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Creates a component button with application system for followed club.')
                .addStringOption(option =>
                    option
                        .setName('intraction-option')
                        .setDescription('Choose an interaction to create')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Laezaria Club Button', value: 'laezClubApplyButton' },
                            { name: 'Laezaria Verify Button', value: 'laezClubVerifyButton' },
                            { name: 'THE NORTH Club Button', value: 'northClubApplyButton' },
                        ))
                .addStringOption(option =>
                    option
                        .setName('channel-id')
                        .setDescription('Channel ID for the component to create')
                        .setRequired(true)
                )
        ),

    async execute(interaction, args) {
        try {
            // Create reply to defer the command execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });
            const [subCmd, interationName, channelID] = args; // Destructuring assignment

            // Check if channel ID is a number
            if (!Number.isInteger(Number(channelID))) {
                return await reply.edit({ content: 'Channel ID is not a valid number.' });
            }

            // Get the channel object from its ID.
            const tChannel = await interaction.client.channels.cache.get(channelID);

            // Check if tChannel is an object.
            if (!tChannel) return await reply.edit({ content: 'Channel with provided ID is not found.' });

            // Laezaria Add Application Button.
            if (subCmd === 'create') {

                // Assing variable to a interaction object.
                const button = interaction.client.buttons.get(interationName);

                // Check if interaction is valid and has builder method.
                if (!button?.builder) {
                    return reply.edit({ content: 'This interaction not exist or doesn\'t have a builder available.' });
                }

                // Create a new instance of ActionRowBuilder.
                const row = new ActionRowBuilder()
                    .addComponents(button.builder);

                // Send a message to the target channel and edit reply to indicate success.
                await tChannel.send({ components: [row] })
                    .then(msg => {
                        reply.edit({ content: `Interaction has been sent to: ${msg.url}` });
                    });
            }
        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    },
};
