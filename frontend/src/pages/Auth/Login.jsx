import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, Lock, Mail, ArrowRight, Github, Chrome as Google } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        // Redirigir según el tipo de usuario (por ahora a home)
        navigate('/admin');
      } else {
        setError(result.error);
      }
    } else {
      alert("Lógica de registro próximamente...");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 font-['Inter']">
      
      {/* Background Blobs (Legacy style) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#5DADE2] rounded-full mix-blend-multiply filter blur-[128px] opacity-15 animate-pulse"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#34D399] rounded-full mix-blend-multiply filter blur-[128px] opacity-12 animate-pulse delay-700"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-[#85C1E2] rounded-full mix-blend-multiply filter blur-[128px] opacity-12 animate-pulse delay-1000"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden bg-white/85 backdrop-blur-xl border border-white/20 shadow-2xl relative z-10 min-h-[600px]">
        
        {/* Left Side: Branding (Legacy) */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-[#5DADE2]/15 to-[#34D399]/10 relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-[#5DADE2]/30">
                <span className="text-2xl font-bold text-[#5DADE2]">P</span>
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-wide uppercase">PIXSOFT</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">Tu Hardware,<br />Tu Potencial.</h2>
            <p className="text-slate-600 text-sm leading-relaxed">Accede a la plataforma líder en venta y arrendamiento de equipo de cómputo.</p>
          </div>
          <p className="text-xs text-slate-500 relative z-10">© 2025 Pixsoft Inc.</p>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center bg-white/40">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Bienvenido de nuevo' : 'Crear Cuenta'}
            </h3>
            <p className="text-slate-600 text-sm">
              {isLogin ? 'Ingresa tus credenciales para acceder' : 'Únete a Pixsoft hoy mismo'}
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#5DADE2] transition-colors" />
                </div>
                <input 
                  type="text" name="username" required
                  value={formData.username} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DADE2]/20 focus:border-[#5DADE2] outline-none transition-all"
                  placeholder="usuario@pixsoft.com"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#5DADE2]" />
                  </div>
                  <input 
                    type="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5DADE2]/20"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#5DADE2]" />
                </div>
                <input 
                  type="password" name="password" required
                  value={formData.password} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5DADE2]/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-lg bg-gradient-to-r from-[#5DADE2] to-[#34D399] text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-95">
              <span>{isLogin ? 'Ingresar' : 'Registrarse'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <span className="relative px-2 bg-white text-slate-400 text-xs uppercase tracking-widest">O continúa con</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-sm">
                <Google className="w-4 h-4 text-red-500" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-sm">
                <Github className="w-4 h-4 text-slate-900" /> Github
              </button>
            </div>
          </div>

          <p className="text-center text-slate-600 text-sm mt-8">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-[#5DADE2] hover:text-[#34D399] font-medium transition-colors"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
