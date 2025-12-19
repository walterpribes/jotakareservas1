
import React, { useState, useEffect } from 'react';
import { getClients, deleteClient } from '../services/api';
import { Client } from '../types';
import { Search, User, CalendarClock, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export const ClientList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchClients = () => {
    getClients(searchTerm).then(data => {
      setClients(data);
    });
  };

  useEffect(() => {
    fetchClients();
  }, [searchTerm]);

  const toggleClient = (id: string) => {
    setExpandedClientId(expandedClientId === id ? null : id);
  };

  const handleDeleteClient = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`⚠️ EXCLUSÃO DE CLIENTE\n\nDeseja remover "${name}" permanentemente?\n\nIsso também apagará todo o histórico de reservas dele no Jotaka Cloud.`)) {
      setIsDeleting(id);
      try {
        await deleteClient(id);
        setClients(prev => prev.filter(c => c.id !== id));
        if (expandedClientId === id) setExpandedClientId(null);
      } catch (err: any) {
        let msg = "Erro ao excluir cliente.";
        console.error("Erro na exclusão:", err);

        if (err.message?.includes("foreign key constraint") || err.code === '23503') {
            msg = "🚨 OPERAÇÃO BLOQUEADA PELO BANCO\n\nEste cliente possui reservas vinculadas. Para permitir a exclusão, você deve rodar o script SQL de 'ON DELETE CASCADE' no painel do Supabase.\n\nContate o administrador do sistema.";
        } else if (err.message?.includes("row-level security") || err.code === '42501') {
            msg = "🚨 ERRO DE PERMISSÃO\n\nSua conta não tem autorização para excluir registros. Verifique as Políticas (RLS) no Supabase.";
        } else {
            msg = "🚨 FALHA NA EXCLUSÃO\n\nMotivo: " + (err.message || "Erro de conexão com o servidor.");
        }
        alert(msg);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="sticky top-0 bg-slate-50 pb-4 z-10 space-y-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Base de Clientes</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controle de Fidelidade JOTAKA</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-600"
            />
            <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-400" />
          </div>
      </div>

      <div className="space-y-3">
        {clients.map(client => {
            const lastVisits = expandedClientId === client.id ? (client.visits || []).slice(-3).reverse() : [];
            const isCurrentDeleting = isDeleting === client.id;
            
            return (
            <div 
                key={client.id}
                onClick={() => toggleClient(client.id)}
                className={`bg-white rounded-3xl p-5 shadow-sm border border-slate-100 cursor-pointer active:scale-[0.99] transition-all hover:shadow-md ${expandedClientId === client.id ? 'ring-2 ring-blue-500/20' : ''}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${client.isVip ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                            {client.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tight leading-none">{client.name}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">{client.phone}</p>
                        </div>
                    </div>
                    {client.isVip && (
                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                            VIP
                        </div>
                    )}
                </div>

                {expandedClientId === client.id && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 space-y-6">
                    <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                            <CalendarClock className="w-3.5 h-3.5 mr-1.5" />
                            Linha do Tempo de Visitas
                        </h4>
                        {lastVisits.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                                {lastVisits.map((date, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-black border border-blue-100">
                                        {date.split('-').reverse().join('/')}
                                    </span>
                                ))}
                                {(client.visits?.length || 0) > 3 && (
                                    <span className="flex items-center text-[10px] font-black text-slate-300 uppercase px-2">+{client.visits.length - 3} anteriores</span>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Nenhuma visita confirmada</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button 
                            onClick={(e) => handleDeleteClient(e, client.id, client.name)}
                            disabled={isCurrentDeleting}
                            className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            {isCurrentDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Excluir Cliente
                        </button>
                    </div>
                </div>
                )}
            </div>
            );
        })}
        
        {clients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <User className="w-16 h-16 mb-4" />
                <p className="font-black uppercase text-xs tracking-[0.3em]">Nenhum cadastro encontrado</p>
            </div>
        )}
      </div>
    </div>
  );
};
