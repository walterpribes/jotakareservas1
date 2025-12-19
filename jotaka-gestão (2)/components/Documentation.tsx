
import React from 'react';
import { 
  BookOpen, Calendar, Users, BarChart3, ShieldCheck, Info, MapPin, 
  CheckCircle2, MessageCircle, AlertTriangle, LogOut, DollarSign, 
  History, Search, PlusCircle, User as UserIcon, Clock, Star, 
  ShieldAlert, LayoutDashboard, Megaphone, FileDown, ArrowRightLeft, 
  MousePointer2, Zap, Flame
} from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <div className="pb-24 space-y-12 animate-in fade-in duration-500 max-w-3xl mx-auto px-4">
      
      {/* Header Hero */}
      <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-center relative overflow-hidden border-4 border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
            <div className="w-20 h-20 bg-white text-slate-900 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl rotate-3">
                <BookOpen className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Manual de Operações</h2>
            <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">Protocolos Jotaka Cozinha e Bar</p>
        </div>
      </div>

      {/* 1. ACESSO E SEGURANÇA */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-blue-600">01. Acesso e Sessão</h3>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
                O acesso ao sistema é restrito e individual. A segurança da informação é prioridade no Grupo Jotaka.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Expiração Automática
                    </h4>
                    <p className="text-[11px] font-bold text-slate-500">As sessões expiram após 8 horas de inatividade para proteção dos dados da unidade.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase text-rose-600 mb-1 flex items-center gap-1">
                        <LogOut className="w-3 h-3" /> Logout Seguro
                    </h4>
                    <p className="text-[11px] font-bold text-slate-500">Sempre utilize o botão de LogOut ao encerrar o turno. Isso limpa o cache de segurança local.</p>
                </div>
            </div>
        </div>
      </section>

      {/* 2. GESTÃO DE AGENDA */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-blue-600">02. Controle de Agenda</h3>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-3">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <MousePointer2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase text-slate-900">Seleção de Data</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-snug">
                            O calendário mostra indicadores de fluxo: <span className="text-blue-600">Azul</span> para reservas agendadas e <span className="text-emerald-600">Verde</span> para reservas criadas naquele dia.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <Search className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase text-slate-900">Busca Inteligente</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-snug">
                            Pesquise por Nome do Cliente, Telefone ou Número da Mesa. O sistema filtra instantaneamente em tempo real.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase text-slate-900">Botão de Lançamento (+)</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-snug">
                            O botão azul flutuante abre o formulário de reserva. Se o cliente já existir na base, o sistema preencherá o telefone automaticamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 3. CICLO DE STATUS */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-blue-600">03. Fluxo de Atendimento</h3>
        </div>
        <div className="grid gap-3">
          {[
            { status: 'Agendado (Pending)', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', desc: 'Status inicial. Indica que a reserva foi feita, mas não houve contato de confirmação recente.', icon: Clock },
            { status: 'Pré-Confirmado (Confirmed)', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', desc: 'O cliente confirmou que virá (via ligação ou WhatsApp). Use o botão "Pré-Confirmar".', icon: MessageCircle },
            { status: 'Presente (Checked-in)', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', desc: 'O cliente chegou na casa. O card ganha uma borda azul vibrante. Identifica ocupação de mesa.', icon: UserIcon },
            { status: 'Finalizado (Completed)', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', desc: 'Atendimento concluído. É OBRIGATÓRIO informar o valor gasto e o número real de pessoas.', icon: CheckCircle2 },
            { status: 'Exceções (No-Show/Cancelado)', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', desc: 'Use para clientes que não vieram ou cancelaram previamente. Mantém o histórico limpo.', icon: AlertTriangle }
          ].map((step, i) => (
            <div key={i} className={`flex items-start space-x-4 p-5 rounded-[2rem] border-2 transition-all ${step.bg} ${step.border}`}>
              <div className={`p-3 rounded-2xl bg-white shadow-sm ${step.color}`}><step.icon className="w-6 h-6" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-black uppercase text-xs tracking-widest ${step.color}`}>{step.status}</h4>
                    <span className="text-[8px] font-black text-slate-400">PASSO {i + 1}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-bold leading-tight">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. AUDITORIA E CORREÇÕES */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-blue-600">04. Auditoria e "Botão Corrigir"</h3>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="flex gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <History className="w-7 h-7 text-blue-400" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-black uppercase text-white tracking-widest">Linha do Tempo Inviolável</h4>
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                        Cada reserva possui um <span className="text-blue-400">Histórico Operacional</span>. Ele registra o timestamp exato e o e-mail do colaborador que realizou qualquer alteração de status ou nota.
                    </p>
                </div>
            </div>
            
            <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-3xl space-y-2">
                <h4 className="text-[10px] font-black uppercase text-rose-400 tracking-widest flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4" /> Função: Corrigir Erros Operacionais
                </h4>
                <p className="text-[11px] text-slate-300 font-bold">
                    Caso tenha dado check-in na reserva errada ou queira reabrir um atendimento finalizado, use o botão <span className="text-white bg-rose-600 px-1.5 py-0.5 rounded">CORRIGIR</span>. Ele permite retornar o status para qualquer estágio anterior.
                </p>
            </div>
        </div>
      </section>

      {/* 5. CLIENTES E VIPs */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <Star className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-blue-600">05. Base de Dados e VIPs</h3>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-3xl border border-orange-100">
                <Star className="w-8 h-8 text-orange-500 fill-orange-500 shrink-0" />
                <div>
                    <h4 className="text-xs font-black uppercase text-orange-600">Selo de Cliente VIP</h4>
                    <p className="text-[11px] text-slate-600 font-bold">
                        Ao cadastrar ou editar um cliente, você pode marcar a flag <span className="text-orange-600">VIP</span>. Isso fará com que o card do cliente brilhe com uma estrela laranja na agenda principal.
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-3xl border border-blue-100">
                <Users className="w-8 h-8 text-blue-600 shrink-0" />
                <div>
                    <h4 className="text-xs font-black uppercase text-blue-600">Contador de Visitas</h4>
                    <p className="text-[11px] text-slate-600 font-bold">
                        O sistema conta automaticamente as visitas finalizadas. Se o card diz "4ª Visita", trate este cliente como um veterano da casa!
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* 6. BI E PERFORMANCE */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-blue-600">06. BI Jotaka (Dashboard)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black uppercase text-slate-900">Métricas de Receita</h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                    Acompanhe o faturamento total lançado e o Ticket Médio. Filtre por Dia, Semana, Mês ou Ano para análises comparativas.
                </p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black uppercase text-slate-900">Ocupação vs. Captação</h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                    Veja quais dias os clientes preferem vir (Ocupação) versus quais dias os clientes mais entram em contato para reservar (Captação).
                </p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-3 col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                    <FileDown className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-xs font-black uppercase text-slate-900">Exportação de Dados</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                    O botão de planilha no Dashboard gera um arquivo CSV completo com todos os registros do período selecionado para uso em Excel ou BI externo.
                </p>
            </div>
        </div>
      </section>

      {/* 7. MURAL INTERNO */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-blue-600">07. Mural Jotaka</h3>
        </div>
        <div className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <p className="text-sm font-bold text-blue-100 leading-relaxed">
                Utilize o Mural (botão Megafone no canto inferior esquerdo) para comunicar diretrizes do dia, metas de vendas ou avisos urgentes para toda a equipe logada.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase bg-blue-700/50 p-3 rounded-2xl border border-blue-400/30">
                <Flame className="w-4 h-4 fill-white" />
                <span>Avisos marcados como "Urgente" geram um alerta visual no botão do mural.</span>
            </div>
        </div>
      </section>

      {/* Footer Branding */}
      <div className="text-center pt-10 border-t border-slate-200 opacity-40">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl mx-auto mb-3 flex items-center justify-center font-black text-white text-lg">J</div>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-900">JOTAKA CLOUD &copy; 2025</p>
          <p className="text-[7px] font-bold uppercase tracking-widest mt-1">SISTEMA DE ALTA PERFORMANCE PARA GASTRONOMIA</p>
      </div>
    </div>
  );
};
