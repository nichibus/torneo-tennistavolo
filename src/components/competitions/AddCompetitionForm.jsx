import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const categories = [
  'Giovanissimi', 'Giovanissime', 
  'Ragazzi', 'Ragazze', 
  'Allievi', 'Allieve', 
  'Juniores Maschile', 'Juniores Femminile', 
  'Seniores Maschile', 'Seniores Femminile', 
  'Adulti Maschile', 'Adulti Femminile', 
  'Veterani A Maschile', 'Veterani A Femminile', 
  'Veterani B Maschile', 'Veterani B Femminile', 
  'Eccellenza B Maschile', 'Eccellenza A Maschile', 'Eccellenza Femminile'
];

const AddCompetitionForm = ({ onClose }) => {
  const { addCompetition } = useAppContext();
  
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    categories: [],
    groupPreference: '3',
    setFormat: '3',
    advancingPlayers: '2',
    rankingType: 'complete',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompetition({
      ...newCompetition,
      [name]: value
    });
  };

  const handleCategoryChange = (category, isChecked) => {
    if (isChecked) {
      setNewCompetition({
        ...newCompetition,
        categories: [...newCompetition.categories, category]
      });
    } else {
      setNewCompetition({
        ...newCompetition,
        categories: newCompetition.categories.filter(cat => cat !== category)
      });
    }
  };

  const handleSubmit = () => {
    if (newCompetition.name && newCompetition.categories.length > 0) {
      addCompetition(newCompetition);
      onClose();
    } else {
      alert('Inserisci un nome e seleziona almeno una categoria');
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded mb-4">
      <h3 className="font-bold mb-2">Aggiungi Nuova Competizione</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nome Competizione</label>
          <input 
            type="text"
            name="name"
            value={newCompetition.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Es: Singolare Maschile"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Categorie Incluse</label>
          <div className="p-2 border rounded bg-white max-h-32 overflow-y-auto">
            {categories.map(category => (
              <div key={category} className="flex items-center mb-1">
                <input 
                  type="checkbox"
                  id={`cat-${category}`}
                  checked={newCompetition.categories.includes(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`cat-${category}`}>{category}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm mb-1">Preferenza Gironi</label>
          <select 
            name="groupPreference"
            value={newCompetition.groupPreference}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="3">Prevalentemente da 3 giocatori</option>
            <option value="4">Prevalentemente da 4 giocatori</option>
            <option value="5">Prevalentemente da 5 giocatori</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm mb-1">Formato Set</label>
          <select 
            name="setFormat"
            value={newCompetition.setFormat}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="3">Al meglio dei 3 set (2 su 3)</option>
            <option value="5">Al meglio dei 5 set (3 su 5)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm mb-1">Giocatori che avanzano dai gironi</label>
          <select 
            name="advancingPlayers"
            value={newCompetition.advancingPlayers}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="1">Solo il primo classificato</option>
            <option value="2">I primi 2 classificati</option>
            <option value="3">I primi 3 classificati</option>
            <option value="all">Tutti i giocatori</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm mb-1">Tipo di Classifica</label>
          <select 
            name="rankingType"
            value={newCompetition.rankingType}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="complete">Classifica completa</option>
            <option value="top2">Solo primi 2 posti</option>
            <option value="top4">Solo primi 4 posti</option>
            <option value="top8">Solo primi 8 posti</option>
          </select>
        </div>
        
        
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <button 
          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
          onClick={onClose}
        >
          Annulla
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          onClick={handleSubmit}
        >
          Crea Competizione
        </button>
      </div>
    </div>
  );
};

export default AddCompetitionForm;