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
            const id = nameData.find(team => (team.Name === teamName) || (team.City === teamName));
            const cityName =   `${id.City} ${id.Name}`; 
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
            const opponent = nameData.find(opp => opp.TeamID === opponentID) ;
            const oppCityName = `${opponent.City} ${opponent.Name}`;

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
            const result = `The most recent game for ${cityName} was on ${boxScore.Game.DateTime.substring(0, 10)} against the ${oppCityName}.`;

            message.channel.send(result);
            if(id.TeamID === boxScore.Game.HomeTeamID){
                if(runsAway > runsHome){
                    const homeLoss = `The ${cityName} lost to the ${oppCityName} by a score of ${runsAway} - ${runsHome}.`;
                    message.channel.send(homeLoss);
                }else{
                    const homeWin = `The ${cityName} beat the ${oppCityName} by a score of ${runsHome} - ${runsAway}.`;
                    message.channel.send(homeWin);
                }
            }else{
                if(runsAway > runsHome){
                    const awayWin = `The ${cityName} beat the ${oppCityName} by a score of ${runsAway} - ${runsHome}.`;
                    message.channel.send(awayWin);
                }else{
                    const awayLoss = `The ${cityName} lost to the ${oppCityName} by a score of ${runsHome} - ${runsAway}.`;
                    message.channel.send(awayLoss);
                }
            }
        }catch (error) {
            console.error('Error fetching game data:', error);
            message.channel.send('No Game Data Found For: ' + teamName);
        }
    },
};