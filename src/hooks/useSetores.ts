import { useState, useEffect } from 'react';
import { Setor } from '../types';
import { getSetores, saveSetores } from '../utils/storage';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';

export const useSetores = () => {
  const { usuario } = useAuth();
  const [setores, setSetores] = useState<Setor[]>([]);

  useEffect(() => {
    try {
      const data = getSetores();
      setSetores(data);
      logger.info('ADMIN', 'Setores carregados', { count: data.length });
    } catch (error) {
      logger.logError('ADMIN', error as Error, { acao: 'carregar_setores' });
    }
  }, []);

  const adicionarSetor = (setor: Omit<Setor, 'id' | 'dataCriacao'>) => {
    try {
      const novoSetor: Setor = {
        ...setor,
        id: Date.now().toString(),
        dataCriacao: new Date().toISOString()
      };

      const novaLista = [...setores, novoSetor];
      setSetores(novaLista);
      saveSetores(novaLista);

      logger.logAdmin(
        'Setor criado',
        novoSetor.nome,
        usuario?.id,
        usuario?.nome,
        { setor: novoSetor }
      );
    } catch (error) {
      logger.logError('ADMIN', error as Error, { 
        acao: 'criar_setor',
        setor: setor.nome 
      });
      throw error;
    }
  };

  const atualizarSetor = (id: string, dadosAtualizados: Partial<Setor>) => {
    try {
      const setorAnterior = setores.find(s => s.id === id);
      if (!setorAnterior) {
        logger.warn('ADMIN', 'Tentativa de atualizar setor inexistente', { id });
        return;
      }

      const novaLista = setores.map(s => 
        s.id === id ? { ...s, ...dadosAtualizados } : s
      );
      setSetores(novaLista);
      saveSetores(novaLista);

      logger.logAdmin(
        'Setor atualizado',
        setorAnterior.nome,
        usuario?.id,
        usuario?.nome,
        { 
          anterior: setorAnterior,
          novo: dadosAtualizados 
        }
      );
    } catch (error) {
      logger.logError('ADMIN', error as Error, { 
        acao: 'atualizar_setor',
        id 
      });
      throw error;
    }
  };

  const removerSetor = (id: string) => {
    try {
      const setor = setores.find(s => s.id === id);
      if (!setor) {
        logger.warn('ADMIN', 'Tentativa de remover setor inexistente', { id });
        return;
      }

      const novaLista = setores.filter(s => s.id !== id);
      setSetores(novaLista);
      saveSetores(novaLista);

      logger.logAdmin(
        'Setor removido',
        setor.nome,
        usuario?.id,
        usuario?.nome,
        { setor }
      );
    } catch (error) {
      logger.logError('ADMIN', error as Error, { 
        acao: 'remover_setor',
        id 
      });
      throw error;
    }
  };

  return {
    setores,
    adicionarSetor,
    atualizarSetor,
    removerSetor
  };
};