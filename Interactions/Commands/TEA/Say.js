const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v9');
const log = require('../../../Addons/Logger');
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
        .setDescription('Say something using the bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addStringOption((option) =>
            option
                .setName('text')
                .setDescription('Text to send (OPTIONAL)')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('attachment')
                .setDescription('URL to an image (OPTIONAL)')
                .setRequired(false)
        ),

    async execute(interaction, args) {
        try {
            const [text, attachment] = args; // Destructuring assignment

            // Create reply to defer the command execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Sending message...`, ephemeral: true });

            // Assign values to variables.
            const content = text ?? null;

            // Send a joke empty message if no arguments are passed.
            if (!args.length) {
                return await interaction.channel.send({ content: 'ㅤ', })
                    .then(async msg => {
                        await reply.edit({ content: `✅ Your **EMPTY** message (${msg.url}) has been sent correctly 🙃` });
                    });
            }

            // Send a message with the attachment argument.
            if (attachment) {
                // Send channel message with an attachment.
                return await interaction.channel.send({ content, files: [attachment] })
                    .then(async msg => {
                        await reply.edit({ content: `✅ Your message (${msg.url}) has been sent correctly.` });
                    });
            }

            // Send a message with just regular text content.
            await interaction.channel.send({ content })
                .then(async msg => {
                    await reply.edit({ content: `✅ Your message (${msg.url}) has been sent correctly.` });
                });

        } catch (error) {
            // Send an error message to the user about missing permissions.
            if (error?.message === 'Missing Permissions') {
                await interaction.editReply({
                    content: `Make sure ${interaction.client.user} has 'Send Messages' and/or 'Attach Files' permission to perform this action.`,
                    ephemeral: true
                }).catch((editError) => log.bug(`[/${fileName}] Error editing interaction reply:`, editError));
            }

            // Default error message to the user.
            new InteractionError(interaction, fileName).issue(error);
        }
    },
};
