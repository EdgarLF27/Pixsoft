export default function HeroCard({ 
  category, 
  title, 
  subtitle, 
  buttonText, 
  color = "blue", // color base por defecto
  image, 
  onClick 
}) {
  // Mapeo de colores para Tailwind (Tailwind no permite interpolación dinámica completa tipo `bg-${color}-100` si no se configura safelist, así que es mejor ser explícito o usar objetos de estilo)
  // Sin embargo, para este ejemplo simple, usaremos clases condicionales o un objeto de configuración.
  
  const colors = {
    blue: {
      badgeBg: "bg-blue-100",
      badgeText: "text-blue-600",
      badgeBorder: "border-blue-200",
      accentText: "text-blue-500",
      btnBg: "bg-blue-600",
      btnHover: "hover:bg-blue-500",
      gradient: "from-blue-50",
      shadow: "shadow-blue-600/20"
    },
    cyan: {
      badgeBg: "bg-cyan-100",
      badgeText: "text-cyan-600",
      badgeBorder: "border-cyan-200",
      accentText: "text-cyan-500",
      btnBg: "bg-cyan-600",
      btnHover: "hover:bg-cyan-500",
      gradient: "from-cyan-50",
      shadow: "shadow-cyan-600/20"
    }
  };

  const theme = colors[color] || colors.blue;

  return (
    <div className="relative overflow-hidden group h-[400px] flex flex-col justify-center bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all p-8">
      {/* Fondo con degradado sutil */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} to-transparent opacity-50`}></div>
      
      <div className="relative z-10 max-w-md">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
          {category}
        </span>
        
        <h2 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
          {title} <br />
          <span className={theme.accentText}>{subtitle}</span>
        </h2>
        
        <p className="text-slate-600 mb-8 text-lg">
          {/* Aquí podríamos pasar una descripción más larga si quisiéramos */}
          Soluciones de alto rendimiento para tus necesidades.
        </p>
        
        <button
          onClick={onClick}
          className={`px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all hover:-translate-y-1 ${theme.btnBg} ${theme.btnHover} ${theme.shadow}`}
        >
          {buttonText}
        </button>
      </div>

      {/* Imagen decorativa con rotación y efectos */}
      <img
        src={image}
        alt={title}
        className="absolute -right-20 -bottom-20 w-96 opacity-80 group-hover:scale-110 transition-all duration-500 rotate-12 drop-shadow-2xl"
      />
    </div>
  );
}
