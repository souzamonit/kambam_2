import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { PrimeiroLogin } from './pages/PrimeiroLogin';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Auditoria } from './pages/Auditoria';
import { Logs } from './pages/Logs';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, usuario } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (usuario?.primeiroLogin) {
    return <Navigate to="/primeiro-login" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useAuth();
  
  if (usuario?.tipo !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, usuario } = useAuth();

  if (isAuthenticated && usuario?.primeiroLogin) {
    return <PrimeiroLogin />;
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/primeiro-login" element={usuario?.primeiroLogin ? <PrimeiroLogin /> : <Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminRoute>
            <Admin />
          </AdminRoute>
        </ProtectedRoute>
      } />
      <Route path="/auditoria" element={
        <ProtectedRoute>
          <AdminRoute>
            <Auditoria />
          </AdminRoute>
        </ProtectedRoute>
      } />
      <Route path="/logs" element={
        <ProtectedRoute>
          <AdminRoute>
            <Logs />
          </AdminRoute>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;