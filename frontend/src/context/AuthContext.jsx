import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
  const [loading, setLoading] = useState(true);

  // Verificar token al iniciar
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Verificar si expiró
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded); // Guardamos datos básicos del usuario
        }
      } catch (error) {
        console.error("Token inválido:", error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        setToken(data.access);
        
        // Decodificar para obtener info inmediata
        const decoded = jwtDecode(data.access);
        setUser(decoded);
        return { success: true };
      } else {
        return { success: false, error: data.detail || "Credenciales inválidas" };
      }
    } catch (error) {
      return { success: false, error: "Error de conexión" };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
