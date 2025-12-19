
import React, { useState } from 'react';
import { ReservationStatus } from '../types';
import { getStatusLabelsMap, updateStatusLabels, resetStatusLabels } from '../services/api';
import { Save, RotateCcw, X, Tag } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: () => void;
}

export const StatusConfigModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [labels, setLabels] = useState<Record<string, string>>(getStatusLabelsMap());

  const handleChange = (status: string, value: string) => {
    setLabels(prev => ({ ...prev, [status]: value }));
  };

  const handleSave = () => {
    updateStatusLabels(labels as Record<ReservationStatus, string>);
    onSave();
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar os nomes originais dos status?')) {
        resetStatusLabels();
        onSave();
        onClose();
    }
  };

  const statusConfig = [
    { key: ReservationStatus.PENDING, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', desc: 'Reserva criada, aguardando cliente.' },
    { key: ReservationStatus.CONFIRMED, color: 'bg-green-100 text-green-800 border-green-200', desc: 'Reserva confirmada (via WhatsApp, etc).' },
    { key: ReservationStatus.CHECKED_IN, color: 'bg-blue-100 text-blue-800 border-blue-200', desc: 'Cliente presente na casa.' },
    { key: ReservationStatus.COMPLETED, color: 'bg-gray-100 text-gray-800 border-gray-200', desc: 'Cliente já foi embora (histórico).' },
    { key: ReservationStatus.CANCELED, color: 'bg-red-100 text-red-800 border-red-200', desc: 'Reserva cancelada.' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-800">Editar Etiquetas</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
            Aqui você pode alterar o texto que aparece nos "crachás" das reservas. As cores permanecem fixas para manter o padrão visual.
          </p>

          {statusConfig.map((item) => (
            <div key={item.key} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${item.color}`}>
                        Exemplo Visual
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{item.key}</span>
                </div>
                <label className="block text-xs text-gray-500 mb-1">{item.desc}</label>
                <input 
                    type="text"
                    value={labels[item.key] || ''}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    maxLength={20}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium text-gray-800"
                />
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button 
            onClick={handleReset}
            className="px-4 py-3 text-red-600 font-semibold text-sm hover:bg-red-50 rounded-lg flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Restaurar Padrão
          </button>
          <div className="flex-1"></div>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 flex items-center shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
