const { ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const path = require('path');
const { NorthEnums } = require('../../../../Addons/TempEnums');
const { InteractionError } = require('../../../../Addons/Classes');
const { EmojiEnums } = require('../../../../Addons/Enums');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Button builder for THE NORTH's Confirm invite Button.
const northClubApplyConfirmInviteButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setLabel('Confirm')
    .setStyle(ButtonStyle.Success);

module.exports = {
    enabled: true,
    name: fileName,
    northClubApplyConfirmInviteButtonBuilder,
    async execute(interaction) { // Logic when user interacts with the button.

        try {
            // Create reply to defer the button execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing response...`, ephemeral: true });

            // Check if interactor has permission to interact with the button.
            const member = await interaction.guild.members.fetch(interaction.user.id);
            if (!member.roles.cache.has(NorthEnums.roles.GRANDCOUSIL_ID) && !member.roles.cache.has(NorthEnums.roles.KINGSGUARD_ID) && !member.roles.cache.has(NorthEnums.roles.KNIGHT_ID) && !member.roles.cache.has(NorthEnums.roles.DEV_ID) && !member.roles.cache.has(NorthEnums.roles.ADMIN_ID)) {
                return reply.edit({ content: 'You are not authorised to perform this action!' });
            }

            // Variable with original embed data
            const originalEmbed = await interaction.message.embeds[0];
            const originalEmbedDescription = originalEmbed.description.split('\n');

            // Get a new embed instance for this interaction message.
            const newEmbed = new EmbedBuilder()
                .setTitle('Application succesfully finished')
                .setDescription(`${EmojiEnums.APPROVE} Request is **CLOSED**\n${originalEmbedDescription[1]} and confirmed by ${interaction.user}.`)
                .setColor('Green')
                .setImage(originalEmbed.image.url)
                .setThumbnail(originalEmbed.thumbnail.url)
                .setFooter(originalEmbed.footer)
                .setTimestamp()
                .setFields(originalEmbed.fields);

            // Change applicant's server nickname and roles
            const userMember = await interaction.guild.members.fetch(newEmbed.data.footer.text);
            await userMember.setNickname(newEmbed.data.fields[2].value.replace(/`/g, ''));
            await userMember.roles.add(NorthEnums.roles.MEMBER_ID);
            await userMember.roles.remove(NorthEnums.roles.GUEST_ID);

            // Edit the interacted message to the new embed and remove components.
            interaction.message.edit({ embeds: [newEmbed], components: [] });

            // Send the response to the interaction.
            reply.edit({ content: 'You have successfully confirmed this application!' });

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};