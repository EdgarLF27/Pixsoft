import { useState } from "react";
import { ShoppingBag, User, LogOut, Search, Menu, X } from "lucide-react";

function Navbar({ cartItemCount = 0 }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login"; // Asumiendo que tendrás una ruta /login
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Logo */}
          <div className="shrink-0 flex items-center gap-3 cursor-pointer">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <span
                className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#5DADE2] to-[#85C1E2]"
                style={{ fontFamily: "sans-serif" }}
              >
                P
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              PIXSOFT
            </span>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-[#5DADE2] transition-colors w-5 h-5" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5DADE2]/50 focus:bg-white transition-all shadow-sm"
                placeholder="Buscar hardware, componentes, laptops..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart Icon */}
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="p-2 text-slate-600 hover:text-[#5DADE2] transition-colors relative block rounded-full hover:bg-slate-100"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-[#5DADE2] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {cartItemCount === 0 ? (
                    <div className="p-8 text-center">
                      <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">
                        Tu carrito está vacío
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Agrega productos para comenzar
                      </p>
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-center text-slate-500">
                        Items del carrito...
                      </p>
                      {/* Aquí iría la lista de items */}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Icon */}
            <a
              href="/profile"
              className="p-2 text-slate-600 hover:text-[#5DADE2] transition-colors rounded-full hover:bg-slate-100"
              title="Mi Perfil"
            >
              <User className="w-6 h-6" />
            </a>

            {/* Logout Button - Desktop */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="sm:hidden p-2 text-slate-600 hover:text-[#5DADE2]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Nav - Categories */}
      <div className="border-t border-slate-200 bg-white/50 backdrop-blur-md hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12 gap-8 overflow-x-auto text-sm font-medium text-slate-600 scrollbar-hide">
            {[
              "Hardware",
              "Computadoras",
              "Laptops",
              "Arrendamiento",
              "Software",
              "Accesorios",
            ].map((category) => (
              <a
                key={category}
                href={`#${category.toLowerCase()}`}
                className="hover:text-[#5DADE2] transition-colors whitespace-nowrap"
              >
                {category}
              </a>
            ))}
            <a
              href="#ofertas"
              className="hover:text-red-500 transition-colors whitespace-nowrap text-red-500/80"
            >
              Ofertas
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <input
            type="text"
            className="block w-full px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm mb-4"
            placeholder="Buscar..."
          />
          {[
            "Hardware",
            "Computadoras",
            "Laptops",
            "Arrendamiento",
            "Software",
            "Accesorios",
          ].map((category) => (
            <a
              key={category}
              href={`#${category.toLowerCase()}`}
              className="block text-slate-600 hover:text-[#5DADE2] py-2"
            >
              {category}
            </a>
          ))}
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-100 text-red-600 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </nav>
  );
}
export default Navbar;
