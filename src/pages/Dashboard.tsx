import React, { useState, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Layout } from '../components/Layout';
import { KanbanColumn } from '../components/KanbanColumn';
import { Modal } from '../components/Modal';
import { FormularioSolicitacao } from '../components/FormularioSolicitacao';
import { DashboardStats } from '../components/DashboardStats';
import { SearchBar } from '../components/SearchBar';
import { useSolicitacoes } from '../hooks/useSolicitacoes';
import { useCategorias } from '../hooks/useCategorias';
import { useSetores } from '../hooks/useSetores';
import { useAuth } from '../contexts/AuthContext';
import { Solicitacao } from '../types';
import { Plus, Settings, BarChart3, Columns, FileSearch, CheckCircle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../utils/logger';

export const Dashboard: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { solicitacoes, adicionarSolicitacao, atualizarSolicitacao, moverSolicitacao } = useSolicitacoes();
  const { categorias } = useCategorias();
  const { setores } = useSetores();
  
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);
  const [solicitacaoEditando, setSolicitacaoEditando] = useState<Solicitacao | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'dashboard'>('kanban');
  const [showProtocoloModal, setShowProtocoloModal] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState('');

  // Filtrar solicitações baseado no setor do usuário (se não for admin)
  const solicitacoesFiltradas = useMemo(() => {
    let solicitacoesPorSetor = solicitacoes;
    
    // Se o usuário não for admin, mostrar apenas solicitações do seu setor
    if (usuario?.tipo === 'user' && usuario.setorId) {
      solicitacoesPorSetor = solicitacoes.filter(s => s.setorId === usuario.setorId);
    }
    
    // Aplicar filtro de pesquisa
    if (!searchTerm.trim()) return solicitacoesPorSetor;
    
    const termo = searchTerm.toLowerCase();
    return solicitacoesPorSetor.filter(solicitacao => 
      solicitacao.titulo.toLowerCase().includes(termo) ||
      solicitacao.descricao.toLowerCase().includes(termo) ||
      solicitacao.protocolo.toLowerCase().includes(termo) ||
      categorias.find(c => c.id === solicitacao.categoriaId)?.nome.toLowerCase().includes(termo) ||
      setores.find(s => s.id === solicitacao.setorId)?.nome.toLowerCase().includes(termo)
    );
  }, [solicitacoes, searchTerm, categorias, setores, usuario]);

  const colunas = [
    { 
      id: 'sem-categoria', 
      title: 'Solução sem Categorização', 
      color: '#9CA3AF',
      solicitacoes: solicitacoesFiltradas.filter(s => s.status === 'sem-categoria')
    },
    { 
      id: 'pendente', 
      title: 'Pendente', 
      color: '#F59E0B',
      solicitacoes: solicitacoesFiltradas.filter(s => s.status === 'pendente')
    },
    { 
      id: 'em-andamento', 
      title: 'Em Andamento', 
      color: '#3B82F6',
      solicitacoes: solicitacoesFiltradas.filter(s => s.status === 'em-andamento')
    },
    { 
      id: 'concluida', 
      title: 'Concluída', 
      color: '#059669',
      solicitacoes: solicitacoesFiltradas.filter(s => s.status === 'concluida')
    }
  ];

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      moverSolicitacao(draggableId, destination.droppableId as Solicitacao['status']);
      
      logger.info('DASHBOARD', 'Solicitação movida via drag & drop', {
        solicitacaoId: draggableId,
        origem: source.droppableId,
        destino: destination.droppableId,
        usuario: usuario?.nome
      });
    } catch (error) {
      logger.logError('DASHBOARD', error as Error, {
        acao: 'drag_drop',
        solicitacaoId: draggableId
      });
    }
  };

  const handleEditSolicitacao = (solicitacao: Solicitacao) => {
    setSolicitacaoEditando(solicitacao);
    setShowSolicitacaoModal(true);
    
    logger.info('DASHBOARD', 'Modal de edição aberto', {
      protocolo: solicitacao.protocolo,
      usuario: usuario?.nome
    });
  };

  const handleSubmitSolicitacao = (dados: any) => {
    try {
      if (solicitacaoEditando) {
        atualizarSolicitacao(solicitacaoEditando.id, dados);
        logger.info('DASHBOARD', 'Solicitação atualizada via modal', {
          protocolo: solicitacaoEditando.protocolo,
          usuario: usuario?.nome
        });
      } else {
        const resultado = adicionarSolicitacao({
          ...dados,
          status: 'pendente' as const
        });
        
        // Mostrar modal com protocolo gerado
        if (resultado && resultado.protocolo) {
          setProtocoloGerado(resultado.protocolo);
          setShowProtocoloModal(true);
          
          logger.info('DASHBOARD', 'Nova solicitação criada via modal', {
            protocolo: resultado.protocolo,
            usuario: usuario?.nome
          });
        }
      }
      
      setShowSolicitacaoModal(false);
      setSolicitacaoEditando(undefined);
    } catch (error) {
      logger.logError('DASHBOARD', error as Error, {
        acao: solicitacaoEditando ? 'editar' : 'criar',
        usuario: usuario?.nome
      });
    }
  };

  const handleCloseModal = () => {
    setShowSolicitacaoModal(false);
    setSolicitacaoEditando(undefined);
  };

  const handleViewModeChange = (newMode: 'kanban' | 'dashboard') => {
    setViewMode(newMode);
    logger.info('DASHBOARD', 'Modo de visualização alterado', {
      modoAnterior: viewMode,
      novoModo: newMode,
      usuario: usuario?.nome
    });
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Header com controles */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {viewMode === 'kanban' ? 'Gerenciar Solicitações' : 'Dashboard Analytics'}
            </h1>
            <p className="text-gray-600">
              {viewMode === 'kanban' 
                ? 'Arraste e solte para alterar o status das solicitações' 
                : 'Visualize estatísticas e métricas das solicitações'
              }
              {usuario?.tipo === 'user' && (
                <span className="ml-2 text-sm text-blue-600">
                  (Visualizando apenas solicitações do setor: {setores.find(s => s.id === usuario.setorId)?.nome})
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Barra de Pesquisa */}
            <div className="w-full sm:w-80">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Pesquisar por protocolo, título, descrição..."
              />
            </div>
            
            {/* Botões de Ação */}
            <div className="flex space-x-3">
              <button
                onClick={() => handleViewModeChange(viewMode === 'kanban' ? 'dashboard' : 'kanban')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {viewMode === 'kanban' ? (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </>
                ) : (
                  <>
                    <Columns className="h-4 w-4 mr-2" />
                    Kanban
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowSolicitacaoModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Solicitação
              </button>
              
              {usuario?.tipo === 'admin' && (
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Administração
                  </button>
                  
                  <button
                    onClick={() => navigate('/auditoria')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <FileSearch className="h-4 w-4 mr-2" />
                    Auditoria
                  </button>
                  
                  <button
                    onClick={() => navigate('/logs')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Logs
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de Pesquisa */}
        {searchTerm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Mostrando {solicitacoesFiltradas.length} resultado(s) para "{searchTerm}"
            </p>
          </div>
        )}

        {/* Conteúdo Principal */}
        {viewMode === 'dashboard' ? (
          <DashboardStats 
            solicitacoes={solicitacoesFiltradas} 
            categorias={categorias} 
            setores={setores} 
          />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-6 overflow-x-auto pb-4">
              {colunas.map(coluna => (
                <KanbanColumn
                  key={coluna.id}
                  title={coluna.title}
                  status={coluna.id}
                  solicitacoes={coluna.solicitacoes}
                  categorias={categorias}
                  setores={setores}
                  onEditSolicitacao={handleEditSolicitacao}
                  color={coluna.color}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={showSolicitacaoModal}
        onClose={handleCloseModal}
        title={solicitacaoEditando ? 'Editar Solicitação' : 'Nova Solicitação'}
        size="lg"
      >
        <FormularioSolicitacao
          solicitacao={solicitacaoEditando}
          categorias={categorias}
          setores={setores}
          onSubmit={handleSubmitSolicitacao}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Modal de Protocolo Gerado */}
      <Modal
        isOpen={showProtocoloModal}
        onClose={() => setShowProtocoloModal(false)}
        title="Solicitação Criada com Sucesso!"
        size="md"
      >
        <div className="text-center py-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sua solicitação foi aberta!
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2">
              O número do protocolo é:
            </p>
            <p className="text-2xl font-bold text-blue-600 font-mono">
              #{protocoloGerado}
            </p>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            <strong>Anote o protocolo para acompanhamento da solicitação.</strong>
            <br />
            Você pode usar este número para pesquisar sua solicitação no sistema.
          </p>
          
          <button
            onClick={() => setShowProtocoloModal(false)}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Entendi
          </button>
        </div>
      </Modal>
    </Layout>
  );
};