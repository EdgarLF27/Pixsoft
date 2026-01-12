const ProductCard = ({ product }) => {
  // URL base para imágenes (usaremos placeholder si no hay imagen)
  const imageUrl = product.image || "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image";

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 group">
      {/* Contenedor de Imagen */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
        />
        {/* Badge de Categoría (opcional) */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
          {product.category || 'General'}
        </div>
      </div>

      {/* Info del Producto */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-2 truncate" title={product.name}>
          {product.name}
        </h3>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {product.description || "Sin descripción disponible."}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase font-semibold">Precio</span>
            <span className="text-xl font-extrabold text-blue-600">
              ${parseFloat(product.price).toLocaleString()}
            </span>
          </div>
          
          <button className="bg-slate-900 hover:bg-blue-600 text-white p-3 rounded-full transition-colors shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
