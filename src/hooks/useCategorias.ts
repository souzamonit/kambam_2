import { useState, useEffect } from 'react';
import { Categoria } from '../types';
import { getCategorias, saveCategorias } from '../utils/storage';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';

export const useCategorias = () => {
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    try {
      const data = getCategorias();
      setCategorias(data);
      logger.info('ADMIN', 'Categorias carregadas', { count: data.length });
    } catch (error) {
      logger.logError('ADMIN', error as Error, { acao: 'carregar_categorias' });
    }
  }, []);

  const adicionarCategoria = (categoria: Omit<Categoria, 'id' | 'dataCriacao'>) => {
    try {
      const novaCategoria: Categoria = {
        ...categoria,
        id: Date.now().toString(),
        dataCriacao: new Date().toISOString()
      };

      const novaLista = [...categorias, novaCategoria];
      setCategorias(novaLista);
      saveCategorias(novaLista);

      logger.logAdmin(
        'Categoria criada',
        novaCategoria.nome,
        usuario?.id,
        usuario?.nome,
        { categoria: novaCategoria }
      );
    } catch (error) {
      logger.logError('ADMIN', error as Error, { 
        acao: 'criar_categoria',
        categoria: categoria.nome 
      });
      throw error;
    }
  };

  const atualizarCategoria = (id: string, dadosAtualizados: Partial<Categoria>) => {
    try {
      const categoriaAnterior = categorias.find(c => c.id === id);
      if (!categoriaAnterior) {
        logger.warn('ADMIN', 'Tentativa de atualizar categoria inexistente', { id });
        return;
      }

      const novaLista = categorias.map(c => 
        c.id === id ? { ...c, ...dadosAtualizados } : c
      );
      setCategorias(novaLista);
      saveCategorias(novaLista);

      logger.logAdmin(
        'Categoria atualizada',
        categoriaAnterior.nome,
        usuario?.id,
        usuario?.nome,
        { 
          anterior: categoriaAnterior,
          novo: dadosAtualizados 
        }
      );
    } catch (error) {
      logger.logError('ADMIN', error as Error, { 
        acao: 'atualizar_categoria',
        id 
      });
      throw error;
    }
  };

  const removerCategoria = (id: string) => {
    try {
      const categoria = categorias.find(c => c.id === id);
      if (!categoria) {
        logger.warn('ADMIN', 'Tentativa de remover categoria inexistente', { id });
        return;
      }

      const novaLista = categorias.filter(c => c.id !== id);
      setCategorias(novaLista);
      saveCategorias(novaLista);

      logger.logAdmin(
        'Categoria removida',
        categoria.nome,
        usuario?.id,
        usuario?.nome,
        { categoria }
      );
    } catch (error) {
      logger.logError('ADMIN', error as Error, { 
        acao: 'remover_categoria',
        id 
      });
      throw error;
    }
  };

  return {
    categorias,
    adicionarCategoria,
    atualizarCategoria,
    removerCategoria
  };
};