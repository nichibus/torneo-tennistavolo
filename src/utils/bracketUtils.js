// Funzione per generare i tabelloni
export const generateBrackets = (competition, groups, matches, participants, setBrackets, setBracketMatches) => {
    console.log('Generating brackets for competition:', competition.id);
    
    // Verifica se esistono i gironi per questa competizione
    if (!groups[competition.id] || groups[competition.id].length === 0) {
      alert('Devi prima generare e completare i gironi');
      return;
    }
    
    // Per ogni categoria nella competizione, creiamo un tabellone separato
    const competitionBrackets = {};
    
    competition.categories.forEach(category => {
      // Ottieni tutti i giocatori di questa categoria dai gironi
      const categoryPlayers = [];
      groups[competition.id].forEach((group, groupIndex) => {
        const categoryPlayersInGroup = group.filter(player => player.category === category);
        
        // Calcolo della classifica del girone per questa categoria
        const groupMatches = matches[competition.id] ? 
          matches[competition.id].filter(m => m.groupIndex === groupIndex && m.result) : [];
        
        const standings = categoryPlayersInGroup.map(player => {
          const playerMatches = groupMatches.filter(
            m => (m.player1.id === player.id || m.player2.id === player.id) &&
                 (m.player1.category === category && m.player2.category === category)
          );
          
          const wins = playerMatches.filter(m => 
            (m.player1.id === player.id && m.result.player1Sets > m.result.player2Sets) ||
            (m.player2.id === player.id && m.result.player2Sets > m.result.player1Sets)
          ).length;
          
          return {
            ...player,
            matches: playerMatches.length,
            wins,
            points: wins * 2,
            group: groupIndex
          };
        }).sort((a, b) => b.points - a.points);
        
        // Aggiungi i giocatori che avanzano (in base alla configurazione)
        const advancingCount = competition.advancingPlayers === 'all' 
          ? standings.length 
          : Math.min(parseInt(competition.advancingPlayers), standings.length);
        
        for (let i = 0; i < advancingCount; i++) {
          if (standings[i]) {
            categoryPlayers.push({
              ...standings[i],
              position: i + 1
            });
          }
        }
      });
      
      console.log(`Found ${categoryPlayers.length} players for category ${category}`);
      
      // Se non ci sono abbastanza giocatori, salta questa categoria
      if (categoryPlayers.length < 2) {
        console.log(`Not enough players for category ${category}, skipping`);
        return;
      }
      
      // Determina il numero di giocatori per fare un bracket di potenza di 2
      const bracketSizes = [2, 4, 8, 16, 32, 64];
      const bracketSize = bracketSizes.find(size => size >= categoryPlayers.length) || bracketSizes[bracketSizes.length - 1];
      
      // Ordina i giocatori in base alla posizione nei gironi
      categoryPlayers.sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position; // Prima i primi classificati
        }
        return a.group - b.group; // Poi per numero di girone
      });
      
      // Distribuisci i giocatori nel bracket in modo che i primi classificati siano separati
      const bracketPositions = createBracketPositions(bracketSize);
      const players = [...categoryPlayers];
      
      while (players.length < bracketSize) {
        players.push(null); // Placeholder per bye
      }
      
      // Crea il bracket iniziale con i round
      const numRounds = Math.log2(bracketSize);
      const rounds = [];
      
      // Round 1 (primo round)
      const firstRound = [];
      for (let i = 0; i < bracketSize / 2; i++) {
        const player1Idx = bracketPositions[i * 2];
        const player2Idx = bracketPositions[i * 2 + 1];
        
        const match = {
          matchIndex: i,
          player1: players[player1Idx] || null,
          player2: players[player2Idx] || null,
          result: null,
          winner: null
        };
        
        // Se uno dei due giocatori è null (bye), l'altro vince automaticamente
        if (match.player1 && !match.player2) {
          match.winner = 'player1';
          match.result = { player1Sets: 1, player2Sets: 0 };
        } else if (!match.player1 && match.player2) {
          match.winner = 'player2';
          match.result = { player1Sets: 0, player2Sets: 1 };
        }
        
        firstRound.push(match);
      }
      rounds.push(firstRound);
      
      // Crea i round successivi (vuoti)
      for (let r = 1; r < numRounds; r++) {
        const roundMatches = [];
        const numMatches = bracketSize / Math.pow(2, r + 1);
        
        for (let i = 0; i < numMatches; i++) {
          roundMatches.push({
            matchIndex: i,
            player1: null,
            player2: null,
            result: null,
            winner: null
          });
        }
        
        rounds.push(roundMatches);
      }
      
      // Aggiunge il bracket di questa categoria
      competitionBrackets[category] = {
        rounds,
        categoryPlayers
      };
      
      // Avanza automaticamente i "bye" del primo round al secondo round
      firstRound.forEach((match, matchIndex) => {
        if (match.winner) {
          const winnerPlayer = match.winner === 'player1' ? match.player1 : match.player2;
          const roundIdx = 1; // secondo round
          const nextMatchIdx = Math.floor(matchIndex / 2);
          const isFirstPlayer = matchIndex % 2 === 0;
          
          if (roundIdx < rounds.length) {
            const nextMatch = rounds[roundIdx][nextMatchIdx];
            if (isFirstPlayer) {
              nextMatch.player1 = winnerPlayer;
            } else {
              nextMatch.player2 = winnerPlayer;
            }
          }
        }
      });
    });
    
    // Salva i bracket
    setBrackets(prevBrackets => ({
      ...prevBrackets,
      [competition.id]: competitionBrackets
    }));
    
    // Genera le partite dei tabelloni
    generateBracketMatches(competition.id, competitionBrackets, participants, setBracketMatches);
  };
  
  // Funzione per generare le posizioni del bracket (schema serpentino)
  export const createBracketPositions = (size) => {
    if (size === 2) return [0, 1];
    
    const positions = Array(size).fill(0).map((_, i) => i);
    const result = [];
    
    // Implementazione dello schema serpentino per dividere i primi classificati
    const addSeeds = (start, end, startPosition, increment) => {
      for (let i = start; i < end; i += increment) {
        result.push(i);
      }
    };
    
    addSeeds(0, size / 2, 0, 1);
    addSeeds(size - 1, size / 2 - 1, size - 1, -1);
    
    return result;
  };
  
  // Funzione per generare le partite del tabellone
  export const generateBracketMatches = (competitionId, competitionBrackets, participants, setBracketMatches) => {
    console.log('Generating bracket matches for competitionId:', competitionId);
    
    const allBracketMatches = [];
    
    Object.keys(competitionBrackets).forEach(category => {
      const bracket = competitionBrackets[category];
      
      bracket.rounds.forEach((round, roundIndex) => {
        round.forEach((match, matchIndex) => {
          if (match.player1 || match.player2) { // Ignora i match completamente vuoti
            allBracketMatches.push({
              category,
              round: roundIndex,
              matchIndex,
              player1: match.player1,
              player2: match.player2,
              result: match.result,
              winner: match.winner,
              table: null, // Non assegniamo più il tavolo qui, sarà gestito dalla sezione Risorse
              referee: selectReferee(participants, match.player1, match.player2)
            });
          }
        });
      });
    });
    
    // Ordina le partite per round (prima quelle dei primi round)
    allBracketMatches.sort((a, b) => a.round - b.round);
    
    // Salva le partite dei bracket
    setBracketMatches(prevBracketMatches => ({
      ...prevBracketMatches,
      [competitionId]: allBracketMatches
    }));
  };
  
  // Funzione per selezionare un arbitro
  export const selectReferee = (participants, player1, player2) => {
    if (!player1 || !player2) return null;
    
    // Seleziona un arbitro tra i partecipanti che non sono questi giocatori
    const availablePlayers = participants.filter(p => 
      p.id !== player1.id && p.id !== player2.id
    );
    
    if (availablePlayers.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    return availablePlayers[randomIndex];
  };
  
  // Funzione per aggiornare il risultato di un match del tabellone
  export const updateBracketMatchResult = (competitionId, category, roundIndex, matchIndex, result, winner, brackets, setBrackets) => {
    const updatedBrackets = {...brackets};
    
    if (updatedBrackets[competitionId] && 
        updatedBrackets[competitionId][category] && 
        updatedBrackets[competitionId][category].rounds[roundIndex] && 
        updatedBrackets[competitionId][category].rounds[roundIndex][matchIndex]) {
          
      updatedBrackets[competitionId][category].rounds[roundIndex][matchIndex].result = result;
      updatedBrackets[competitionId][category].rounds[roundIndex][matchIndex].winner = winner;
    }
    
    setBrackets(updatedBrackets);
  };
  
  // Funzione per far avanzare il vincitore al prossimo round
  export const advanceWinner = (competitionId, category, roundIndex, matchIndex, winner, brackets, setBrackets, bracketMatches, setBracketMatches, participants) => {
    const updatedBrackets = {...brackets};
    const bracketRounds = updatedBrackets[competitionId][category].rounds;
    
    // Verifica se c'è un altro round dopo questo
    if (roundIndex + 1 < bracketRounds.length) {
      const nextRoundIndex = roundIndex + 1;
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const isFirstPlayer = matchIndex % 2 === 0;
      
      const currentMatch = bracketRounds[roundIndex][matchIndex];
      const winnerPlayer = winner === 'player1' ? currentMatch.player1 : currentMatch.player2;
      
      // Aggiorna il prossimo match con il vincitore
      if (isFirstPlayer) {
        bracketRounds[nextRoundIndex][nextMatchIndex].player1 = winnerPlayer;
      } else {
        bracketRounds[nextRoundIndex][nextMatchIndex].player2 = winnerPlayer;
      }
      
      // Aggiorna anche le partite del tabellone
      if (bracketMatches[competitionId]) {
        const updatedBracketMatches = [...bracketMatches[competitionId]];
        
        // Trova il match nel prossimo round
        const nextMatchInList = updatedBracketMatches.find(
          m => m.category === category && m.round === nextRoundIndex && m.matchIndex === nextMatchIndex
        );
        
        if (nextMatchInList) {
          if (isFirstPlayer) {
            nextMatchInList.player1 = winnerPlayer;
          } else {
            nextMatchInList.player2 = winnerPlayer;
          }
        } else {
          // Se non esiste ancora, aggiungilo
          updatedBracketMatches.push({
            category,
            round: nextRoundIndex,
            matchIndex: nextMatchIndex,
            player1: isFirstPlayer ? winnerPlayer : null,
            player2: isFirstPlayer ? null : winnerPlayer,
            result: null,
            winner: null,
            table: null, // Non assegniamo più il tavolo qui
            referee: selectReferee(participants, 
                                  isFirstPlayer ? winnerPlayer : null, 
                                  isFirstPlayer ? null : winnerPlayer)
          });
        }
        
        setBracketMatches({
          ...bracketMatches,
          [competitionId]: updatedBracketMatches
        });
      }
    }
    
    setBrackets(updatedBrackets);
  };
  
  // Funzione per calcolare la classifica finale
  export const calculateFinalRankings = (categoryBracket, rankingType) => {
    const players = categoryBracket.categoryPlayers;
    const finalRound = categoryBracket.rounds[categoryBracket.rounds.length - 1][0];
    
    // Se la finale non è ancora stata disputata, ritorna una classifica vuota
    if (!finalRound.winner) return [];
    
    const winner = finalRound.winner === 'player1' ? finalRound.player1 : finalRound.player2;
    const secondPlace = finalRound.winner === 'player1' ? finalRound.player2 : finalRound.player1;
    
    // Per semplicità, determiniamo le altre posizioni in base all'avanzamento nel tabellone
    // e alla posizione nel girone originale
    let rankings = [winner, secondPlace];
    
    // Semifinalisti (3º e 4º posto)
    if (categoryBracket.rounds.length > 1) {
      const semifinalists = categoryBracket.rounds[categoryBracket.rounds.length - 2]
        .filter(match => match.loser)
        .map(match => match.loser === 'player1' ? match.player1 : match.player2);
      
      rankings = rankings.concat(semifinalists);
    }
    
    // Aggiunge il resto dei giocatori in base alla loro posizione nei gironi
    const remainingPlayers = players.filter(p => !rankings.some(r => r && r.id === p.id));
    rankings = rankings.concat(remainingPlayers);
    
    // Limitiamo in base al tipo di classifica richiesto
    if (rankingType === 'top2') {
      return rankings.slice(0, 2);
    } else if (rankingType === 'top4') {
      return rankings.slice(0, 4);
    } else if (rankingType === 'top8') {
      return rankings.slice(0, 8);
    }
    
    // Classifica completa
    return rankings;
  };