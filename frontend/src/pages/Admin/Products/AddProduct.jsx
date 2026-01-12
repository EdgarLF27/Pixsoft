import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams(); // Si existe 'id', estamos en modo EDICIÓN
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    price: "",
    sku: "",
    stock_quantity: "0",
    category: "", 
    description: "",
    image: "" // URL si viene del back como string
  });
  const [imageFile, setImageFile] = useState(null);

  // 1. Cargar Categorías
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/products/category/")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error cargando categorías:", err));
  }, []);

  // 2. Si es edición, cargar datos del producto
  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      fetch(`http://127.0.0.1:8000/api/v1/products/product/${id}/`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            name: data.name,
            brand: data.brand || "",
            model: data.model || "",
            price: data.price,
            sku: data.sku,
            stock_quantity: data.stock_quantity,
            category: data.category, // ID de la categoría
            description: data.description,
            image: data.image // URL de la imagen actual
          });
        })
        .catch(err => console.error("Error cargando producto:", err))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("brand", formData.brand);
    data.append("model", formData.model);
    data.append("price", formData.price);
    data.append("stock_quantity", formData.stock_quantity);
    data.append("description", formData.description);
    
    // En edición, el SKU a veces no se cambia o es readonly, pero lo enviamos por si acaso
    if (formData.sku) data.append("sku", formData.sku);
    else if (!isEditing) data.append("sku", `SKU-${Date.now()}`);

    if (formData.category) data.append("category", formData.category);

    // Solo enviamos imagen si el usuario seleccionó una NUEVA
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const url = isEditing 
        ? `http://127.0.0.1:8000/api/v1/products/product/${id}/`
        : "http://127.0.0.1:8000/api/v1/products/product/";
      
      const method = isEditing ? "PATCH" : "POST"; // PATCH para actualización parcial (seguro con imágenes)

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (response.ok) {
        alert(isEditing ? "✅ Producto actualizado" : "✅ Producto creado");
        navigate("/admin/products");
      } else {
        const error = await response.json();
        alert("Error: " + JSON.stringify(error));
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-20">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <p className="text-sm text-slate-500">
            {isEditing ? `Editando ID: ${id}` : "Ingresa los detalles del artículo"}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Nombre, Marca, Modelo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Producto *</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Marca</label>
            <input name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Modelo</label>
            <input name="model" value={formData.model} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Precio *</label>
            <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Stock</label>
            <input name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">SKU</label>
            <input name="sku" value={formData.sku} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* Categoría e Imagen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría *</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
              required
            >
              <option value="">Selecciona...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Imagen</label>
            <div className="flex gap-4 items-center">
              {formData.image && !imageFile && (
                <img src={formData.image} alt="Actual" className="w-12 h-12 rounded object-cover border" />
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange} 
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Deja vacío para mantener la imagen actual.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
        </div>

        <div className="pt-4 flex justify-end gap-4 border-t border-slate-100">
          <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-70">
            {loading ? "Guardando..." : (isEditing ? "Actualizar" : "Guardar")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
