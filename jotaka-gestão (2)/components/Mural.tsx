
import React, { useState, useEffect } from 'react';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../services/api';
import { Notice, User } from '../types';
import { Megaphone, X, Plus, Trash2, Edit2, Check, Flame, MessageSquare, User as UserIcon, Loader2 } from 'lucide-react';

interface Props {
  user: User;
}

export const Mural: React.FC<Props> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    if (isOpen) fetchNotices();
  }, [isOpen]);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const data = await getNotices();
      setNotices(data);
    } catch (error) {
      console.error("Erro ao carregar mural:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert("Por favor, preencha o título e o conteúdo do comunicado.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = { 
        title: title.trim(), 
        content: content.trim(), 
        is_important: isImportant 
      };

      if (editingId) {
        await updateNotice(editingId, payload);
      } else {
        await createNotice({ 
          ...payload,
          author_name: user.username || user.name || 'Gestão Jotaka'
        });
      }
      
      resetForm();
      await fetchNotices();
    } catch (error: any) {
      console.error("Erro ao salvar aviso:", error);
      alert("Falha ao salvar no mural.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    // ESSENCIAL: Impede que o clique se espalhe para o card ou outros elementos
    e.preventDefault();
    e.stopPropagation(); 
    
    const confirmDelete = window.confirm("⚠️ EXCLUSÃO DEFINITIVA\n\nEste aviso será removido do mural de todos os usuários. Deseja continuar?");
    
    if (!confirmDelete) return;
    
    setDeletingId(id);
    try {
      await deleteNotice(id);
      setNotices(prev => prev.filter(n => n.id !== id));
      setDeletingId(null);
    } catch (error: any) {
      console.error("Erro ao deletar:", error);
      alert("Não foi possível excluir o aviso. Verifique sua conexão.");
      setDeletingId(null);
      fetchNotices();
    }
  };

  const startEdit = (e: React.MouseEvent, n: Notice) => {
    e.stopPropagation();
    setEditingId(n.id);
    setTitle(n.title);
    setContent(n.content);
    setIsImportant(n.is_important);
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsImportant(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-16 h-16 bg-slate-900 text-white rounded-3xl shadow-2xl flex items-center justify-center hover:bg-black active:scale-90 transition-all z-50 group border-2 border-slate-800"
      >
        <Megaphone className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        {notices.some(n => n.is_important) && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900 animate-pulse">
            !
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 opacity-20 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl">
                    <Megaphone className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">Mural Jotaka</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Informativos da Unidade</p>
                </div>
              </div>
              <button onClick={() => { setIsOpen(false); resetForm(); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {isAdding ? (
                <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in zoom-in-95">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">{editingId ? 'Editar Aviso' : 'Novo Comunicado'}</h3>
                  <input 
                    type="text" 
                    placeholder="Título do comunicado..." 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  />
                  <textarea 
                    placeholder="Conteúdo do aviso..." 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] disabled:opacity-50"
                  />
                  <button 
                    type="button"
                    onClick={() => setIsImportant(!isImportant)}
                    disabled={isSubmitting}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest
                        ${isImportant ? 'bg-orange-600 border-orange-700 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400'}
                    `}
                  >
                    <Flame className={`w-4 h-4 ${isImportant ? 'fill-white' : ''}`} /> 
                    Marcar como Importante
                  </button>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={resetForm} 
                      disabled={isSubmitting}
                      className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {isSubmitting ? 'Salvando...' : 'Publicar'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-lg flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all mb-6"
                  >
                    <Plus className="w-5 h-5" /> Criar Aviso
                  </button>

                  <div className="space-y-4">
                    {isLoading ? (
                        <div className="py-20 text-center text-slate-300 animate-pulse font-black uppercase text-xs">Atualizando mural...</div>
                    ) : notices.length === 0 ? (
                        <div className="py-20 text-center space-y-2 opacity-20">
                            <MessageSquare className="w-12 h-12 mx-auto" />
                            <p className="font-black uppercase text-[10px] tracking-widest">Sem avisos recentes</p>
                        </div>
                    ) : (
                        notices.map(n => (
                            <div 
                                key={n.id} 
                                className={`p-6 rounded-[2rem] border bg-white shadow-sm transition-all relative overflow-hidden group ${n.is_important ? 'border-orange-200' : 'border-slate-100'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 pr-4">
                                        <h4 className={`text-lg font-black uppercase tracking-tighter flex items-center gap-2 ${n.is_important ? 'text-orange-600' : 'text-slate-800'}`}>
                                            {n.is_important && <Flame className="w-4 h-4 fill-orange-600 shrink-0" />}
                                            {n.title}
                                        </h4>
                                    </div>
                                    
                                    <div className="flex gap-2 shrink-0">
                                        <button 
                                          onClick={(e) => startEdit(e, n)} 
                                          className="w-10 h-10 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100 flex items-center justify-center"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        
                                        <button 
                                          onClick={(e) => handleDelete(e, n.id)} 
                                          disabled={deletingId === n.id}
                                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border border-red-100 text-red-500 hover:bg-red-600 hover:text-white
                                            ${deletingId === n.id ? 'bg-slate-100 opacity-50' : 'bg-red-50'}
                                          `}
                                        >
                                          {deletingId === n.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm font-bold text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">{n.content}</p>
                                
                                <div className="flex items-center gap-2 border-t border-slate-50 pt-4">
                                    <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-[10px] font-black text-slate-300 border border-slate-100">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="text-blue-600">{n.author_name.split('@')[0]}</span>
                                    </span>
                                    <span className="ml-auto text-[10px] font-black text-slate-300 uppercase">
                                      {new Date(n.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
