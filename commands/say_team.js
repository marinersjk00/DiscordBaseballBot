module.exports = {
    name: 'myteam',
    description: 'favoriteTeamDisplay',
    execute(message, args) {
        if(!args.length){
            return message.channel.send('No team specified');
        }
        const msg = args.join(' ');
        message.channel.send(`Go ${msg}!`);
    },

};