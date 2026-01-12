import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Search } from "lucide-react";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Cargar productos y categorías al iniciar
  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:8000/api/v1/products/product/").then((res) =>
        res.json()
      ),
      fetch("http://127.0.0.1:8000/api/v1/products/category/").then((res) =>
        res.json()
      ),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch((error) => console.error("Error al cargar datos:", error))
      .finally(() => setLoading(false));
  }, []);

  // Función para obtener el nombre de la categoría por ID
  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : `ID: ${categoryId}`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/products/product/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        alert("Producto eliminado");
      } else {
        alert("No se pudo eliminar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku &&
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500 text-lg">
        Cargando catálogo...
      </div>
    );

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Productos
          </h1>
          <p className="text-slate-500 text-sm">
            Gestiona el inventario y catálogo de venta
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </Link>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla Pro */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-bold tracking-widest border-b border-slate-100">
                <th className="p-5">Información del Producto</th>
                <th className="p-5">Categoría</th>
                <th className="p-5 text-center">Precio</th>
                <th className="p-5 text-center">Stock</th>
                <th className="p-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-12 text-center text-slate-400 italic"
                  >
                    No se encontraron productos en el inventario.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-blue-50/30 transition-all group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-blue-200 transition-colors shadow-xs">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">
                              NO IMG
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {product.sku || "SIN-SKU"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        {getCategoryName(product.category)}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <p className="font-extrabold text-slate-900">
                        ${parseFloat(product.price).toLocaleString()}
                      </p>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-xs ${
                            product.stock_quantity > 5
                              ? "bg-emerald-100 text-emerald-700"
                              : product.stock_quantity > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-red-700"
                          }`}
                        >
                          {product.stock_quantity > 0
                            ? `${product.stock_quantity} Disponibles`
                            : "Agotado"}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-2.5 bg-white text-slate-400 hover:text-blue-600 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2.5 bg-white text-slate-400 hover:text-rose-600 border border-slate-200 rounded-xl hover:border-rose-300 hover:shadow-md transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
