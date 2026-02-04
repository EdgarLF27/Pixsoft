import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from "./components/Navbar";
import HeroSection from "./pages/Home/HeroSection";
import ProductCard from "./components/ProductCard";
import AdminLayout from "./layouts/AdminLayout";
import AddProduct from "./pages/Admin/Products/AddProduct";
import ProductList from "./pages/Admin/Products/ProductList";
import CategoryList from "./pages/Admin/Categories/CategoryList";
import AddCategory from "./pages/Admin/Categories/AddCategory";
import Login from "./pages/Auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext } from './context/AuthContext';

// --- MOCK DATA ---
const MOCK_PRODUCTS = [
  { id: 1, name: "GeForce RTX 4090", price: 1599.99, category: "Hardware", description: "La tarjeta gráfica definitiva para creadores y gamers.", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "AMD Ryzen 9 7950X", price: 549.0, category: "Procesadores", description: "Rendimiento extremo para multitarea y renderizado.", image: "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Corsair Dominator Platinum", price: 189.99, category: "Memorias RAM", description: "32GB DDR5 6000MHz con iluminación RGB Capellix.", image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Samsung 990 PRO 2TB", price: 169.99, category: "Almacenamiento", description: "SSD NVMe M.2 ultra rápido para tiempos de carga nulos.", image: "https://images.unsplash.com/photo-1597872200370-419ced2615f6?auto=format&fit=crop&q=80&w=800" },
];

const MOCK_LEASING = [
  { id: 101, name: "Dell Latitude 7540, Plan 12 meses", price: 79.99, category: "Arrendamiento", description: "Laptop empresarial con procesador Intel i7 y 16GB RAM.", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800" },
  { id: 102, name: "HP EliteBook 840 G8, Plan 24 meses", price: 69.99, category: "Arrendamiento", description: "Ultrabook con pantalla Full HD y procesador Intel i5.", image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800" },
  { id: 103, name: "ThinkPad X1 Carbon, Plan 36 meses", price: 89.99, category: "Arrendamiento", description: "Laptop premium con pantalla 4K y 1TB SSD.", image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800" },
];

// --- COMPONENTE HOME ---
function HomePage() {
  const { user } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar cartItemCount={0} />
      <main className="pt-36 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <HeroSection />
        <div id="hardware" className="py-12 border-t border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Catálogo de Venta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_PRODUCTS.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
        <div id="arrendamiento" className="py-12 border-t border-slate-200 mt-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Arrendamiento Empresarial</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_LEASING.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- COMPONENTE DASHBOARD ---
function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Productos Totales</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">12</p>
        </div>
      </div>
    </div>
  );
}

// --- APP PRINCIPAL ---
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      
      {/* Rutas de Admin Protegidas */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<AddProduct />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/new" element={<AddCategory />} />
        <Route path="categories/edit/:id" element={<AddCategory />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
