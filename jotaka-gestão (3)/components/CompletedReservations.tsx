
import React, { useState, useEffect } from 'react';
import { Reservation, UnitId, ReservationStatus } from '../types';
import { getReservations, getClientReservationCount, getStatusLabel } from '../services/api';
import { CheckCircle2, Users, ArrowRight, DollarSign, History } from 'lucide-react';

interface Props {
  unitId: UnitId;
  date: string;
  onSelect: (res: Reservation) => void;
  dataVersion: number;
}

// Fixed: Type as React.FC to ensure key prop is accepted when used in JSX maps
const CompletedItem: React.FC<{ r: Reservation, onSelect: (r: Reservation) => void }> = ({ r, onSelect }) => {
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    getClientReservationCount(r.clientId).then(setHistoryCount);
  }, [r.clientId]);

  return (
    <div 
      onClick={() => onSelect(r)}
      className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex justify-between items-center group"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-slate-800">{r.time}</span>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
            {getStatusLabel(r.status)}
          </span>
          {r.spentAmount != null && (
              <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase shadow-sm">
                R$ {Number(r.spentAmount).toFixed(2)}
              </span>
          )}
        </div>
        <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
          {r.clientName}
          {historyCount > 1 && (
            <span className="inline-flex items-center text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
              <History className="w-2.5 h-2.5 mr-0.5" /> {historyCount}ª visita
            </span>
          )}
        </h3>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.confirmedPeopleCount} Clientes</span>
          {r.tableNumber && <span>Mesa {r.tableNumber}</span>}
        </div>
      </div>
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
      </div>
    </div>
  );
};

export const CompletedReservations: React.FC<Props> = ({ unitId, date, onSelect, dataVersion }) => {
  // Fix: using state and useEffect for async reservations fetching
  const [completedList, setCompletedList] = useState<Reservation[]>([]);

  useEffect(() => {
    let isMounted = true;
    getReservations(unitId, date).then(data => {
      if (isMounted) {
        setCompletedList(data.filter(r => r.status === ReservationStatus.COMPLETED));
      }
    });
    return () => { isMounted = false; };
  }, [unitId, date, dataVersion]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="px-2">
        <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">ATENDIMENTOS FINALIZADOS</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registros de {date.split('-').reverse().join('/')}</p>
      </div>

      <div className="grid gap-3">
        {completedList.length > 0 ? (
          completedList.map(r => (
            <CompletedItem key={r.id} r={r} onSelect={onSelect} />
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-300">
            <CheckCircle2 className="w-12 h-12 mb-2 opacity-10" />
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhum atendimento finalizado hoje</p>
          </div>
        )}
      </div>
    </div>
  );
};
