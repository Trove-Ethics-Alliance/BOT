const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const path = require('path');
const { northClubApplyConfirmInviteButtonBuilder } = require('../NORTH/northClubApplyConfirmInviteButton');
const { northClubApplyRequestInviteButtonBuilder } = require('../NORTH/northClubApplyRequestInviteButton');
const { InteractionError } = require('../../../../Addons/Classes');
const { EmojiEnums } = require('../../../../Addons/Enums');
const { NorthEnums } = require('../../../../Addons/TempEnums');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Button builder for THE NORTH's approve button.
const northClubApplyApproveButtonBuilder = new ButtonBuilder()
    .setCustomId(fileName)
    .setLabel('Approve')
    .setStyle(ButtonStyle.Success);

module.exports = {
    enabled: true,
    name: fileName,
    northClubApplyApproveButtonBuilder,
    async execute(interaction) {// Logic when user interact with this button

        try {
            // Create reply to defer the button execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing response...`, ephemeral: true });

            // Check if interactor has the necessary permissions to interact with this button
            const member = await interaction.guild.members.fetch(interaction.user.id);
            if (!member.roles.cache.has(NorthEnums.roles.GRANDCOUSIL_ID) && !member.roles.cache.has(NorthEnums.roles.DEV_ID) && !member.roles.cache.has(NorthEnums.roles.ADMIN_ID)) {
                return reply.edit({ content: 'You are not authorised to perform this action!', ephemeral: true });
            }

            // Variable with original embed data
            const originalEmbed = await interaction.message.embeds[0];

            // Get a new embed instance for this interaction message.
            const newEmbed = new EmbedBuilder()
                .setTitle('Application awaiting for confirmation')
                .setDescription(`${EmojiEnums.APPROVE} Request is **APPROVED**\nApproved by ${interaction.user}`)
                .setColor('Orange')
                .setImage(originalEmbed.image.url)
                .setThumbnail(originalEmbed.thumbnail.url)
                .setFooter(originalEmbed.footer)
                .setTimestamp()
                .setFields(originalEmbed.fields);

            // Create a embed to notify applicant that their club application has been approved
            const dmEmbed = new EmbedBuilder()
                .setTitle('Congratulation!\nYour application to THE NORTH has been approved!')
                .setDescription('You are now a part of THE NORTH, all that is left to do is invite you to the club on Trove!')
                .setColor('Green')
                .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                .setThumbnail(originalEmbed.thumbnail.url)
                .setFields({
                    name: 'Club Invite Step',
                    value: 'It\'s simple, all you have to do is, when you are in game and ready to join, press the request button below and it will inform our Staff team that you are ready to join!\nEnjoy!'
                });

            // Boolean variable to indicate whether direct message is received or not.
            let dmSentBoolean = true;

            // ActionRow with applicant button to request for an invite to the club
            const applicantApplicationActionRow = new ActionRowBuilder()
                .addComponents(northClubApplyRequestInviteButtonBuilder);

            // Send a direct message to the applicant with application results.
            const userMember = await interaction.guild.members.fetch(newEmbed.data.footer.text);
            await userMember.send({ embeds: [dmEmbed], components: [applicantApplicationActionRow] })
                .catch(() => dmSentBoolean = false); // Change dmSentBoolean variable to false if DM wasn't sent successfully.

            // String with summary for user that interacted.
            let summaryString = `You have approved ${newEmbed.data.fields[0].value}'s application successfully.`;

            // Check if applicantreceived a direct message and update summary string accordingly.
            if (!dmSentBoolean) {
                summaryString = summaryString + '\nHowever, direct message is not received due to privacy settings of this user.';
            }

            // ActionRow with staff button to confirm the invitation of applicant upon approval
            const staffApplicationActionRow = new ActionRowBuilder()
                .addComponents(northClubApplyConfirmInviteButtonBuilder);

            // Replace old embed with a new one and add request button.
            interaction.message.edit({ embeds: [newEmbed], components: [staffApplicationActionRow] })
                .then(() => {
                    // Edit initial reply with a summary string.
                    reply.edit({ content: summaryString, ephemeral: true });
                });

        } catch (error) { // Catch any potential errors.
            new InteractionError(interaction, fileName).issue(error);
        }
    }
};