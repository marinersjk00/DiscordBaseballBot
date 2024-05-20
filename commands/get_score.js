//Logic Sequence
// 1. Get TeamID for user inputted team
// 2. Get most recent game ID for inputted team (TeamGameStatsBySeason)
// 3. Use most recent game ID to look up box score of most recent game (Box Score)
// 4. Compose response message based on box score data.

module.exports = {
    name: 'getscore',
    description: 'Gets the score of the most recent game for a specified baseball team',
    async execute(message, args) {
        if(!args.length) {
            return message.channel.send('You didn\'t provide a team name!');
        }

        const teamName = args.join(' ');
        const apiKey = '5ef01e673e2c49b48103d2b59d5a4f00';
        const getTeamIDURL = `https://api.sportsdata.io/v3/mlb/scores/json/AllTeams?key=${apiKey}`;

        try {
            const nameResponse = await fetch(getTeamIDURL);
            if (!nameResponse){
                throw new Error('First Network response was not ok');
            }

            const nameData = await nameResponse.json();
            const id = nameData.find(team => team.Name === teamName);

            const currSeason = "2024";
            const getGameIDURL = `https://api.sportsdata.io/v3/mlb/scores/json/TeamGameStatsBySeason/${currSeason}/${id.TeamID}/1?key=${apiKey}`;
            const getGameResponse = await fetch(getGameIDURL);
            if(!getGameResponse.ok) {
                throw new Error('Second Network response was not ok');
            }

            const data = await getGameResponse.json();
           // const game = data.find(game => (game.HomeTeamID === id.TeamID || game.awayTeamID === id.TeamID));
            const game = data.find(gam => gam.TeamID === id.TeamID );

            const opponentID = game.OpponentID;
            console.log("OID" + opponentID);
            const opponent = nameData.find(opp => opp.TeamID === opponentID) ;
            const opponentName = opponent.Name;

           const thirdURL = `https://api.sportsdata.io/v3/mlb/stats/json/BoxScore/${game.GameID}?key=${apiKey}`;

            const gameResponse = await fetch(thirdURL);
            
            if(!gameResponse.ok){
                
                throw new Error('Game Network response was not ok');
                

            }

            const boxScore = await gameResponse.json();
         //   console.log(gameData);
           // const boxScore = gameData.find(box => box.GameID === game.GameID);
            
            const runsHome = boxScore.Game.HomeTeamRuns;
            const runsAway = boxScore.Game.AwayTeamRuns;
            const result = `The most recent game for ${teamName} was on ${boxScore.Game.DateTime.substring(0, 10)} against the ${opponentName}.`;
            const homeWin = `The ${teamName} beat the ${opponentName} by a score of ${runsHome} - ${runsAway}.`;
            const awayWin = `The ${teamName} beat the ${opponentName} by a score of ${runsAway} - ${runsHome}.`;
            const homeLoss = `The ${teamName} lost to the ${opponentName} by a score of ${runsAway} - ${runsHome}.`;
            const awayLoss = `The ${teamName} lost to the ${opponentName} by a score of ${runsHome} - ${runsAway}.`;

            message.channel.send(result);
            if(id.TeamId === boxScore.Game.HomeTeamID){
                if(runsAway > runsHome){
                    message.channel.send(homeWin);
                }else{
                    message.channel.send(homeLoss);
                }
            }else{
                if(runsAway > runsHome){
                    message.channel.send(awayWin);
                }else{
                    message.channel.send(awayLoss);
                }
            }
        }catch (error) {
            console.error('Error fetching game data:', error);
            message.channel.send('Error occurred fetching game data');
        }
    },
};