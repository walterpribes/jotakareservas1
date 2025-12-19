
import React, { useState } from 'react';
import { Reservation, ReservationStatus, HistoryEntry } from '../types';
import { 
  MessageCircle, CheckCircle, Edit3, XCircle, Users, LogOut, 
  RotateCcw, Hash, History, ChevronRight, Star, AlertTriangle, Check, RefreshCw, User as UserIcon, DollarSign, Plus, Minus, ArrowLeftRight, Clock, Trash2
} from 'lucide-react';
import { getStatusLabel } from '../services/api';

interface Props {
  reservation: Reservation;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onCheckIn: () => void;
  onCheckOut: (confirmedCount: number, spentAmount?: number) => void;
  onConfirm: () => void;
  onUndoCheckIn: () => void;
  onCancel: () => void;
  onNoShow: () => void;
  onUpdatePax?: (newPax: number) => void;
  onChangeStatus?: (status: ReservationStatus) => void;
}

export const ReservationDetails: React.FC<Props> = ({ 
    reservation, onClose, onEdit, onDelete, onCheckIn, onCheckOut, 
    onConfirm, onUndoCheckIn, onCancel, onNoShow, onUpdatePax, onChangeStatus
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isEditingPax, setIsEditingPax] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  
  const [actualPax, setActualPax] = useState(reservation.confirmedPeopleCount || reservation.peopleCount);
  const [tempPax, setTempPax] = useState(reservation.peopleCount);
  const [actualAmount, setActualAmount] = useState<string>(reservation.spentAmount?.toString() || '');

  const formatEmail = (email: string) => email.split('@')[0];

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleWhatsApp = () => {
    const msg = `Olá ${reservation.clientName}, confirmamos sua reserva no Jotaka para hoje (${reservation.date}) às ${reservation.time}.`;
    window.open(`https://wa.me/55${reservation.clientPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const isCompleted = reservation.status === ReservationStatus.COMPLETED;

  const handleQuickPaxUpdate = () => {
    if (onUpdatePax) {
      onUpdatePax(tempPax);
      setIsEditingPax(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()} 
      >
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500 mb-4 tracking-tighter">
            ID: {reservation.id.split('-')[0]} • {reservation.date}
          </div>
          <h2 className="text-5xl font-black text-blue-600 mb-1 tracking-tighter">{reservation.time}</h2>
          <p className="text-2xl font-bold text-blue-600 uppercase">{reservation.clientName}</p>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2">
             <div className="flex items-center gap-1">
                <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-bold text-slate-600 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> {reservation.peopleCount} clientes JOTAKA
                </span>
                {!isCompleted && !isEditingPax && !isFinalizing && !isChangingStatus && (
                  <button 
                    onClick={() => setIsEditingPax(true)}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Ajustar número de clientes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
             </div>

             {reservation.tableNumber && (
               <span className="bg-blue-50 px-3 py-1 rounded-lg text-sm font-bold text-blue-600 flex items-center">
                  <Hash className="w-3.5 h-3.5 mr-1.5" /> Mesa {reservation.tableNumber}
               </span>
             )}
             {isCompleted && (
               <>
                <span className="bg-emerald-50 px-3 py-1 rounded-lg text-sm font-bold text-emerald-600 flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> {reservation.confirmedPeopleCount} Clientes
                </span>
                {reservation.spentAmount != null && (
                    <span className="bg-emerald-600 px-3 py-1 rounded-lg text-sm font-bold text-white flex items-center shadow-sm">
                        <DollarSign className="w-3.5 h-3.5 mr-1" /> R$ {Number(reservation.spentAmount).toFixed(2)}
                    </span>
                )}
               </>
             )}
          </div>
          <div className="mt-2">
             <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                reservation.status === ReservationStatus.CHECKED_IN ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                reservation.status === ReservationStatus.PENDING ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                'bg-slate-100 text-slate-500 border-slate-200'
             }`}>
                Status Atual: {getStatusLabel(reservation.status)}
             </span>
          </div>
        </div>

        <div className="px-6 pb-8 space-y-4">
          
          {reservation.specialNotes && (
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-3xl space-y-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
                <p className="text-sm font-bold text-blue-600 leading-tight italic">"{reservation.specialNotes}"</p>
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t border-orange-200/50">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-[10px] font-black text-orange-600">
                      <UserIcon className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    POR: <span className="text-orange-600">{formatEmail(reservation.notesAuthor || 'SISTEMA')}</span>
                  </span>
              </div>
            </div>
          )}

          {isChangingStatus && (
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-700 animate-in zoom-in-95 space-y-4">
                <p className="text-xs font-black text-slate-400 text-center uppercase tracking-widest">Corrigir para qual estado?</p>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => { onChangeStatus?.(ReservationStatus.PENDING); setIsChangingStatus(false); }}
                        className="py-3 bg-slate-800 text-yellow-500 font-black rounded-xl border border-yellow-500/30 text-[10px] uppercase flex flex-col items-center gap-1"
                    >
                        <RotateCcw className="w-4 h-4" /> Agendado
                    </button>
                    <button 
                        onClick={() => { onChangeStatus?.(ReservationStatus.NOSHOW); setIsChangingStatus(false); }}
                        className="py-3 bg-slate-800 text-orange-500 font-black rounded-xl border border-orange-500/30 text-[10px] uppercase flex flex-col items-center gap-1"
                    >
                        <XCircle className="w-4 h-4" /> Não Apareceram
                    </button>
                    <button 
                        onClick={() => { onChangeStatus?.(ReservationStatus.CANCELED); setIsChangingStatus(false); }}
                        className="py-3 bg-slate-800 text-red-500 font-black rounded-xl border border-red-500/30 text-[10px] uppercase flex flex-col items-center gap-1"
                    >
                        <AlertTriangle className="w-4 h-4" /> Cancelar
                    </button>
                    <button 
                        onClick={() => setIsChangingStatus(false)}
                        className="py-3 bg-slate-700 text-white font-black rounded-xl text-[10px] uppercase"
                    >
                        Fechar
                    </button>
                </div>
            </div>
          )}

          {isEditingPax && (
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 animate-in zoom-in-95 space-y-4">
                <p className="text-xs font-black text-blue-800 text-center uppercase tracking-widest">Ajustar número de clientes JOTAKA</p>
                <div className="flex items-center justify-center space-x-8">
                    <button onClick={() => setTempPax(Math.max(1, tempPax - 1))} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-blue-200 text-2xl font-black text-blue-400 hover:text-blue-600 flex items-center justify-center"><Minus className="w-5 h-5" /></button>
                    <div className="text-center">
                        <span className="text-5xl font-black text-blue-600">{tempPax}</span>
                    </div>
                    <button onClick={() => setTempPax(tempPax + 1)} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-blue-200 text-2xl font-black text-blue-400 hover:text-blue-600 flex items-center justify-center"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setIsEditingPax(false); setTempPax(reservation.peopleCount); }} className="py-3 bg-white text-slate-500 font-bold rounded-xl border border-slate-200 text-[10px] uppercase">Cancelar</button>
                    <button onClick={handleQuickPaxUpdate} className="py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase shadow-lg">Confirmar Alteração</button>
                </div>
            </div>
          )}

          {!isFinalizing && !isEditingPax && !showHistory && !isChangingStatus && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <button onClick={onEdit} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                  <Edit3 className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-[9px] font-black uppercase text-blue-600">Editar</span>
                </button>
                <button onClick={handleWhatsApp} className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors">
                  <MessageCircle className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-[9px] font-black uppercase text-emerald-600">WhatsApp</span>
                </button>
                <button 
                    onClick={() => setIsChangingStatus(true)} 
                    className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-2xl border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <ArrowLeftRight className="w-5 h-5 text-orange-600 mb-1" />
                  <span className="text-[9px] font-black uppercase text-orange-600">Corrigir</span>
                </button>
              </div>

              <div className="grid gap-3">
                {reservation.status === ReservationStatus.PENDING && (
                  <>
                    <button onClick={onConfirm} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center">
                      <Check className="w-5 h-5 mr-2" /> Pré-Confirmar Reserva
                    </button>
                    <button onClick={onCheckIn} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                      Registrar Chegada
                    </button>
                  </>
                )}

                {reservation.status === ReservationStatus.CONFIRMED && (
                  <button onClick={onCheckIn} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                    Registrar Chegada
                  </button>
                )}

                {reservation.status === ReservationStatus.CHECKED_IN && (
                  <button onClick={() => setIsFinalizing(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center">
                    <LogOut className="w-5 h-5 mr-2" /> Finalizar Atendimento
                  </button>
                )}

                {isCompleted && (
                  <button onClick={() => setIsFinalizing(true)} className="w-full py-4 bg-slate-100 text-slate-800 rounded-2xl font-black uppercase tracking-widest shadow-sm hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2" /> Corrigir Fechamento
                  </button>
                )}
              </div>
            </div>
          )}

          {isFinalizing && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 animate-in zoom-in-95 space-y-6">
                <div>
                    <p className="text-sm font-black text-slate-800 mb-4 text-center uppercase tracking-widest">
                    Quantos clientes JOTAKA realmente vieram?
                    </p>
                    <div className="flex items-center justify-center space-x-6 mb-2">
                        <button onClick={() => setActualPax(Math.max(1, actualPax - 1))} className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 text-3xl font-black text-slate-400 hover:text-slate-900 flex items-center justify-center">-</button>
                        <div className="text-center">
                            <span className="text-6xl font-black text-blue-600">{actualPax}</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Final</p>
                        </div>
                        <button onClick={() => setActualPax(actualPax + 1)} className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 text-3xl font-black text-slate-400 hover:text-slate-900 flex items-center justify-center">+</button>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center">Valor Total Gasto (R$)</label>
                    <div className="relative max-w-[200px] mx-auto">
                        <DollarSign className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                        <input 
                            type="number"
                            step="0.01"
                            value={actualAmount}
                            onChange={e => setActualAmount(e.target.value)}
                            className="w-full pl-10 p-4 bg-white border border-slate-200 rounded-2xl font-black text-blue-600 text-center text-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setIsFinalizing(false)} className="py-4 bg-white text-slate-500 font-bold rounded-xl border border-slate-200 text-xs uppercase">Voltar</button>
                    <button 
                        onClick={() => { 
                            onCheckOut(actualPax, actualAmount ? parseFloat(actualAmount) : undefined); 
                            setIsFinalizing(false); 
                        }} 
                        className="py-4 bg-blue-600 text-white font-black rounded-xl text-xs uppercase shadow-lg active:scale-95 transition-all"
                    >
                        Confirmar Lançamento
                    </button>
                </div>
            </div>
          )}

          {showHistory && (
            <div className="bg-slate-50 p-4 rounded-3xl max-h-60 overflow-y-auto border border-slate-100 space-y-3 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center sticky top-0 bg-slate-50 pb-2 border-b border-slate-200 mb-2">
                 <h4 className="text-xs font-black text-slate-400 uppercase">Linha do Tempo / Auditoria</h4>
                 <button onClick={() => setShowHistory(false)} className="text-[10px] font-bold text-blue-600">Fechar</button>
              </div>
              {reservation.history.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-start space-x-3 text-[11px] py-1 border-b border-slate-100 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{h.action}</p>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <UserIcon className="w-2.5 h-2.5" />
                        <span>por <strong>{formatEmail(h.user)}</strong> às {formatTime(h.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isFinalizing && !isEditingPax && !showHistory && !isChangingStatus && (
            <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-100 gap-2">
               <div className="flex gap-4">
                 <button onClick={() => setShowHistory(true)} className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                   <History className="w-3 h-3 mr-1" /> Histórico Operacional
                 </button>
                 {onDelete && (
                    <button onClick={onDelete} className="flex items-center text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors">
                      <Trash2 className="w-3 h-3 mr-1" /> Excluir Registro
                    </button>
                 )}
               </div>
               {reservation.lastModifiedBy && (
                 <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-300 uppercase">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Última alteração por: <span className="text-slate-500">{formatEmail(reservation.lastModifiedBy)}</span></span>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
