import React, { useState } from 'react';
import { Upload, Users, Edit, Trash } from 'lucide-react'; // Aggiungi Edit e Trash da lucide-react
import { useAppContext } from '../../context/AppContext';
import AddParticipantForm from './AddParticipantForm';
import EditParticipantForm from './EditParticipantForm'; // Importa il nuovo componente
import ImportParticipants from './ImportParticipants';

const ParticipantList = () => {
  const { participants, removeParticipant } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  // Aggiungi questi stati per la modifica
  const [showEditForm, setShowEditForm] = useState(false);
  const [participantToEdit, setParticipantToEdit] = useState(null);

  // Funzione per gestire il click sul pulsante Modifica
  const handleEditClick = (participant) => {
    setParticipantToEdit(participant);
    setShowEditForm(true);
    setShowAddForm(false);
    setShowImportForm(false);
  };

  // Funzione per chiudere il form di modifica
  const closeEditForm = () => {
    setShowEditForm(false);
    setParticipantToEdit(null);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Gestione Iscritti</h2>
        <div className="space-x-2">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => {
              setShowAddForm(true);
              setShowImportForm(false);
              setShowEditForm(false);
            }}
          >
            Nuovo Iscritto
          </button>
          <button 
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
            onClick={() => {
              setShowImportForm(true);
              setShowAddForm(false);
              setShowEditForm(false);
            }}
          >
            <Upload size={16} className="mr-1" />
            Importa Excel
          </button>
        </div>
      </div>
      
      {showAddForm && <AddParticipantForm onClose={() => setShowAddForm(false)} />}
      {showImportForm && <ImportParticipants onClose={() => setShowImportForm(false)} />}
      {showEditForm && participantToEdit && (
        <EditParticipantForm 
          participant={participantToEdit} 
          onClose={closeEditForm} 
        />
      )}
      
      {participants.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Nome</th>
                <th className="p-2 border">Cognome</th>
                <th className="p-2 border">Società</th>
                <th className="p-2 border">Data di Nascita</th>
                <th className="p-2 border">Categoria</th>
                <th className="p-2 border">Punteggio</th>
                <th className="p-2 border">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {participants.map(participant => (
                <tr key={participant.id}>
                  <td className="p-2 border">{participant.firstName}</td>
                  <td className="p-2 border">{participant.lastName}</td>
                  <td className="p-2 border">{participant.club}</td>
                  <td className="p-2 border">{participant.birthDate}</td>
                  <td className="p-2 border">{participant.category}</td>
                  <td className="p-2 border">{participant.rankingPoints}</td>
                  <td className="p-2 border">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        onClick={() => handleEditClick(participant)}
                      >
                        <Edit size={16} className="mr-1" />
                        Modifica
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700 flex items-center"
                        onClick={() => removeParticipant(participant.id)}
                      >
                        <Trash size={16} className="mr-1" />
                        Rimuovi
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-100 rounded">
          <p>Nessun iscritto registrato. Aggiungi nuovi iscritti o importa da Excel.</p>
        </div>
      )}
    </div>
  );
};

export default ParticipantList;