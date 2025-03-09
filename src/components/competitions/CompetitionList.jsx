import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import AddCompetitionForm from './AddCompetitionForm';
import CompetitionCard from './CompetitionCard';

const CompetitionList = () => {
  const { competitions, setSelectedCompetition } = useAppContext();
  const [showAddCompetitionForm, setShowAddCompetitionForm] = useState(false);

  const handleSelectCompetition = (competition) => {
    setSelectedCompetition(competition);
    // Passa alla sezione gironi
    // Questa funzionalità richiederebbe di modificare il componente Layout
    // Per ora, mostriamo un alert
    alert(`Hai selezionato la competizione: ${competition.name}. Vai alla sezione Gironi per procedere.`);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Configurazione Competizioni</h2>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() => setShowAddCompetitionForm(true)}
        >
          Nuova Competizione
        </button>
      </div>
      
      {showAddCompetitionForm && (
        <AddCompetitionForm onClose={() => setShowAddCompetitionForm(false)} />
      )}
      
      {competitions.length > 0 ? (
        <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {competitions.map(competition => (
            <CompetitionCard 
              key={competition.id} 
              competition={competition} 
              onSelectCompetition={handleSelectCompetition}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-100 rounded">
          <p>Nessuna competizione configurata. Crea una nuova competizione per iniziare.</p>
        </div>
      )}
    </div>
  );
};

export default CompetitionList;