import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from '../components/Modal';
import { FormularioSolicitacao } from '../components/FormularioSolicitacao';
import { useCategorias } from '../hooks/useCategorias';
import { useSetores } from '../hooks/useSetores';
import { useSolicitacoes } from '../hooks/useSolicitacoes';
import { Lock, User, Plus, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { categorias } = useCategorias();
  const { setores } = useSetores();
  const { adicionarSolicitacao } = useSolicitacoes();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);
  const [showProtocoloModal, setShowProtocoloModal] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Usuário ou senha inválidos');
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleCriarSolicitacao = (dados: any) => {
    const resultado = adicionarSolicitacao({
      ...dados,
      status: 'sem-categoria' as const,
      categoriaId: dados.categoriaId || '',
      setorId: dados.setorId || ''
    });
    
    setShowSolicitacaoModal(false);
    
    if (resultado && resultado.protocolo) {
      setProtocoloGerado(resultado.protocolo);
      setShowProtocoloModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sistema Kanban
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Gerenciamento de Solicitações
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuário
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Digite sua senha"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowSolicitacaoModal(true)}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Solicitação
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Você pode criar uma solicitação sem fazer login
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={showSolicitacaoModal}
        onClose={() => setShowSolicitacaoModal(false)}
        title="Nova Solicitação"
        size="lg"
      >
        <FormularioSolicitacao
          categorias={categorias}
          setores={setores}
          onSubmit={handleCriarSolicitacao}
          onCancel={() => setShowSolicitacaoModal(false)}
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
    </div>
  );
};