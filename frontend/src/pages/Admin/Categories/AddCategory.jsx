import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AddCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Cargar datos si es edición
  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      fetch(`http://127.0.0.1:8000/api/v1/products/category/${id}/`)
        .then(res => res.json())
        .then(data => setName(data.name))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing 
        ? `http://127.0.0.1:8000/api/v1/products/category/${id}/`
        : "http://127.0.0.1:8000/api/v1/products/category/";
      
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        alert(isEditing ? "Categoría actualizada" : "Categoría creada");
        navigate("/admin/categories");
      } else {
        alert("Error al guardar");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? "Editar Categoría" : "Nueva Categoría"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de la Categoría</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ej. Hardware" 
            required 
          />
        </div>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/admin/categories')}
            className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Cargando..." : (isEditing ? "Actualizar" : "Guardar")}
          </button>
        </div>
      </form>
    </div>
  );
}