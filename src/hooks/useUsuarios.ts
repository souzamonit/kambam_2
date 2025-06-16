import { useState, useEffect } from 'react';
import { Usuario } from '../types';
import { getUsuarios, saveUsuarios } from '../utils/storage';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';

export const useUsuarios = () => {
  const { usuario: usuarioLogado } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    try {
      const data = getUsuarios();
      setUsuarios(data);
      logger.info('ADMIN', 'Usuários carregados', { count: data.length });
    } catch (error) {
      logger.logError('ADMIN', error as Error, { acao: 'carregar_usuarios' });
    }
  }, []);

  const adicionarUsuario = (usuario: Omit<Usuario, 'id' | 'dataCriacao'>) => {
    try {
      const novoUsuario: Usuario = {
        ...usuario,
        id: Date.now().toString(),
        dataCriacao: new Date().toISOString(),
        primeiroLogin: true
      };

      const novaLista = [...usuarios, novoUsuario];
      setUsuarios(novaLista);
      saveUsuarios(novaLista);

      logger.logAdmin(
        'Usuário criado',
        novoUsuario.usuario,
        usuarioLogado?.id,
        usuarioLogado?.nome,
        { 
          novoUsuario: {
            id: novoUsuario.id,
            usuario: novoUsuario.usuario,
            nome: novoUsuario.nome,
            tipo: novoUsuario.tipo,
            setorId: novoUsuario.setorId
          }
        }
      );
    } catch (error) {
      logger.logError('ADMIN', error as Error, { 
        acao: 'criar_usuario',
        usuario: usuario.usuario 
      });
      throw error;
    }
  };

  const atualizarUsuario = (id: string, dadosAtualizados: Partial<Usuario>) => {
    try {
      const usuarioAnterior = usuarios.find(u => u.id === id);
      if (!usuarioAnterior) {
        logger.warn('ADMIN', 'Tentativa de atualizar usuário inexistente', { id });
        return;
      }

      const novaLista = usuarios.map(u => 
        u.id === id ? { ...u, ...dadosAtualizados } : u
      );
      setUsuarios(novaLista);
      saveUsuarios(novaLista);

      logger.logAdmin(
        'Usuário atualizado',
        usuarioAnterior.usuario,
        usuarioLogado?.id,
        usuarioLogado?.nome,
        { 
          usuarioId: id,
          camposAlterados: Object.keys(dadosAtualizados),
          // Não logar senhas por segurança
          dadosAtualizados: Object.fromEntries(
            Object.entries(dadosAtualizados).filter(([key]) => key !== 'senha')
          )
        }
      );
    } catch (error) {
      logger.logError('ADMIN', error as Error, { 
        acao: 'atualizar_usuario',
        id 
      });
      throw error;
    }
  };

  const removerUsuario = (id: string) => {
    try {
      const usuario = usuarios.find(u => u.id === id);
      if (!usuario) {
        logger.warn('ADMIN', 'Tentativa de remover usuário inexistente', { id });
        return;
      }

      const novaLista = usuarios.filter(u => u.id !== id);
      setUsuarios(novaLista);
      saveUsuarios(novaLista);

      logger.logAdmin(
        'Usuário removido',
        usuario.usuario,
        usuarioLogado?.id,
        usuarioLogado?.nome,
        { 
          usuarioRemovido: {
            id: usuario.id,
            usuario: usuario.usuario,
            nome: usuario.nome,
            tipo: usuario.tipo
          }
        }
      );
    } catch (error) {
      logger.logError('ADMIN', error as Error, { 
        acao: 'remover_usuario',
        id 
      });
      throw error;
    }
  };

  return {
    usuarios,
    adicionarUsuario,
    atualizarUsuario,
    removerUsuario
  };
};