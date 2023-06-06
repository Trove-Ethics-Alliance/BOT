const { ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const path = require('path');
const { EmojiEnums } = require('../../../../Addons/Enums');
const { NorthEnums } = require('../../../../Addons/TempEnums');
const { InteractionError } = require('../../../../Addons/Classes');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Button builder for THE NORTH's Request invite button.
const northClubApplyRequestInviteButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setLabel('Request')
    .setStyle(ButtonStyle.Success);

module.exports = {
    enabled: true,
    name: fileName,
    northClubApplyRequestInviteButtonBuilder,
    async execute(interaction) { // Logic when user interact with this button.

        try {
            // Create reply to defer the button execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing response...`, ephemeral: true });

            // Create a Request Sent Embed
            const requestSentEmbed = new EmbedBuilder()
                .setTitle('Request Sent, You should be invited into the club soon!')
                .setDescription('Be patient! you are almost there!')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setColor('Green')
                .setImage(NorthEnums.CLUB_LOGO_URL)
                .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

            // Send message to THE NORTH's inbox channel to inform staff that applicant is ready for a club invite.
            const inboxChannel = await interaction.client.channels.fetch(NorthEnums.channels.INBOX_ID);
            await inboxChannel.send(`<@${interaction.user.id}> is ready to be invited to THE NORTH`);

            // Check if applicant has been invited to the club yet (has the member role) if not send another message to inbox channel tagging Staff members
            setTimeout(async () => {
                const guild = await interaction.client.guilds.fetch(NorthEnums.GUILD_ID);
                const member = await guild.members.fetch(interaction.user.id);
                if (!member.roles.cache.has(NorthEnums.roles.MEMBER_ID)) {
                    await inboxChannel.send(`Reminder <@&${NorthEnums.roles.STAFF_ID}>, <@${interaction.user.id}> is ready to be invited to THE NORTH`);
                }
            }, 1000 * 60 * 5); // 5minute reminder.

            // Fetch DM channel.
            await interaction.user.createDM();

            // Edit the interacted message to update to Request Sent embed and remove the request button to prevent spam.
            interaction.message.edit({ content: null, embeds: [requestSentEmbed], components: [] });

            // Edit reply to confirm that request was sent.
            reply.edit({ content: 'Invite request has been sent...' });
        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};