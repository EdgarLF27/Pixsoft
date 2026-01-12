import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/products/category/');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Borrar categoría? Esto puede afectar a los productos asociados.")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/products/category/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
          <p className="text-slate-500 text-sm">Organiza los productos de tu tienda</p>
        </div>
        <Link 
          to="/admin/categories/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs uppercase text-slate-600 font-bold">ID</th>
              <th className="p-4 text-xs uppercase text-slate-600 font-bold">Nombre</th>
              <th className="p-4 text-xs uppercase text-slate-600 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-4 text-slate-500">#{cat.id}</td>
                <td className="p-4 font-medium text-slate-900">{cat.name}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      to={`/admin/categories/edit/${cat.id}`}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
