import React, { useState, useEffect } from 'react';
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

const rankings = ['1000', '1500', '2000', '2500', '3000', '3500', '4000'];

const EditParticipantForm = ({ participant, onClose }) => {
  const { updateParticipant } = useAppContext();
  const [editedParticipant, setEditedParticipant] = useState({ ...participant });

  // Aggiorna il form quando cambia il partecipante
  useEffect(() => {
    setEditedParticipant({ ...participant });
  }, [participant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedParticipant({
      ...editedParticipant,
      [name]: value
    });
  };

  const handleSubmit = () => {
    if (editedParticipant.firstName && editedParticipant.lastName) {
      // Passa solo i dati aggiornati, non l'id che deve restare lo stesso
      const { id, ...updatedData } = editedParticipant;
      updateParticipant(id, updatedData);
      onClose();
    } else {
      alert('Nome e Cognome sono campi obbligatori');
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded mb-4">
      <h3 className="font-bold mb-2">Modifica Iscritto</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nome</label>
          <input 
            type="text"
            name="firstName"
            value={editedParticipant.firstName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Cognome</label>
          <input 
            type="text"
            name="lastName"
            value={editedParticipant.lastName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Società</label>
          <input 
            type="text"
            name="club"
            value={editedParticipant.club || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Data di Nascita</label>
          <input 
            type="date"
            name="birthDate"
            value={editedParticipant.birthDate || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Categoria</label>
          <select 
            name="category"
            value={editedParticipant.category || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleziona categoria</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Punteggio Classifica</label>
          <select 
            name="rankingPoints"
            value={editedParticipant.rankingPoints || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleziona punteggio</option>
            {rankings.map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
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
          Salva Modifiche
        </button>
      </div>
    </div>
  );
};

export default EditParticipantForm;