/**
 * Renders the Client Footer component
 */
function renderFooter() {
  const footerHTML = `
    <footer class="border-t border-slate-200 bg-white/80 backdrop-blur-lg pt-12 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div class="col-span-1 md:col-span-1">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="relative w-8 h-8 flex items-center justify-center">
                            <span class="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-br from-[#5DADE2] to-[#85C1E2]" style="font-family: sans-serif;">P</span>
                        </div>
                        <span class="text-xl font-bold text-slate-900">PIXSOFT</span>
                    </div>
                    <p class="text-slate-500 text-sm mb-4">Tu aliado tecnológico en hardware de alto rendimiento y soluciones de arrendamiento empresarial.</p>
                    <div class="flex gap-4">
                        <a href="#" class="text-slate-400 hover:text-pixsoft-primary transition-colors"><i class="fa-brands fa-facebook"></i></a>
                        <a href="#" class="text-slate-400 hover:text-pixsoft-primary transition-colors"><i class="fa-brands fa-twitter"></i></a>
                        <a href="#" class="text-slate-400 hover:text-pixsoft-primary transition-colors"><i class="fa-brands fa-instagram"></i></a>
                    </div>
                </div>
                <div>
                    <h4 class="text-slate-900 font-bold mb-4">Comprar</h4>
                    <ul class="space-y-2 text-sm text-slate-500">
                        <li><a href="#" onclick="filterProductsByCategory('hardware')" class="hover:text-pixsoft-primary transition-colors cursor-pointer">Componentes PC</a></li>
                        <li><a href="#" onclick="filterProductsByCategory('laptops')" class="hover:text-pixsoft-primary transition-colors cursor-pointer">Laptops Gamer</a></li>
                        <li><a href="#" onclick="filterProductsByCategory('accesorios')" class="hover:text-pixsoft-primary transition-colors cursor-pointer">Monitores</a></li>
                        <li><a href="#" onclick="filterProductsByCategory('accesorios')" class="hover:text-pixsoft-primary transition-colors cursor-pointer">Periféricos</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-slate-900 font-bold mb-4">Empresas</h4>
                    <ul class="space-y-2 text-sm text-slate-500">
                        <li><a href="#" onclick="filterProductsByCategory('arrendamiento')" class="hover:text-pixsoft-primary transition-colors cursor-pointer">Arrendamiento de Equipo</a></li>
                        <li><a href="#" onclick="filterProductsByCategory('software')" class="hover:text-pixsoft-primary transition-colors cursor-pointer">Licenciamiento Software</a></li>
                        <li><a href="#" onclick="filterProductsByCategory('computadoras')" class="hover:text-pixsoft-primary transition-colors cursor-pointer">Servidores</a></li>
                        <li><a href="#" class="hover:text-pixsoft-primary transition-colors">Cotizador B2B</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-slate-900 font-bold mb-4">Soporte</h4>
                    <ul class="space-y-2 text-sm text-slate-500">
                        <li><a href="#" class="hover:text-pixsoft-primary transition-colors">Centro de Ayuda</a></li>
                        <li><a href="#" class="hover:text-pixsoft-primary transition-colors">Garantías</a></li>
                        <li><a href="#" class="hover:text-pixsoft-primary transition-colors">Estado del Pedido</a></li>
                        <li><a href="#" class="hover:text-pixsoft-primary transition-colors">Contacto</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-slate-500 text-sm">© 2025 PIXSOFT. Todos los derechos reservados.</p>
                <div class="flex gap-4 text-slate-500 text-sm">
                    <a href="#" class="hover:text-pixsoft-primary transition-colors">Privacidad</a>
                    <a href="#" class="hover:text-pixsoft-primary transition-colors">Términos</a>
                </div>
            </div>
        </div>
    </footer>
  `;

  const container = document.getElementById("footer-container");
  if (container) {
    container.outerHTML = footerHTML;
  } else {
    console.error("Footer container not found");
  }
}
