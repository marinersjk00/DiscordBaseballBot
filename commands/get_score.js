module.exports = {
    name: 'getscore',
    description: 'Gets the score of the most recent game for a specified baseball team',
    async execute(message, args) {
        if(!args.length) {
            return message.channel.send('You didn\'t provide a team name!');
        }

        const teamName = args.join(' ');
        const apiKey = '5ef01e673e2c49b48103d2b59d5a4f00';
        const firstUrl = `https://api.sportsdata.io/v3/mlb/scores/json/AllTeams?key=${apiKey}`;

        try {
            const nameResponse = await fetch(firstUrl);
            if (!nameResponse){
                throw new Error('First Network response was not ok');
            }

            const nameData = await nameResponse.json();
            const id = nameData.find(team => team.Name === teamName);
            const date = '2024-05-15'
            const secondUrl = `https://api.sportsdata.io/v3/mlb/scores/json/ScoresBasic/${date}?key=${apiKey}`;
            const response = await fetch(secondUrl);
            if(!response.ok) {
                throw new Error('Second Network response was not ok');
            }

            const data = await response.json();

            const game = data.find(game => (game.HomeTeamID === id.TeamID || game.awayTeamID === id.TeamID));
            const thirdURL = `https://api.sportsdata.io/v3/mlb/stats/json/BoxScore/${game.GameID}?key=${apiKey}`;
            const gameResponse = await fetch(thirdURL);

            if(!gameResponse.ok){
                throw new Error('Game Network response was not ok');

            }

            const gameData = await response.json();

            if(!gameData) {
                return message.channel.send(`Could not find recent game results for the: ${teamName}`);

            }
            const result = `The most recent game for ${teamName} was on ${gameData.DateTime} against ${teamGame.Opponent}.`;
            const win = `The ${teamName} beat the ${teamGame.Opponent} by a score of ${teamGame.Score} - ${teamGame.OpponentScore}.`;
            const loss = `The ${teamName} lost to the ${teamGame.Opponent} by a score of ${teamGame.OpponentScore} - ${teamGame.Score}.`;
            message.channel.send(result);
            if(teamGame.Score > teamGame.OpponentScore){
                message.channel.send(win);
            }else{
                message.channel.send(loss);
            }
        }catch (error) {
            console.error('Error fetching game data:', error);
            message.channel.send('Error occurred fetching game data');
        }
    },
};