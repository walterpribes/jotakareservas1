
import React, { useState } from 'react';
import { User } from '../types';
import { login } from '../services/api';
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const LOGO_URL = "https://i.ibb.co/v6Sdf7G7/jotaka-eee.png";

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState<'email' | 'password' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError(null);

    if (!email.trim() || !email.includes('@')) {
        setError('Por favor, informe um e-mail válido.');
        setFieldError('email');
        return;
    }

    if (!password.trim()) {
        setError('Por favor, digite sua senha.');
        setFieldError('password');
        return;
    }

    setIsLoading(true);

    const response = await login(email, password);
    if (response.success === false) {
        setError(response.message || 'Credenciais inválidas ou acesso não autorizado');
        setIsLoading(false);
    } else {
        onLogin(response.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-blue-600 opacity-20 transform -skew-y-6 origin-top-left"></div>
            <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-4 p-1 bg-white rounded-full shadow-xl overflow-hidden flex items-center justify-center border-4 border-slate-800">
                    <img src={LOGO_URL} className="w-full h-full object-cover rounded-full" alt="JOTAKA Logo" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">JOTAKA</h1>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Acesso Restrito a Colaboradores
                </p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
            <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">E-mail Corporativo</label>
                <div className="relative">
                    <Mail className={`absolute left-3 top-3.5 w-5 h-5 ${fieldError === 'email' ? 'text-red-400' : 'text-slate-300'}`} />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); setFieldError(null); }}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all font-bold text-blue-600
                            ${fieldError === 'email' ? 'border-red-300 ring-red-200 focus:ring-red-200' : 'border-slate-100 focus:ring-blue-500'}
                            placeholder-slate-300
                        `}
                        placeholder="exemplo@jotaka.com.br"
                        autoComplete="email"
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Senha</label>
                <div className="relative">
                    <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${fieldError === 'password' ? 'text-red-400' : 'text-slate-300'}`} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); setFieldError(null); }}
                        className={`w-full pl-10 pr-12 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none transition-all font-bold text-blue-600
                             ${fieldError === 'password' ? 'border-red-300 ring-red-200 focus:ring-red-200' : 'border-slate-100 focus:ring-blue-500'}
                             placeholder-slate-300
                        `}
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 p-1 text-slate-300 hover:text-slate-500 focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-start text-red-600 text-[11px] font-bold bg-red-50 p-3 rounded-xl border border-red-100 animate-in shake duration-300">
                    <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center shadow-xl active:scale-95 uppercase text-[10px] tracking-widest
                    ${isLoading ? 'bg-slate-700 cursor-wait' : 'bg-slate-900 hover:bg-black text-white'}
                `}
            >
                {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    <>
                        Entrar no Sistema
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                )}
            </button>
            
            <div className="text-center pt-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                    Caso não possua acesso, entre em contato com a gerência do grupo.
                </p>
            </div>
        </form>
      </div>
    </div>
  );
};
