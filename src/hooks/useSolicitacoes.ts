import { useState, useEffect } from 'react';
import { Solicitacao } from '../types';
import { getSolicitacoes, saveSolicitacoes, gerarProtocolo, registrarLogAuditoria } from '../utils/storage';
import { enviarNotificacaoTelegram } from '../utils/telegram';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';

export const useSolicitacoes = () => {
  const { usuario } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  useEffect(() => {
    try {
      const data = getSolicitacoes();
      setSolicitacoes(data);
      logger.info('SOLICITACAO', 'Solicitações carregadas', { count: data.length });
    } catch (error) {
      logger.logError('SOLICITACAO', error as Error, { acao: 'carregar' });
    }
  }, []);

  const adicionarSolicitacao = (solicitacao: Omit<Solicitacao, 'id' | 'dataSolicitacao' | 'dataAtualizacao' | 'protocolo'>) => {
    try {
      const protocolo = gerarProtocolo();
      const novaSolicitacao: Solicitacao = {
        ...solicitacao,
        id: Date.now().toString(),
        protocolo,
        dataSolicitacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };

      const novaLista = [...solicitacoes, novaSolicitacao];
      setSolicitacoes(novaLista);
      saveSolicitacoes(novaLista);
      
      // Registrar log de auditoria
      registrarLogAuditoria({
        solicitacaoId: novaSolicitacao.id,
        protocolo: novaSolicitacao.protocolo,
        usuarioId: usuario?.id,
        nomeUsuario: usuario?.nome || 'Sistema',
        acao: 'Criação',
        detalhes: `Solicitação criada: ${novaSolicitacao.titulo}`
      });

      // Log do sistema
      logger.logSolicitacao(
        'Solicitação criada',
        protocolo,
        usuario?.id,
        usuario?.nome || 'Sistema',
        {
          titulo: novaSolicitacao.titulo,
          status: novaSolicitacao.status,
          categoria: novaSolicitacao.categoriaId,
          setor: novaSolicitacao.setorId
        }
      );

      // Enviar notificação Telegram (sem await para não bloquear)
      enviarNotificacaoTelegram({
        protocolo: novaSolicitacao.protocolo,
        titulo: novaSolicitacao.titulo,
        status: novaSolicitacao.status,
        usuario: usuario?.nome,
        acao: 'Nova solicitação criada'
      }).then(success => {
        if (success) {
          logger.info('TELEGRAM', 'Notificação enviada com sucesso', { protocolo });
        } else {
          logger.warn('TELEGRAM', 'Falha ao enviar notificação', { protocolo });
        }
      }).catch(error => {
        logger.logError('TELEGRAM', error as Error, { protocolo });
      });
      
      return { solicitacao: novaSolicitacao, protocolo };
    } catch (error) {
      logger.logError('SOLICITACAO', error as Error, { 
        acao: 'criar',
        titulo: solicitacao.titulo 
      });
      throw error;
    }
  };

  const atualizarSolicitacao = (id: string, dadosAtualizados: Partial<Solicitacao>) => {
    try {
      const solicitacaoAnterior = solicitacoes.find(s => s.id === id);
      if (!solicitacaoAnterior) {
        logger.warn('SOLICITACAO', 'Tentativa de atualizar solicitação inexistente', { id });
        return;
      }

      const novaLista = solicitacoes.map(s => 
        s.id === id 
          ? { ...s, ...dadosAtualizados, dataAtualizacao: new Date().toISOString() }
          : s
      );
      
      setSolicitacoes(novaLista);
      saveSolicitacoes(novaLista);

      // Registrar logs para cada campo alterado
      Object.keys(dadosAtualizados).forEach(campo => {
        const valorAnterior = solicitacaoAnterior[campo as keyof Solicitacao];
        const valorNovo = dadosAtualizados[campo as keyof Solicitacao];
        
        if (valorAnterior !== valorNovo && campo !== 'dataAtualizacao') {
          registrarLogAuditoria({
            solicitacaoId: id,
            protocolo: solicitacaoAnterior.protocolo,
            usuarioId: usuario?.id,
            nomeUsuario: usuario?.nome || 'Sistema',
            acao: 'Edição',
            campoAlterado: campo,
            valorAnterior: String(valorAnterior || ''),
            valorNovo: String(valorNovo || '')
          });

          logger.logSolicitacao(
            `Campo ${campo} alterado`,
            solicitacaoAnterior.protocolo,
            usuario?.id,
            usuario?.nome || 'Sistema',
            {
              campo,
              valorAnterior: String(valorAnterior || ''),
              valorNovo: String(valorNovo || '')
            }
          );
        }
      });

      // Enviar notificação se houve mudança de status
      if (dadosAtualizados.status && dadosAtualizados.status !== solicitacaoAnterior.status) {
        enviarNotificacaoTelegram({
          protocolo: solicitacaoAnterior.protocolo,
          titulo: solicitacaoAnterior.titulo,
          status: dadosAtualizados.status,
          usuario: usuario?.nome,
          acao: 'Status alterado'
        }).then(success => {
          if (success) {
            logger.info('TELEGRAM', 'Notificação de mudança de status enviada', { 
              protocolo: solicitacaoAnterior.protocolo,
              statusAnterior: solicitacaoAnterior.status,
              novoStatus: dadosAtualizados.status
            });
          } else {
            logger.warn('TELEGRAM', 'Falha ao enviar notificação de mudança de status', { 
              protocolo: solicitacaoAnterior.protocolo 
            });
          }
        }).catch(error => {
          logger.logError('TELEGRAM', error as Error, { 
            protocolo: solicitacaoAnterior.protocolo 
          });
        });
      }
    } catch (error) {
      logger.logError('SOLICITACAO', error as Error, { 
        acao: 'atualizar',
        id,
        dadosAtualizados 
      });
      throw error;
    }
  };

  const removerSolicitacao = (id: string) => {
    try {
      const solicitacao = solicitacoes.find(s => s.id === id);
      if (!solicitacao) {
        logger.warn('SOLICITACAO', 'Tentativa de remover solicitação inexistente', { id });
        return;
      }

      const novaLista = solicitacoes.filter(s => s.id !== id);
      setSolicitacoes(novaLista);
      saveSolicitacoes(novaLista);

      // Registrar log de auditoria
      registrarLogAuditoria({
        solicitacaoId: id,
        protocolo: solicitacao.protocolo,
        usuarioId: usuario?.id,
        nomeUsuario: usuario?.nome || 'Sistema',
        acao: 'Exclusão',
        detalhes: `Solicitação excluída: ${solicitacao.titulo}`
      });

      logger.logSolicitacao(
        'Solicitação excluída',
        solicitacao.protocolo,
        usuario?.id,
        usuario?.nome || 'Sistema',
        {
          titulo: solicitacao.titulo
        }
      );
    } catch (error) {
      logger.logError('SOLICITACAO', error as Error, { 
        acao: 'remover',
        id 
      });
      throw error;
    }
  };

  const moverSolicitacao = (id: string, novoStatus: Solicitacao['status']) => {
    try {
      const solicitacao = solicitacoes.find(s => s.id === id);
      if (!solicitacao) {
        logger.warn('SOLICITACAO', 'Tentativa de mover solicitação inexistente', { id });
        return;
      }

      atualizarSolicitacao(id, { status: novoStatus });

      // Registrar log específico para mudança de status
      registrarLogAuditoria({
        solicitacaoId: id,
        protocolo: solicitacao.protocolo,
        usuarioId: usuario?.id,
        nomeUsuario: usuario?.nome || 'Sistema',
        acao: 'Mudança de Status',
        campoAlterado: 'status',
        valorAnterior: solicitacao.status,
        valorNovo: novoStatus
      });

      logger.logSolicitacao(
        'Status alterado via drag & drop',
        solicitacao.protocolo,
        usuario?.id,
        usuario?.nome || 'Sistema',
        {
          statusAnterior: solicitacao.status,
          novoStatus
        }
      );
    } catch (error) {
      logger.logError('SOLICITACAO', error as Error, { 
        acao: 'mover',
        id,
        novoStatus 
      });
      throw error;
    }
  };

  return {
    solicitacoes,
    adicionarSolicitacao,
    atualizarSolicitacao,
    removerSolicitacao,
    moverSolicitacao
  };
};