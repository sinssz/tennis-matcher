export function getGamesPlayedMap(participants: any[]): Map<string, number> {
  const map = new Map<string, number>();

  participants.forEach((p) => {
    map.set(p.playerId, p.gamesPlayed);
  });

  return map;
}

export function getMatchHistory(matches: any[]): any[] {
  const history: any[] = [];

  matches.forEach((match) => {
    const players = match.players;

    if (players.length === 1) {
      return;
    }

    const player1 = players[0].playerId;
    const player2 = players[1].playerId;
    const player3 = players[2]?.playerId;
    const player4 = players[3]?.playerId;

    if (player3 && player4) {
      history.push({
        player1Id: player1,
        player2Id: player2,
        player3Id: player3,
        player4Id: player4,
        asOpponents: true,
      });
      history.push({
        player1Id: player3,
        player2Id: player4,
        player3Id: player1,
        player4Id: player2,
        asOpponents: true,
      });
    } else if (player3) {
      history.push({
        player1Id: player1,
        player2Id: player3,
        asOpponents: true,
      });
      history.push({
        player1Id: player1,
        player2Id: player2,
        asOpponents: true,
      });
    }
  });

  return history;
}
