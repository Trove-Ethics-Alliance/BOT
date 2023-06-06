const LaezariaEnums = Object.freeze({
    REJECTED_URL: 'https://i.imgur.com/vunpkQy.png',
    APPROVED_URL: 'https://i.imgur.com/DQwdu0u.png',

    FAILED_PROOF_URL: 'https://i.imgur.com/ReMlAhB.png',
    INBOX_CHANNEL_ID: '1103770722586853518',

    MEMBER_ROLE_ID: '1099703236983791698',
});

const NorthEnums = Object.freeze({
    GUILD_ID: '741573211203960853',
    CLUB_LOGO_URL: 'https://i.imgur.com/90HP5c6.png',

    roles: {
        STAFF_ID: '1104440936479592629',
        GRANDCOUSIL_ID: '1104437369559601244',
        DEV_ID: '1104437516154712064',
        ADMIN_ID: '1104437669951438879',
        KINGSGUARD_ID: '1104450397260763266',
        KNIGHT_ID: '1104450515842105496',
        MEMBER_ID: '1104440858004181033',
        GUEST_ID: '1104450320261713930',
    },
    channels: {
        INBOX_ID: '1103769703110938815'
    }
});

module.exports = {
    LaezariaEnums,
    NorthEnums
};
