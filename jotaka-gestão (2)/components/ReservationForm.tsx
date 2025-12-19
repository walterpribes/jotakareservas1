
import React, { useState, useEffect } from 'react';
import { Client, Reservation, ReservationStatus, UnitId } from '../types';
import { createClient, getClients, updateClient } from '../services/api';
import { Search, Check, AlertTriangle, Hash, MessageSquare, Star, XCircle, Gift, Users as UsersIcon, Utensils, MoreHorizontal, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  unitId: UnitId;
  initialData?: Reservation;
  onClose: () => void;
  onSubmit: (data: any, client: Client) => Promise<void>;
}

// Auxiliar local
const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ReservationForm: React.FC<Props> = ({ unitId, initialData, onClose, onSubmit }) => {
  const [clientSearch, setClientSearch] = useState(initialData?.clientName || '');
  const [phone, setPhone] = useState(initialData?.clientPhone || '');
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    initialData ? { id: initialData.clientId, name: initialData.clientName, phone: initialData.clientPhone, visits: [], isVip: false } : null
  );
  
  const [date, setDate] = useState(initialData?.date || getLocalDateString());
  const [time, setTime] = useState(initialData?.time?.substring(0, 5) || '19:00');
  const [peopleCount, setPeopleCount] = useState(initialData?.peopleCount || 2);
  const [area, setArea] = useState<'TERRACO' | 'SALAO'>(initialData?.area || 'SALAO');
  const [tableNumber, setTableNumber] = useState(initialData?.tableNumber || '');
  const [specialNotes, setSpecialNotes] = useState(initialData?.specialNotes || '');
  const [isVip, setIsVip] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const commonMotivos = ['Jantar/Almoço', 'Aniversário', 'Confraternização'];
  const initialMotivo = initialData?.eventType || 'Jantar/Almoço';
  const isInitialCustom = !commonMotivos.includes(initialMotivo);
  
  const [selectedMotivo, setSelectedMotivo] = useState(isInitialCustom ? 'Outro' : initialMotivo);
  const [customMotivo, setCustomMotivo] = useState(isInitialCustom ? initialMotivo : '');

  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const hasTerraco = unitId === UnitId.ASA_SUL;

  useEffect(() => {
    let isMounted = true;
    if (clientSearch.length > 2 && !selectedClient) {
      getClients(clientSearch).then(results => {
        if (isMounted) {
          setSearchResults(results);
          setIsSearching(true);
        }
      }).catch(err => {
        console.error("Search error:", err);
      });
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
    return () => { isMounted = false; };
  }, [clientSearch, selectedClient]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setPhone(client.phone);
    setIsVip(!!client.isVip);
    setIsSearching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientSearch.trim()) return alert("Nome do cliente obrigatório.");
    if (!phone.trim() || phone.length < 8) return alert("Telefone obrigatório.");
    
    setIsSubmitting(true);
    let client = selectedClient;
    try {
      if (!client) {
        client = await createClient(clientSearch, phone, isVip);
      } else if (isVip !== client.isVip) {
        await updateClient(client.id, { isVip });
        client = { ...client, isVip };
      }

      const finalEventType = selectedMotivo === 'Outro' ? customMotivo : selectedMotivo;

      const reservationData = {
          unitId,
          date,
          time,
          peopleCount,
          eventType: finalEventType || 'Jantar/Almoço',
          area: hasTerraco ? area : 'SALAO',
          tableNumber,
          specialNotes,
          status: initialData ? initialData.status : ReservationStatus.PENDING,
          clientId: client.id,
          clientName: client.name,
          clientPhone: client.phone
      };

      await onSubmit(reservationData, client);
      setIsSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Submission error:", err);
      alert("Ocorreu um erro ao salvar a reserva. Verifique os dados e tente novamente.");
      setIsSubmitting(false);
    }
  };

  const MotivoButton = ({ label, icon: Icon }: { label: string, icon: any }) => (
    <button
      type="button"
      onClick={() => setSelectedMotivo(label)}
      disabled={isSubmitting || isSuccess}
      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 flex-1 ${selectedMotivo === label ? 'bg-blue-600 border-blue-700 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
    >
      <Icon className={`w-4 h-4 ${selectedMotivo === label ? 'text-white' : 'text-slate-400'}`} />
      <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-tight">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        
        {isSuccess && (
          <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
             <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-in zoom-in-50 duration-500" />
             </div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Reserva salva com sucesso!</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronizado com Jotaka Cloud</p>
          </div>
        )}

        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
            {initialData ? 'Editar Registro' : 'Novo Lançamento'}
          </h2>
          <button onClick={onClose} disabled={isSubmitting || isSuccess} className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30">
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-6 space-y-6 transition-opacity duration-300 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nome do Cliente</label>
              <div className="relative">
                <input
                  type="text"
                  value={clientSearch}
                  disabled={(!!selectedClient && !!initialData) || isSubmitting}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Nome completo..."
                  className={`w-full p-4 border rounded-2xl font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${selectedClient ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}
                />
                {selectedClient ? (
                  <Check className="absolute right-4 top-4 w-5 h-5 text-emerald-600" />
                ) : (
                  <Search className="absolute right-4 top-4 w-5 h-5 text-slate-400" />
                )}
              </div>

              {isSearching && searchResults.length > 0 && !isSubmitting && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-top-2">
                  {searchResults.map(c => (
                    <button key={c.id} type="button" onClick={() => handleSelectClient(c)} className="w-full p-4 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.phone}</div>
                      </div>
                      {c.isVip && <Star className="w-4 h-4 text-orange-500 fill-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Telefone</label>
                <input type="tel" value={phone} disabled={(!!selectedClient && !!initialData) || isSubmitting} onChange={e => setPhone(e.target.value)} placeholder="61 9..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-blue-600" />
              </div>
              <div className="flex items-center space-x-3 pt-5">
                 <button type="button" disabled={isSubmitting} onClick={() => setIsVip(!isVip)} className={`flex items-center justify-center p-3 rounded-2xl border-2 transition-all font-bold text-xs flex-1 ${isVip ? 'bg-orange-500 border-orange-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    <Star className={`w-4 h-4 mr-2 ${isVip ? 'fill-white' : ''}`} /> VIP
                 </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Motivo da Reserva</label>
            <div className="flex gap-2">
              <MotivoButton label="Jantar/Almoço" icon={Utensils} />
              <MotivoButton label="Aniversário" icon={Gift} />
              <MotivoButton label="Confraternização" icon={UsersIcon} />
              <MotivoButton label="Outro" icon={MoreHorizontal} />
            </div>
            {selectedMotivo === 'Outro' && (
              <input
                type="text"
                disabled={isSubmitting}
                value={customMotivo}
                onChange={e => setCustomMotivo(e.target.value)}
                placeholder="Especifique o motivo..."
                className="w-full mt-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl font-bold text-blue-600 animate-in slide-in-from-top-2"
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Data</label>
              <input type="date" disabled={isSubmitting} value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-blue-600" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Hora</label>
              <input type="time" disabled={isSubmitting} value={time} onChange={e => setTime(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-blue-600" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Clientes JOTAKA</label>
              <input type="number" disabled={isSubmitting} value={peopleCount} onChange={e => setPeopleCount(parseInt(e.target.value))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-blue-600" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Mesa</label>
              <div className="relative">
                <Hash className="absolute left-4 top-4.5 w-4 h-4 text-slate-400" />
                <input type="text" disabled={isSubmitting} value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="00" className="w-full pl-10 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-blue-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Área</label>
              {hasTerraco ? (
                <select disabled={isSubmitting} value={area} onChange={e => setArea(e.target.value as any)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none text-blue-600">
                  <option value="SALAO">Salão</option>
                  <option value="TERRACO">Terraço</option>
                </select>
              ) : (
                <div className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 flex items-center justify-center gap-1.5 cursor-not-allowed">
                  <MapPin className="w-3 h-3" /> Salão
                </div>
              )}
            </div>
          </div>

          <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block text-orange-600">Observações Estratégicas</label>
             <textarea 
               value={specialNotes} 
               disabled={isSubmitting}
               onChange={e => setSpecialNotes(e.target.value)} 
               placeholder="Restrições, Aniversário, Preferência de mesa..." 
               className="w-full p-4 bg-orange-50 border border-orange-100 rounded-2xl font-bold text-blue-600 focus:ring-2 focus:ring-orange-500 focus:outline-none min-h-[100px]"
             />
          </div>
        </div>

        <div className={`p-6 border-t border-slate-100 bg-slate-50 flex gap-3 transition-opacity duration-300 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
          <button type="button" disabled={isSubmitting} onClick={onClose} className="flex-1 py-4 font-bold text-slate-400 uppercase tracking-widest text-xs hover:text-slate-600 disabled:opacity-30">Cancelar</button>
          <button type="button" disabled={isSubmitting} onClick={handleSubmit} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? 'Salvando...' : 'Confirmar Lançamento'}
          </button>
        </div>
      </div>
    </div>
  );
};
