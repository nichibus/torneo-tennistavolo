// Funzione per generare i gironi
export const generateGroups = (competition, participants, setGroups, setMatches) => {
    console.log('generateGroups called with competition:', competition);
    // Filtra i partecipanti in base alle categorie selezionate per la competizione
    const eligibleParticipants = participants.filter(p => 
      competition.categories.includes(p.category)
    );
    
    if (eligibleParticipants.length === 0) {
      alert('Non ci sono partecipanti nelle categorie selezionate');
      return;
    }
    
    const totalPlayers = eligibleParticipants.length;
    const preferredSize = parseInt(competition.groupPreference);
    
    // Calcola la distribuzione ottimale dei gironi in base alla preferenza
    let distribution = calculateOptimalGroupDistribution(totalPlayers, preferredSize);
    console.log(`Distribuzione gironi: ${JSON.stringify(distribution)}`);
    
    // Crea un array di gironi vuoti secondo la distribuzione calcolata
    const numGroups = distribution.length;
    let newGroups = Array.from({ length: numGroups }, (_, i) => ({
      targetSize: distribution[i],
      players: []
    }));
    
    // Ora distribuiamo i giocatori seguendo le regole di priorità
    
    // 1. Ordina i giocatori per categoria, società e punteggio
    const sortedPlayers = [...eligibleParticipants].sort((a, b) => {
      // Prima per categoria
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      // Poi per società
      if (a.club !== b.club) {
        return a.club.localeCompare(b.club);
      }
      // Infine per punteggio (decrescente)
      return parseInt(b.rankingPoints || 0) - parseInt(a.rankingPoints || 0);
    });
    
    // 2. Distribuisci i giocatori nei gironi, bilanciando categorie e società
    sortedPlayers.forEach((player) => {
      // Trova il girone con meno giocatori della stessa categoria
      const groupsByCategoryCount = newGroups.map(group => {
        return {
          index: newGroups.indexOf(group),
          count: group.players.filter(p => p.category === player.category).length,
          currentSize: group.players.length,
          targetSize: group.targetSize
        };
      });
      
      // Filtra solo i gironi che non hanno ancora raggiunto la loro dimensione target
      const availableGroups = groupsByCategoryCount.filter(g => g.currentSize < g.targetSize);
      
      if (availableGroups.length === 0) {
        console.error("Impossibile distribuire tutti i giocatori secondo la distribuzione target");
        // In caso di errore, aggiungi al primo girone che ha meno giocatori
        const minSizeGroup = groupsByCategoryCount.sort((a, b) => a.currentSize - b.currentSize)[0];
        newGroups[minSizeGroup.index].players.push(player);
        return;
      }
      
      // Ordina prima per conteggio categoria (priorità 1)
      availableGroups.sort((a, b) => a.count - b.count);
      
      const minCategoryCount = availableGroups[0].count;
      const groupsWithMinCategory = availableGroups.filter(g => g.count === minCategoryCount);
      
      let targetGroupIndex;
      
      if (groupsWithMinCategory.length > 1) {
        // Se più gironi hanno lo stesso numero di giocatori di questa categoria,
        // cerca quello con meno giocatori della stessa società (priorità 2)
        const groupsByClubCount = groupsWithMinCategory.map(g => {
          return {
            ...g,
            clubCount: newGroups[g.index].players.filter(p => p.club === player.club).length
          };
        }).sort((a, b) => a.clubCount - b.clubCount);
        
        targetGroupIndex = groupsByClubCount[0].index;
      } else {
        targetGroupIndex = groupsWithMinCategory[0].index;
      }
      
      // Aggiungi il giocatore al girone selezionato
      newGroups[targetGroupIndex].players.push(player);
    });
    
    // Estrai solo gli array di giocatori dai gruppi
    const finalGroups = newGroups.map(group => group.players);
    console.log('New groups generated:', finalGroups);
    
    // Salva i gironi generati
    setGroups(prevGroups => ({
      ...prevGroups,
      [competition.id]: finalGroups
    }));
    
    // Genera le partite per i gironi
    generateMatches(competition.id, finalGroups, participants, setMatches);
  };
  
  // Calcola la distribuzione ottimale dei gironi in base alla preferenza e al numero di giocatori
  export const calculateOptimalGroupDistribution = (totalPlayers, preferredSize, recursionDepth = 0) => {
    // Protezione contro la ricorsione infinita
    if (recursionDepth > 10) {
      console.warn("Rilevata ricorsione profonda, forzando una distribuzione sicura");
      return createSafeDistribution(totalPlayers);
    }
    
    if (totalPlayers <= 0) return [];
    
    // Caso speciale per piccoli numeri di giocatori
    if (totalPlayers < 6) {
      return [totalPlayers]; // Un solo girone
    }
    
    // Calcola il numero ideale di gironi basato sulla preferenza
    let idealNumGroups = Math.ceil(totalPlayers / preferredSize);
    
    // Verifica se possiamo effettivamente avere gironi della dimensione minima richiesta
    const minSize = Math.max(3, preferredSize - 1); // Mai meno di 3 giocatori
    const maxPossibleGroups = Math.floor(totalPlayers / minSize);
    
    // Se il numero ideale di gironi supera ciò che è possibile con la dimensione minima, riduciamo
    if (idealNumGroups > maxPossibleGroups) {
      idealNumGroups = maxPossibleGroups;
    }
    
    // Se non possiamo avere almeno un girone della dimensione minima, forziamo un solo girone
    if (idealNumGroups <= 0) {
      return [totalPlayers];
    }
    
    // Calcola la dimensione base e quanti gironi avranno un giocatore in più
    const baseSize = Math.floor(totalPlayers / idealNumGroups);
    const remainder = totalPlayers % idealNumGroups;
    
    // Verifica che la dimensione base sia almeno la minima
    if (baseSize < minSize) {
      // Se la dimensione base è inferiore alla minima, riduciamo il numero di gironi
      return calculateOptimalGroupDistribution(
        totalPlayers, 
        preferredSize + 1, 
        recursionDepth + 1
      );
    }
    
    // Crea la distribuzione di gironi
    const distribution = Array(idealNumGroups).fill(baseSize);
    
    // Distribuisci i giocatori rimanenti
    for (let i = 0; i < remainder; i++) {
      distribution[i]++;
    }
    
    // Ottimizzazione: se ci sono gironi troppo piccoli, rubiamo giocatori dai gironi più grandi
    let iterations = 0;
    const maxIterations = 100; // Limite di sicurezza per evitare loop infiniti
    
    while (
      distribution.some(size => size < minSize) && 
      distribution.some(size => size > minSize) && 
      iterations < maxIterations
    ) {
      const smallestIndex = distribution.findIndex(size => size < minSize);
      const largestIndex = distribution.findIndex(size => size > minSize);
      
      distribution[smallestIndex]++;
      distribution[largestIndex]--;
      
      iterations++;
    }
    
    // Se dopo l'ottimizzazione ci sono ancora gironi troppo piccoli, riduciamo il numero di gironi
    if (distribution.some(size => size < minSize)) {
      // Combina i giocatori dei gironi più piccoli e ricalcola
      const smallGroups = distribution.filter(size => size < minSize);
      const smallPlayersCount = smallGroups.reduce((sum, size) => sum + size, 0);
      const remainingGroups = distribution.filter(size => size >= minSize);
      
      if (smallPlayersCount > 0 && remainingGroups.length > 0) {
        // Riduciamo il numero di gironi
        const newTotalPlayers = totalPlayersInGroups(remainingGroups) + smallPlayersCount;
        return calculateOptimalGroupDistribution(
          newTotalPlayers,
          preferredSize + 1, // Aumentiamo la dimensione preferita
          recursionDepth + 1
        );
      } else {
        // Se non abbiamo gironi rimanenti, forza una distribuzione sicura
        return createSafeDistribution(totalPlayers);
      }
    }
    
    // Nessun girone può avere meno di 3 giocatori
    for (let i = 0; i < distribution.length; i++) {
      if (distribution[i] < 3) {
        if (i < distribution.length - 1) {
          // Combina con il prossimo girone
          distribution[i+1] += distribution[i];
          distribution.splice(i, 1);
          i--; // Ricontrolla questa posizione
        } else if (i > 0) {
          // Combina con il girone precedente
          distribution[i-1] += distribution[i];
          distribution.splice(i, 1);
        }
      }
    }
    
    // Nessun girone può avere più di 5 giocatori (tranne in casi estremi)
    let hasChanged = true;
    iterations = 0;
    
    while (hasChanged && iterations < maxIterations) {
      hasChanged = false;
      for (let i = 0; i < distribution.length; i++) {
        if (distribution[i] > 5 && distribution.length < totalPlayers / 3) {
          // Dividi il girone in due
          const newSize = Math.ceil(distribution[i] / 2);
          const remainingSize = distribution[i] - newSize;
          
          // Verifica che entrambi i nuovi gironi siano validi
          if (newSize >= 3 && remainingSize >= 3) {
            distribution[i] = newSize;
            distribution.push(remainingSize);
            hasChanged = true;
          }
        }
      }
      iterations++;
    }
    
    return distribution;
  };
  
  // Funzione per creare una distribuzione sicura di gironi
  export const createSafeDistribution = (totalPlayers) => {
    // Per sicurezza, crea gironi da 3 o 4 giocatori
    if (totalPlayers <= 5) return [totalPlayers];
    
    // Bilanciamo tra gironi da 3 e 4 persone
    let numGroups3 = 0;
    let numGroups4 = 0;
    
    if (totalPlayers % 3 === 0) {
      // Divisibile per 3, tutti gironi da 3
      numGroups3 = totalPlayers / 3;
    } else if (totalPlayers % 4 === 0) {
      // Divisibile per 4, tutti gironi da 4
      numGroups4 = totalPlayers / 4;
    } else if (totalPlayers % 3 === 1) {
      // Resto 1 per divisione per 3: un girone da 4, il resto da 3
      numGroups4 = 1;
      numGroups3 = (totalPlayers - 4) / 3;
    } else if (totalPlayers % 3 === 2) {
      // Resto 2 per divisione per 3: due gironi da 4, il resto da 3
      numGroups4 = 2;
      numGroups3 = (totalPlayers - 8) / 3;
    } else if (totalPlayers % 4 === 1) {
      // Resto 1 per divisione per 4: un girone da 3, il resto da 4
      numGroups3 = 1;
      numGroups4 = (totalPlayers - 3) / 4;
    } else if (totalPlayers % 4 === 2) {
      // Resto 2 per divisione per 4: due gironi da 3, il resto da 4
      numGroups3 = 2;
      numGroups4 = (totalPlayers - 6) / 4;
    } else if (totalPlayers % 4 === 3) {
      // Resto 3 per divisione per 4: tre gironi da 3, il resto da 4
      numGroups3 = 3;
      numGroups4 = (totalPlayers - 9) / 4;
    }
    
    const distribution = [];
    for (let i = 0; i < numGroups3; i++) {
      distribution.push(3);
    }
    for (let i = 0; i < numGroups4; i++) {
      distribution.push(4);
    }
    
    return distribution;
  };
  
  // Funzione di supporto per calcolare il totale dei giocatori in una distribuzione
  export const totalPlayersInGroups = (distribution) => {
    return distribution.reduce((sum, size) => sum + size, 0);
  };
  
  // Funzione per generare le partite all'interno dei gironi con un ordine specifico
  export const generateMatches = (competitionId, competitionGroups, participants, setMatches) => {
    console.log('Generating matches for competitionId:', competitionId);
    console.log('Using groups:', competitionGroups);
    
    const allMatches = [];
    
    competitionGroups.forEach((group, groupIndex) => {
      // Genera le partite in base alla dimensione del girone con l'ordine specifico
      const groupSize = group.length;
      
      // Array per memorizzare gli indici delle partite nell'ordine richiesto
      let matchOrder = [];
      
      if (groupSize === 3) {
        // Gironi da 3: [0,2], [0,1], [1,2]
        matchOrder = [
          { player1Index: 0, player2Index: 2 }, // 1 vs 3
          { player1Index: 0, player2Index: 1 }, // 1 vs 2
          { player1Index: 1, player2Index: 2 }  // 2 vs 3
        ];
      } else if (groupSize === 4) {
        // Gironi da 4
        matchOrder = [
          { player1Index: 0, player2Index: 2 }, // 1 vs 3
          { player1Index: 1, player2Index: 3 }, // 2 vs 4
          { player1Index: 0, player2Index: 1 }, // 1 vs 2
          { player1Index: 2, player2Index: 3 }, // 3 vs 4
          { player1Index: 0, player2Index: 3 }, // 1 vs 4
          { player1Index: 1, player2Index: 2 }  // 2 vs 3
        ];
      } else if (groupSize === 5) {
        // Gironi da 5
        matchOrder = [
          { player1Index: 0, player2Index: 4 }, // 1 vs 5
          { player1Index: 1, player2Index: 3 }, // 2 vs 4
          { player1Index: 4, player2Index: 3 }, // 5 vs 4
          { player1Index: 0, player2Index: 2 }, // 1 vs 3
          { player1Index: 3, player2Index: 2 }, // 4 vs 3
          { player1Index: 1, player2Index: 4 }, // 2 vs 5
          { player1Index: 1, player2Index: 0 }, // 2 vs 1
          { player1Index: 4, player2Index: 2 }, // 5 vs 3
          { player1Index: 0, player2Index: 3 }, // 1 vs 4
          { player1Index: 2, player2Index: 1 }  // 3 vs 2
        ];
      } else {
        // Per dimensioni non specificate, genera tutte le possibili combinazioni
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            matchOrder.push({ player1Index: i, player2Index: j });
          }
        }
      }
      
      // Crea le partite nell'ordine specificato
      matchOrder.forEach(({ player1Index, player2Index }) => {
        if (player1Index < group.length && player2Index < group.length) {
          allMatches.push({
            groupIndex,
            player1: group[player1Index],
            player2: group[player2Index],
            table: null,
            referee: null,
            result: null
          });
        }
      });
    });
    
    // Assegna arbitri (ma non più tavoli)
    allMatches.forEach((match, index) => {
      // MODIFICA: Seleziona un arbitro solo tra i giocatori dello stesso girone
      const currentGroup = competitionGroups[match.groupIndex];
      
      // Filtra i possibili arbitri: devono essere nel girone ma non coinvolti nella partita corrente
      const availableReferees = currentGroup.filter(player => 
        player.id !== match.player1.id && 
        player.id !== match.player2.id &&
        // Verifica che il giocatore non sia già assegnato come arbitro in altre partite dello stesso girone
        !allMatches.some(m => 
          m.referee && 
          m.referee.id === player.id && 
          m !== match &&
          // Considera solo partite dello stesso girone
          m.groupIndex === match.groupIndex
        )
      );
      
      if (availableReferees.length > 0) {
        // Seleziona un arbitro casuale tra i disponibili
        const randomIndex = Math.floor(Math.random() * availableReferees.length);
        match.referee = availableReferees[randomIndex];
      } else {
        // Se non ci sono giocatori disponibili nel girone, lascia referee come null
        console.log(`Non ci sono arbitri disponibili nel girone ${match.groupIndex + 1} per la partita tra ${match.player1.firstName} e ${match.player2.firstName}`);
      }
    });
    
    console.log('Generated matches:', allMatches);
    
    setMatches(prevMatches => ({
      ...prevMatches,
      [competitionId]: allMatches
    }));
  };
  
  // Calcola le classifiche per un girone, gestendo i casi di parità secondo le regole del tennistavolo
  export const calculateGroupStandings = (group, groupMatches, category = null) => {
    if (!group || !groupMatches) return [];
    
    // Se è specificata una categoria, filtra solo i giocatori di quella categoria
    const filteredGroup = category ? group.filter(p => p.category === category) : group;
    
    if (filteredGroup.length === 0) return [];
    
    // Ottieni tutte le partite valide con risultati registrati
    const completedMatches = groupMatches.filter(match => match.result && 
      // Se filtriamo per categoria, consideriamo solo le partite tra giocatori della stessa categoria
      (!category || (match.player1.category === category && match.player2.category === category))
    );
    
    // Calcoliamo i punti base (2 per vittoria)
    const playerStats = filteredGroup.map(player => {
      // Trova tutte le partite di questo giocatore
      const playerMatches = completedMatches.filter(m => 
        m.player1.id === player.id || m.player2.id === player.id
      );
      
      // Calcola vittorie, set vinti/persi, punti vinti/persi
      let wins = 0;
      let setsWon = 0;
      let setsLost = 0;
      let pointsWon = 0;
      let pointsLost = 0;
      
      playerMatches.forEach(match => {
        const isPlayer1 = match.player1.id === player.id;
        const player1Sets = match.result.player1Sets;
        const player2Sets = match.result.player2Sets;
        
        // Calcola vittoria
        if ((isPlayer1 && player1Sets > player2Sets) || (!isPlayer1 && player2Sets > player1Sets)) {
          wins++;
        }
        
        // Calcola set vinti/persi
        if (isPlayer1) {
          setsWon += player1Sets;
          setsLost += player2Sets;
        } else {
          setsWon += player2Sets;
          setsLost += player1Sets;
        }
        
        // Calcola punti per ogni set (se disponibili)
        if (match.result.setScores) {
          match.result.setScores.forEach(set => {
            if (isPlayer1) {
              pointsWon += set.player1;
              pointsLost += set.player2;
            } else {
              pointsWon += set.player2;
              pointsLost += set.player1;
            }
          });
        }
      });
      
      // Calcola quozienti
      const setRatio = setsLost > 0 ? setsWon / setsLost : setsWon > 0 ? Infinity : 0;
      const pointRatio = pointsLost > 0 ? pointsWon / pointsLost : pointsWon > 0 ? Infinity : 0;
      
      return {
        ...player,
        matches: playerMatches.length,
        wins,
        points: wins * 2,
        setsWon,
        setsLost,
        setRatio,
        pointsWon,
        pointsLost,
        pointRatio,
        // Memorizza le partite giocate da questo giocatore per calcolare lo scontro diretto
        playerMatches
      };
    });
  
    // Ordina i giocatori prima per punti (discendente)
    playerStats.sort((a, b) => b.points - a.points);
  
    // Gestione dei casi di parità
    const finalRanking = [];
    let currentPoints = -1;
    let currentTieGroup = [];
  
    // Raggruppa i giocatori per punti
    playerStats.forEach(player => {
      if (player.points !== currentPoints) {
        // Risolvi il gruppo precedente di giocatori a pari punti
        if (currentTieGroup.length > 0) {
          const resolvedTieGroup = resolveTie(currentTieGroup, completedMatches);
          finalRanking.push(...resolvedTieGroup);
        }
        
        // Inizia un nuovo gruppo
        currentPoints = player.points;
        currentTieGroup = [player];
      } else {
        // Aggiungi al gruppo corrente
        currentTieGroup.push(player);
      }
    });
  
    // Risolvi l'ultimo gruppo
    if (currentTieGroup.length > 0) {
      const resolvedTieGroup = resolveTie(currentTieGroup, completedMatches);
      finalRanking.push(...resolvedTieGroup);
    }
  
    return finalRanking;
  };
  
  // Funzione per risolvere i casi di parità secondo le regole ufficiali
  const resolveTie = (tiedPlayers, allMatches) => {
    // Se c'è solo un giocatore o nessuno, nessuna parità da risolvere
    if (tiedPlayers.length <= 1) return tiedPlayers;
  
    // Se ci sono due giocatori a pari punti, utilizziamo lo scontro diretto
    if (tiedPlayers.length === 2) {
      const player1 = tiedPlayers[0];
      const player2 = tiedPlayers[1];
      
      // Trova la partita tra questi due giocatori
      const directMatch = allMatches.find(match => 
        (match.player1.id === player1.id && match.player2.id === player2.id) || 
        (match.player1.id === player2.id && match.player2.id === player1.id)
      );
      
      // Se non c'è partita tra i due o non ha risultato, mantieni l'ordine (possibile classifica ex-aequo)
      if (!directMatch || !directMatch.result) return tiedPlayers;
      
      // Determina il vincitore dello scontro diretto
      const player1IsWinner = (directMatch.player1.id === player1.id && 
                              directMatch.result.player1Sets > directMatch.result.player2Sets) ||
                             (directMatch.player2.id === player1.id && 
                              directMatch.result.player2Sets > directMatch.result.player1Sets);
      
      return player1IsWinner ? [player1, player2] : [player2, player1];
    }
    
    // Se ci sono 3 o più giocatori a pari punti, calcola una "mini classifica" tra questi giocatori
    
    // 1. Calcola vittorie negli scontri diretti tra questi giocatori
    const tiedPlayerIds = tiedPlayers.map(p => p.id);
    const directMatchesStats = tiedPlayers.map(player => {
      const directMatches = allMatches.filter(m => 
        (m.player1.id === player.id && tiedPlayerIds.includes(m.player2.id)) ||
        (m.player2.id === player.id && tiedPlayerIds.includes(m.player1.id))
      );
      
      let directWins = 0;
      let directSetsWon = 0;
      let directSetsLost = 0;
      let directPointsWon = 0;
      let directPointsLost = 0;
      
      directMatches.forEach(match => {
        const isPlayer1 = match.player1.id === player.id;
        
        // Calcola vittoria
        if ((isPlayer1 && match.result.player1Sets > match.result.player2Sets) ||
            (!isPlayer1 && match.result.player2Sets > match.result.player1Sets)) {
          directWins++;
        }
        
        // Calcola set
        if (isPlayer1) {
          directSetsWon += match.result.player1Sets;
          directSetsLost += match.result.player2Sets;
        } else {
          directSetsWon += match.result.player2Sets;
          directSetsLost += match.result.player1Sets;
        }
        
        // Calcola punti per ogni set (se disponibili)
        if (match.result.setScores) {
          match.result.setScores.forEach(set => {
            if (isPlayer1) {
              directPointsWon += set.player1;
              directPointsLost += set.player2;
            } else {
              directPointsWon += set.player2;
              directPointsLost += set.player1;
            }
          });
        }
      });
      
      // Calcola quozienti per gli scontri diretti
      const directSetRatio = directSetsLost > 0 ? directSetsWon / directSetsLost : 
                            directSetsWon > 0 ? Infinity : 0;
      const directPointRatio = directPointsLost > 0 ? directPointsWon / directPointsLost : 
                              directPointsWon > 0 ? Infinity : 0;
      
      return {
        ...player,
        directWins,
        directPoints: directWins * 2,
        directSetsWon,
        directSetsLost,
        directSetRatio,
        directPointsWon,
        directPointsLost,
        directPointRatio
      };
    });
    
    // 2. Ordina prima per vittorie negli scontri diretti
    directMatchesStats.sort((a, b) => b.directPoints - a.directPoints);
    
    // 3. Gestione delle parità residue
    const finalResolution = [];
    let currentDirectPoints = -1;
    let currentDirectTieGroup = [];
    
    // Raggruppa per punti negli scontri diretti
    directMatchesStats.forEach(player => {
      if (player.directPoints !== currentDirectPoints) {
        // Risolvi il gruppo precedente
        if (currentDirectTieGroup.length > 0) {
          if (currentDirectTieGroup.length === 1) {
            finalResolution.push(currentDirectTieGroup[0]);
          } else {
            // Ordina per quoziente set
            const sortedBySetRatio = [...currentDirectTieGroup].sort((a, b) => 
              b.directSetRatio - a.directSetRatio
            );
            
            // Verifica se ci sono ancora parità
            let currentSetRatio = -1;
            let currentSetRatioGroup = [];
            
            sortedBySetRatio.forEach(p => {
              if (p.directSetRatio !== currentSetRatio) {
                // Risolvi gruppo precedente
                if (currentSetRatioGroup.length > 0) {
                  // Ordina per quoziente punti
                  const sortedByPointRatio = [...currentSetRatioGroup].sort((a, b) => 
                    b.directPointRatio - a.directPointRatio
                  );
                  finalResolution.push(...sortedByPointRatio);
                }
                
                currentSetRatio = p.directSetRatio;
                currentSetRatioGroup = [p];
              } else {
                currentSetRatioGroup.push(p);
              }
            });
            
            // Risolvi l'ultimo gruppo di quoziente set
            if (currentSetRatioGroup.length > 0) {
              const sortedByPointRatio = [...currentSetRatioGroup].sort((a, b) => 
                b.directPointRatio - a.directPointRatio
              );
              finalResolution.push(...sortedByPointRatio);
            }
          }
        }
        
        currentDirectPoints = player.directPoints;
        currentDirectTieGroup = [player];
      } else {
        currentDirectTieGroup.push(player);
      }
    });
    
    // Risolvi l'ultimo gruppo
    if (currentDirectTieGroup.length > 0) {
      if (currentDirectTieGroup.length === 1) {
        finalResolution.push(currentDirectTieGroup[0]);
      } else {
        // Ordina per quoziente set
        const sortedBySetRatio = [...currentDirectTieGroup].sort((a, b) => 
          b.directSetRatio - a.directSetRatio
        );
        
        // Verifica se ci sono ancora parità
        let currentSetRatio = -1;
        let currentSetRatioGroup = [];
        
        sortedBySetRatio.forEach(p => {
          if (p.directSetRatio !== currentSetRatio) {
            // Risolvi gruppo precedente
            if (currentSetRatioGroup.length > 0) {
              // Ordina per quoziente punti
              const sortedByPointRatio = [...currentSetRatioGroup].sort((a, b) => 
                b.directPointRatio - a.directPointRatio
              );
              finalResolution.push(...sortedByPointRatio);
            }
            
            currentSetRatio = p.directSetRatio;
            currentSetRatioGroup = [p];
          } else {
            currentSetRatioGroup.push(p);
          }
        });
        
        // Risolvi l'ultimo gruppo di quoziente set
        if (currentSetRatioGroup.length > 0) {
          const sortedByPointRatio = [...currentSetRatioGroup].sort((a, b) => 
            b.directPointRatio - a.directPointRatio
          );
          finalResolution.push(...sortedByPointRatio);
        }
      }
    }
    
    return finalResolution;
  };
  
  // Ottieni le categorie presenti in un girone
  export const getCategoriesInGroup = (group) => {
    if (!group || group.length === 0) return [];
    
    // Trova tutte le categorie uniche nel girone
    const categories = new Set();
    group.forEach(player => {
      if (player.category) {
        categories.add(player.category);
      }
    });
    
    return Array.from(categories);
  };