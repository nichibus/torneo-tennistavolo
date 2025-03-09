import React from 'react';
import { useAppContext } from '../../context/AppContext';

const CompetitionCard = ({ competition, onSelectCompetition }) => {
  const { removeCompetition } = useAppContext();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold text-lg mb-2">{competition.name}</h3>
      <div className="text-sm">
        <p><span className="font-semibold">Categorie:</span> {competition.categories.join(', ')}</p>
        <p><span className="font-semibold">Gironi:</span> {
          competition.groupPreference === '3' ? 'Principalmente da 3' :
          competition.groupPreference === '4' ? 'Principalmente da 4' : 'Principalmente da 5'
        }</p>
        <p><span className="font-semibold">Formato:</span> {
          competition.setFormat === '3' ? 'Al meglio dei 3 set' : 'Al meglio dei 5 set'
        }</p>
        <p><span className="font-semibold">Avanzano:</span> {
          competition.advancingPlayers === '1' ? 'Solo il primo' :
          competition.advancingPlayers === '2' ? 'I primi 2' :
          competition.advancingPlayers === '3' ? 'I primi 3' : 'Tutti'
        }</p>
        <p><span className="font-semibold">Classifica:</span> {
          competition.rankingType === 'complete' ? 'Completa' :
          competition.rankingType === 'top2' ? 'Top 2' :
          competition.rankingType === 'top4' ? 'Top 4' : 'Top 8'
        }</p>
        </div>
      <div className="mt-4 flex justify-between">
        <button 
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => onSelectCompetition(competition)}
        >
          Genera Gironi
        </button>
        <button 
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => removeCompetition(competition.id)}
        >
          Elimina
        </button>
      </div>
    </div>
  );
};

export default CompetitionCard;