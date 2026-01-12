import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Fijo */}
      <Sidebar />

      {/* Contenido Principal */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Aquí se renderizarán las páginas hijas (Dashboard, AddProduct, etc.) */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
