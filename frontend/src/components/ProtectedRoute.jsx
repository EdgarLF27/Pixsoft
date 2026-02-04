import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Cargando...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere ser admin y no lo es (verificamos is_staff si viene en el token)
  // Nota: Django SimpleJWT por defecto no manda is_staff en el token a menos que lo configuremos.
  // Por ahora confiamos en el login simple.
  
  return children;
}
