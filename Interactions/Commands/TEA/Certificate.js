const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const { EmojiEnums, GuildEnums, GifEnums } = require('../../../Addons/Enums');
const { InteractionError } = require('../../../Addons/Classes');
const { apiCall } = require('../../../Addons/API');
const { addCertificateAttributesMenu } = require('../../Menus/TEA/certificateAttributeMenu');
const { certificateSubmitButtonBuilder } = require('../../Buttons/TEA/certificateSubmitButton');
const { convertMongoDateToMoment } = require('../../../Addons/Functions');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3).toLowerCase();

module.exports = {
    enabled: true,
    guild: GuildEnums.TEA,
    data: new SlashCommandBuilder()
        .setName(fileName)
        .setDescription('Certificate Management')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        // Find subcommand.
        .addSubcommand(subcommand =>
            subcommand
                .setName('find')
                .setDescription('Find a specific certificate')
                .addStringOption(option =>
                    option
                        .setName('guild-name')
                        .setDescription('Full name of the guild.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('guild-discord')
                        .setDescription('ID of the discord server.')
                        .setRequired(false)
                ))

        // Create subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new certificate.'))

        // Modify subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit existing certificate.')
                .addStringOption(option =>
                    option
                        .setName('guild-name')
                        .setDescription('Full name of the guild.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('guild-discord')
                        .setDescription('ID of the discord server.')
                        .setRequired(false)
                ))

        // Delete subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a certificate.')
                .addStringOption(option =>
                    option
                        .setName('guild-name')
                        .setDescription('Full name of the guild.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('guild-discord')
                        .setDescription('ID of the discord server.')
                        .setRequired(false)
                ))

        // List subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List of certificates')),

    async execute(interaction, args) {
        try {
            // Send a ephemeral reply.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`, ephemeral: true });

            // Destructure assignment
            const [subCmdName] = args;

            // Swtich to handle subcommands.
            switch (subCmdName) {
                case 'find': return findCert(interaction, reply); // /certificate find
                case 'create': return createCert(interaction, reply); // /certificate create
                case 'edit': return editCert(interaction, reply); // /certificate edit
                case 'delete': return deleteCert(interaction, reply); // /certificate delete
                case 'list': return listCert(interaction, reply); // /certificate list
                default: return reply.edit({ content: 'This command is not available yet.\nPlease try again later.' });
            }

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};

/**
 * Creates a new certificate.
 *
 * @param {Interaction} interaction - The Discord interaction object.
 * @param {Interaction} reply - The interaction object to reply.
 * @returns {Promise<void>} - Embed message with selection menu and a button to create the certificate.
 * @throws {InteractionError} - If there is an error during the creation process.
 */
async function createCert(interaction, reply) {
    try {
        // Embed template to modify with selection menu options.
        const templateEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Create a new club certificate')
            .setDescription('- In selection menu below pick an option to modify, all fields will be automatically updated in this message.\n- **IMPORTANT**: Representative field must be filled with discord user IDs separated by space or a comma.\n- You **MUST** fill all the required fields before submit button is displayed under the selection menu.')
            .addFields(
                { name: 'name', value: '*Value required*' },
                { name: 'discord', value: 'Not set' },
                { name: 'description', value: '*Value required*' },
                { name: 'joinworld', value: 'Not set' },
                { name: 'requirements', value: 'Not set' },
                { name: 'representatives', value: '*Value required*' },
            );

        // Add Create category
        templateEmbed.setAuthor({ name: 'CREATE', iconURL: interaction.client.user.displayAvatarURL() });

        // Make a new certificate template message
        const myNewReply = await reply.edit({ content: '', embeds: [templateEmbed] });

        // Set interaction object to the temporary data collection.
        interaction.client.tempData.set(interaction.user.id, { interaction });

        // Configures the selection menu
        addCertificateAttributesMenu(interaction, myNewReply);

    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

/**
 * Finds existing certificate.
 *
 * @param {Interaction} interaction - The Discord interaction object.
 * @param {Interaction} reply - The interaction object to reply.
 * @returns {Promise<void>} - Embed message formatted document from database.
 * @throws {InteractionError} - If there is an error during the creation process.
 */
async function findCert(interaction, reply) {
    try {
        // Destructure assignment
        const guildName = interaction.options.get('guild-name')?.value;
        const discordID = interaction.options.get('guild-discord')?.value;

        // Check if at least one field if filled.
        if (!guildName && !discordID) return reply.edit({ content: 'At least one field is required' });

        // Calling API to request club certificate data.
        const guildCert = await apiCall(`certificate/guild?${guildName ? `name=${guildName}` : ''}${discordID ? `&discord=${discordID}` : ''}`, 'GET');

        // Check if guild certificate exists.
        if (!guildCert) return reply.edit({ content: 'Certificate for this club has not been found.' });

        // Create embed with data.
        const browseEmbed = new EmbedBuilder()
            .setColor('White')
            .setTitle(`Browsing ${guildCert.name}'s certificate.`)
            .setImage(GifEnums.GIF6)
            .setAuthor({ name: 'BROWSE', iconURL: interaction.client.user.displayAvatarURL() })
            .setFooter({ text: guildCert._id, iconURL: interaction.client.user.displayAvatarURL() })
            .addFields(
                { name: 'name', value: guildCert.name ? guildCert.name : 'Value is not set' },
                { name: 'discord', value: guildCert.discord ? guildCert.discord : 'Value is not set' },
                { name: 'description', value: guildCert.description ? guildCert.description : 'Value is not set' },
                { name: 'joinworld', value: guildCert.joinworld ? guildCert.joinworld : 'Value is not set' },
                { name: 'requirements', value: guildCert.requirements ? guildCert.requirements : 'Value is not set' },
                { name: 'representatives', value: guildCert.representatives ? guildCert.representatives : 'Value is not set' },
                { name: 'joined', value: guildCert.joined ? convertMongoDateToMoment(guildCert.joined) : 'Value is not set' },
            );

        // Modify the response with the embed data.
        reply.edit({ content: '', embeds: [browseEmbed] });
    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

/**
 * Edits a certificate.
 *
 * @param {Interaction} interaction - The Discord interaction object.
 * @param {Interaction} reply - The interaction object to reply.
 * @returns {Promise<void>} - Embed message with selection menu and a button to edit a certificate.
 * @throws {InteractionError} - If there is an error during the editting process.
 */
async function editCert(interaction, reply) {
    try {
        // Destructure assignment
        const guildName = interaction.options.get('guild-name')?.value;
        const discordID = interaction.options.get('guild-discord')?.value;

        // Check if at least one field is filled in.
        if (!guildName && !discordID) return reply.edit({ content: 'At least one field filled is required!' });

        // Calling API to request club certificate data.
        const guildCert = await apiCall(`certificate/guild?${guildName ? `name=${guildName}` : ''}${discordID ? `&discord=${discordID}` : ''}`, 'GET');

        // Check if guild certificate exists.
        if (!guildCert) return reply.edit({ content: 'Certificate for this club has not been found.' });

        // Check if interactor is part of the representatives.
        if (!guildCert.representatives.split(' ').includes(interaction.user.id) && !process.env.BOT_OWNERS.split(' ').includes(interaction.user.id)) return reply.edit({ content: `You are not a representative of **${guildCert.name}**.`, ephemeral: true });

        // Create object
        const certificate = {
            _id: guildCert._id,
            name: guildCert.name,
            discord: guildCert.discord === null ? 'Not set' : guildCert.discord,
            description: guildCert.description,
            joinworld: guildCert.joinworld === null ? 'Not set' : guildCert.joinworld,
            requirements: guildCert.requirements === null ? 'Not set' : guildCert.requirements,
            representatives: guildCert.representatives
        };

        // Make a new collection with the interaction message to edit later.
        interaction.client.tempData.set(interaction.user.id, { interaction, certificate });

        // Create embed with data.
        const modifyEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`Modifying ${certificate.name}'s club certificate`)
            .setDescription('- In selection menu below pick an option to modify, all fields will be automatically updated in this message.\n- **IMPORTANT**: Representative field must be filled with discord user IDs separated by space or a comma.\n- You **MUST** fill all the required fields before submit button is displayed under the selection menu.')
            .setAuthor({ name: 'MODIFY', iconURL: interaction.client.user.displayAvatarURL() })
            .setFooter({ text: guildCert._id, iconURL: interaction.client.user.displayAvatarURL() })
            .addFields(
                { name: 'name', value: certificate.name },
                { name: 'discord', value: certificate.discord },
                { name: 'description', value: certificate.description },
                { name: 'joinworld', value: certificate.joinworld },
                { name: 'requirements', value: certificate.requirements },
                { name: 'representatives', value: certificate.representatives },
            );

        // Set the embed into the reply
        const myNewReply = await reply.edit({ content: '', embeds: [modifyEmbed] });

        // Configures the select menu
        addCertificateAttributesMenu(interaction, myNewReply);

    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

/**
 * Deletes a certificate.
 *
 * @param {Interaction} interaction - The Discord interaction object.
 * @param {Interaction} reply - The interaction object to reply.
 * @returns {Promise<void>} - Embed message with a button to delete a certificate.
 * @throws {InteractionError} - If there is an error during the deletion process.
 */
async function deleteCert(interaction, reply) {
    try {
        // Destructure Assignment.
        const guildName = interaction.options.get('guild-name')?.value;
        const discordID = interaction.options.get('guild-discord')?.value;

        // Check if at least one field is filled in.
        if (!guildName && !discordID) return reply.edit({ content: 'At least one field filled is required!' });

        // Calling API to request club certificate data.
        const guildCert = await apiCall(`certificate/guild?${guildName ? `name=${guildName}` : ''}${discordID ? `&discord=${discordID}` : ''}`, 'GET');

        // Check if guild certificate exists.
        if (!guildCert) return reply.edit({ content: 'Certificate for this club has not been found.' });

        // Create object
        const certificate = {
            _id: guildCert._id,
            name: guildCert.name,
            discord: guildCert.discord === null ? 'Not set' : guildCert.discord,
            description: guildCert.description,
            joinworld: guildCert.joinworld === null ? 'Not set' : guildCert.joinworld,
            requirements: guildCert.requirements === null ? 'Not set' : guildCert.requirements,
            representatives: guildCert.representatives
        };

        // Make a new collection with the interaction message to edit later.
        interaction.client.tempData.set(interaction.user.id, { interaction, certificate });

        // Create embed with data.
        const deleteEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`${certificate.name}'s club certificate`)
            .setDescription('- **IMPORTANT**: Please make sure this is the certificate you want to delete.\n\n ⚠️ **THIS OPERATION CANNOT BE UNDONE** ⚠️')
            .setAuthor({ name: 'DELETE', iconURL: interaction.client.user.displayAvatarURL() })
            .setFooter({ text: guildCert._id, iconURL: interaction.client.user.displayAvatarURL() })
            .addFields(
                { name: 'name', value: certificate.name },
                { name: 'discord', value: certificate.discord },
                { name: 'description', value: certificate.description },
                { name: 'joinworld', value: certificate.joinworld },
                { name: 'requirements', value: certificate.requirements },
                { name: 'representatives', value: certificate.representatives },
            );

        // Set the embed into the reply
        reply.edit({ content: '', embeds: [deleteEmbed], components: [new ActionRowBuilder().addComponents(certificateSubmitButtonBuilder.setLabel('Delete Certificate').setStyle(ButtonStyle.Danger))] });

    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}

async function listCert(interaction, reply) {
    try {

        // Create List Embed
        const listEmbed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle('Club Certificate List')
            .setDescription('Below here are the list of Club Certificates that are part of the Trove Ethics Alliance.')
            .setAuthor({ name: 'LIST', iconURL: interaction.client.user.displayAvatarURL() });

        const api = await apiCall('certificate/guild?list=true', 'GET');

        // For every Club Certificate in the database, add a field to the embed with the Club name and its discord Server ID.
        for (const club of api) {
            listEmbed.addFields({ name: club.name, value: `Server ID: ${club.discord ? club.discord : 'Not Set'}` });
        }

        reply.edit({ content: '', embeds: [listEmbed] });
    } catch (error) {
        new InteractionError(interaction, fileName).issue(error);
    }
}