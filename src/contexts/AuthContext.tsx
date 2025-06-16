import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, AuthContextType } from '../types';
import { getUsuarios, saveUsuarios, initializeStorage } from '../utils/storage';
import { logger } from '../utils/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeStorage();
    
    const usuarioSalvo = localStorage.getItem('usuario_logado');
    if (usuarioSalvo) {
      const userData = JSON.parse(usuarioSalvo);
      setUsuario(userData);
      setIsAuthenticated(true);
      logger.logAuth('Sessão restaurada', userData.usuario, true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const usuarios = getUsuarios();
      const usuarioEncontrado = usuarios.find(
        u => u.usuario === username && u.senha === password
      );

      if (usuarioEncontrado) {
        setUsuario(usuarioEncontrado);
        setIsAuthenticated(true);
        localStorage.setItem('usuario_logado', JSON.stringify(usuarioEncontrado));
        
        logger.logAuth('Login realizado', username, true, {
          tipo: usuarioEncontrado.tipo,
          primeiroLogin: usuarioEncontrado.primeiroLogin
        });
        
        return true;
      } else {
        logger.logAuth('Tentativa de login', username, false, {
          motivo: 'Credenciais inválidas'
        });
        return false;
      }
    } catch (error) {
      logger.logError('AUTH', error as Error, { username });
      return false;
    }
  };

  const logout = () => {
    const nomeUsuario = usuario?.usuario || 'Usuário desconhecido';
    
    setUsuario(null);
    setIsAuthenticated(false);
    localStorage.removeItem('usuario_logado');
    
    logger.logAuth('Logout realizado', nomeUsuario, true);
  };

  const alterarSenha = async (senhaAtual: string, novaSenha: string): Promise<boolean> => {
    if (!usuario) return false;

    try {
      if (usuario.senha !== senhaAtual) {
        logger.logAuth('Tentativa de alteração de senha', usuario.usuario, false, {
          motivo: 'Senha atual incorreta'
        });
        return false;
      }

      const usuarios = getUsuarios();
      const usuarioIndex = usuarios.findIndex(u => u.id === usuario.id);
      
      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex] = {
          ...usuarios[usuarioIndex],
          senha: novaSenha,
          primeiroLogin: false
        };
        
        saveUsuarios(usuarios);
        
        const usuarioAtualizado = usuarios[usuarioIndex];
        setUsuario(usuarioAtualizado);
        localStorage.setItem('usuario_logado', JSON.stringify(usuarioAtualizado));
        
        logger.logAuth('Senha alterada', usuario.usuario, true, {
          primeiroLogin: usuario.primeiroLogin
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      logger.logError('AUTH', error as Error, { 
        usuario: usuario.usuario,
        acao: 'alterarSenha'
      });
      return false;
    }
  };

  const value: AuthContextType = {
    usuario,
    login,
    logout,
    alterarSenha,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};