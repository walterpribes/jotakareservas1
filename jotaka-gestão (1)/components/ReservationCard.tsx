
import React, { useState, useEffect } from 'react';
import { Reservation, ReservationStatus } from '../types';
import { getStatusLabel, getClients, getClientReservationCount } from '../services/api';
import { Users, Calendar, Hash, MessageSquare, Star, User as UserIcon, Clock } from 'lucide-react';

interface Props {
  reservation: Reservation;
  onClick: (res: Reservation) => void;
}

const getStatusStyles = (status: ReservationStatus) => {
  switch (status) {
    case ReservationStatus.PENDING: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    case ReservationStatus.CONFIRMED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case ReservationStatus.CHECKED_IN: return 'bg-blue-50 text-blue-700 border-blue-100';
    case ReservationStatus.COMPLETED: return 'bg-slate-50 text-slate-700 border-slate-100';
    case ReservationStatus.CANCELED: return 'bg-red-50 text-red-700 border-red-100';
    case ReservationStatus.NOSHOW: return 'bg-orange-50 text-orange-700 border-orange-100';
    default: return 'bg-gray-50 text-gray-700';
  }
};

export const ReservationCard: React.FC<Props> = ({ reservation, onClick }) => {
  const [isVip, setIsVip] = useState<boolean>(false);
  const [historyCount, setHistoryCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const loadAsyncData = async () => {
      try {
        const clients = await getClients();
        const client = clients.find(c => c.id === reservation.clientId);
        if (isMounted) setIsVip(!!client?.isVip);
        
        const count = await getClientReservationCount(reservation.clientId);
        if (isMounted) setHistoryCount(count);
      } catch (err) {
        console.error("Error loading card details:", err);
      }
    };
    loadAsyncData();
    return () => { isMounted = false; };
  }, [reservation.clientId]);

  const statusLabel = getStatusLabel(reservation.status);
  
  // Limpa o e-mail para exibir apenas antes do @
  const formatEmail = (email: string) => email.split('@')[0];
  const creatorEmail = formatEmail(reservation.history[0]?.user || 'SISTEMA');
  const lastModifierEmail = formatEmail(reservation.lastModifiedBy || creatorEmail);

  return (
    <div 
      onClick={() => onClick(reservation)}
      className={`relative p-4 mb-3 rounded-2xl border bg-white shadow-sm cursor-pointer transition-all hover:shadow-md hover:translate-y-[-2px] active:scale-[0.98] ${reservation.status === ReservationStatus.CHECKED_IN ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <div className="text-xl font-black text-slate-800 tracking-tight">
            {reservation.time}
          </div>
          {reservation.tableNumber && (
            <span className="flex items-center text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              <Hash className="w-2.5 h-2.5 mr-0.5" /> Mesa {reservation.tableNumber}
            </span>
          )}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(reservation.status)}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center mb-1">
        {isVip && <Star className="w-4 h-4 text-orange-500 mr-1 fill-orange-500" title="Cliente VIP" />}
        <h3 className="text-lg font-bold text-slate-900 truncate uppercase">
          {reservation.clientName}
        </h3>
        {historyCount > 0 && (
          <span className="ml-2 inline-flex items-center text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">
            {historyCount + (reservation.status === ReservationStatus.COMPLETED ? 0 : 1)}ª Visita
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 pb-3 border-b border-slate-50">
        <div className="flex items-center text-xs font-bold text-slate-500">
          <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
          {reservation.peopleCount} <span className="font-normal ml-0.5 text-slate-400 lowercase">clientes jotaka</span>
        </div>
        <div className="flex items-center text-xs font-bold text-slate-500">
          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
          {reservation.eventType}
        </div>
        {reservation.specialNotes && (
          <div className="flex items-center text-xs font-bold text-orange-500 animate-pulse">
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            Observação
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1 text-[8px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-1.5 text-slate-300">
              <UserIcon className="w-2.5 h-2.5" />
              <span>CRIADO: <span className="text-slate-500">{creatorEmail}</span></span>
          </div>
          {lastModifierEmail !== creatorEmail && (
            <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-2.5 h-2.5" />
                <span>MODIFICADO: <span className="text-slate-500">{lastModifierEmail}</span></span>
            </div>
          )}
      </div>

      {reservation.area && (
        <div className="absolute bottom-12 right-4 opacity-5 font-black text-2xl select-none uppercase -rotate-12 pointer-events-none">
          {reservation.area}
        </div>
      )}
    </div>
  );
};
