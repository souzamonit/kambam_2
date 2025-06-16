import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { DatabaseInfo } from '../components/DatabaseInfo';
import { useCategorias } from '../hooks/useCategorias';
import { useSetores } from '../hooks/useSetores';
import { useUsuarios } from '../hooks/useUsuarios';
import { Plus, Edit, Trash2, Tag, Building, Users, Eye, EyeOff, Shield, Database } from 'lucide-react';

export const Admin: React.FC = () => {
  const { categorias, adicionarCategoria, atualizarCategoria, removerCategoria } = useCategorias();
  const { setores, adicionarSetor, atualizarSetor, removerSetor } = useSetores();
  const { usuarios, adicionarUsuario, atualizarUsuario, removerUsuario } = useUsuarios();

  const [activeTab, setActiveTab] = useState<'categorias' | 'setores' | 'usuarios' | 'database'>('categorias');
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showSetorModal, setShowSetorModal] = useState(false);
  const [showUsuarioModal, setShowUsuarioModal] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<any>(null);
  const [setorEditando, setSetorEditando] = useState<any>(null);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formCategoria, setFormCategoria] = useState({ nome: '', cor: '#3B82F6' });
  const [formSetor, setFormSetor] = useState({ nome: '' });
  const [formUsuario, setFormUsuario] = useState({ 
    usuario: '', 
    senha: '', 
    tipo: 'user' as 'admin' | 'user', 
    nome: '',
    setorId: '' // Novo campo obrigatório para usuários comuns
  });

  const handleSubmitCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (categoriaEditando) {
      atualizarCategoria(categoriaEditando.id, formCategoria);
    } else {
      adicionarCategoria(formCategoria);
    }
    
    setShowCategoriaModal(false);
    setCategoriaEditando(null);
    setFormCategoria({ nome: '', cor: '#3B82F6' });
  };

  const handleSubmitSetor = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (setorEditando) {
      atualizarSetor(setorEditando.id, formSetor);
    } else {
      adicionarSetor(formSetor);
    }
    
    setShowSetorModal(false);
    setSetorEditando(null);
    setFormSetor({ nome: '' });
  };

  const handleSubmitUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação: usuário comum deve ter setor
    if (formUsuario.tipo === 'user' && !formUsuario.setorId) {
      alert('Usuários comuns devem ser associados a um setor.');
      return;
    }
    
    if (usuarioEditando) {
      const dadosAtualizacao = { ...formUsuario };
      if (!dadosAtualizacao.senha) {
        delete dadosAtualizacao.senha; // Não atualizar senha se estiver vazia
      }
      // Admin não precisa de setor
      if (dadosAtualizacao.tipo === 'admin') {
        dadosAtualizacao.setorId = '';
      }
      atualizarUsuario(usuarioEditando.id, dadosAtualizacao);
    } else {
      const novoUsuario = { ...formUsuario };
      // Admin não precisa de setor
      if (novoUsuario.tipo === 'admin') {
        novoUsuario.setorId = '';
      }
      adicionarUsuario(novoUsuario);
    }
    
    setShowUsuarioModal(false);
    setUsuarioEditando(null);
    setFormUsuario({ usuario: '', senha: '', tipo: 'user', nome: '', setorId: '' });
  };

  const handleEditCategoria = (categoria: any) => {
    setCategoriaEditando(categoria);
    setFormCategoria({ nome: categoria.nome, cor: categoria.cor });
    setShowCategoriaModal(true);
  };

  const handleEditSetor = (setor: any) => {
    setSetorEditando(setor);
    setFormSetor({ nome: setor.nome });
    setShowSetorModal(true);
  };

  const handleEditUsuario = (usuario: any) => {
    setUsuarioEditando(usuario);
    setFormUsuario({ 
      usuario: usuario.usuario, 
      senha: '', 
      tipo: usuario.tipo, 
      nome: usuario.nome,
      setorId: usuario.setorId || ''
    });
    setShowUsuarioModal(true);
  };

  const handleDeleteCategoria = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      removerCategoria(id);
    }
  };

  const handleDeleteSetor = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este setor?')) {
      removerSetor(id);
    }
  };

  const handleDeleteUsuario = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      removerUsuario(id);
    }
  };

  const cores = [
    '#3B82F6', '#059669', '#DC2626', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const tabs = [
    { id: 'categorias', label: 'Categorias', icon: Tag },
    { id: 'setores', label: 'Setores', icon: Building },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'database', label: 'Banco de Dados', icon: Database }
  ];

  return (
    <Layout title="Administração">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Administração</h1>
          <p className="text-gray-600">Gerencie categorias, setores, usuários e configurações do sistema</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Categorias Tab */}
        {activeTab === 'categorias' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Categorias
              </h2>
              <button
                onClick={() => setShowCategoriaModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova Categoria
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map(categoria => (
                <div key={categoria.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: categoria.cor }}
                      ></div>
                      <span className="font-medium text-gray-900">{categoria.nome}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditCategoria(categoria)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategoria(categoria.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setores Tab */}
        {activeTab === 'setores' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Setores
              </h2>
              <button
                onClick={() => setShowSetorModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Setor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {setores.map(setor => (
                <div key={setor.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-900">{setor.nome}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditSetor(setor)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSetor(setor.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usuários Tab */}
        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Usuários
              </h2>
              <button
                onClick={() => setShowUsuarioModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Usuário
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Setor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map(usuario => {
                    const setor = setores.find(s => s.id === usuario.setorId);
                    return (
                      <tr key={usuario.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {usuario.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.usuario}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            usuario.tipo === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {usuario.tipo === 'admin' ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Administrador
                              </>
                            ) : (
                              'Usuário'
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {setor ? setor.nome : usuario.tipo === 'admin' ? 'Todos' : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            usuario.primeiroLogin 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {usuario.primeiroLogin ? 'Primeiro Login' : 'Ativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">
                            <button
                              onClick={() => handleEditUsuario(usuario)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUsuario(usuario.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <DatabaseInfo />
        )}
      </div>

      {/* Modal Categoria */}
      <Modal
        isOpen={showCategoriaModal}
        onClose={() => {
          setShowCategoriaModal(false);
          setCategoriaEditando(null);
          setFormCategoria({ nome: '', cor: '#3B82F6' });
        }}
        title={categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <form onSubmit={handleSubmitCategoria} className="space-y-4">
          <div>
            <label htmlFor="nomeCategoria" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Categoria
            </label>
            <input
              type="text"
              id="nomeCategoria"
              value={formCategoria.nome}
              onChange={(e) => setFormCategoria(prev => ({ ...prev, nome: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o nome da categoria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor da Categoria
            </label>
            <div className="grid grid-cols-4 gap-2">
              {cores.map(cor => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setFormCategoria(prev => ({ ...prev, cor }))}
                  className={`w-12 h-12 rounded-md border-2 ${
                    formCategoria.cor === cor ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCategoriaModal(false);
                setCategoriaEditando(null);
                setFormCategoria({ nome: '', cor: '#3B82F6' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {categoriaEditando ? 'Atualizar' : 'Criar'} Categoria
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Setor */}
      <Modal
        isOpen={showSetorModal}
        onClose={() => {
          setShowSetorModal(false);
          setSetorEditando(null);
          setFormSetor({ nome: '' });
        }}
        title={setorEditando ? 'Editar Setor' : 'Novo Setor'}
      >
        <form onSubmit={handleSubmitSetor} className="space-y-4">
          <div>
            <label htmlFor="nomeSetor" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Setor
            </label>
            <input
              type="text"
              id="nomeSetor"
              value={formSetor.nome}
              onChange={(e) => setFormSetor(prev => ({ ...prev, nome: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o nome do setor"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowSetorModal(false);
                setSetorEditando(null);
                setFormSetor({ nome: '' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {setorEditando ? 'Atualizar' : 'Criar'} Setor
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Usuário */}
      <Modal
        isOpen={showUsuarioModal}
        onClose={() => {
          setShowUsuarioModal(false);
          setUsuarioEditando(null);
          setFormUsuario({ usuario: '', senha: '', tipo: 'user', nome: '', setorId: '' });
        }}
        title={usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <form onSubmit={handleSubmitUsuario} className="space-y-4">
          <div>
            <label htmlFor="nomeUsuario" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              id="nomeUsuario"
              value={formUsuario.nome}
              onChange={(e) => setFormUsuario(prev => ({ ...prev, nome: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o nome completo"
            />
          </div>

          <div>
            <label htmlFor="loginUsuario" className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <input
              type="text"
              id="loginUsuario"
              value={formUsuario.usuario}
              onChange={(e) => setFormUsuario(prev => ({ ...prev, usuario: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o nome de usuário"
            />
          </div>

          <div>
            <label htmlFor="senhaUsuario" className="block text-sm font-medium text-gray-700 mb-1">
              {usuarioEditando ? 'Nova Senha (deixe vazio para manter atual)' : 'Senha'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="senhaUsuario"
                value={formUsuario.senha}
                onChange={(e) => setFormUsuario(prev => ({ ...prev, senha: e.target.value }))}
                required={!usuarioEditando}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite a senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="tipoUsuario" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Usuário
            </label>
            <select
              id="tipoUsuario"
              value={formUsuario.tipo}
              onChange={(e) => setFormUsuario(prev => ({ ...prev, tipo: e.target.value as 'admin' | 'user' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {formUsuario.tipo === 'user' && (
            <div>
              <label htmlFor="setorUsuario" className="block text-sm font-medium text-gray-700 mb-1">
                Setor *
              </label>
              <select
                id="setorUsuario"
                value={formUsuario.setorId}
                onChange={(e) => setFormUsuario(prev => ({ ...prev, setorId: e.target.value }))}
                required={formUsuario.tipo === 'user'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um setor</option>
                {setores.map(setor => (
                  <option key={setor.id} value={setor.id}>
                    {setor.nome}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Usuários comuns só podem ver solicitações do seu setor
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowUsuarioModal(false);
                setUsuarioEditando(null);
                setFormUsuario({ usuario: '', senha: '', tipo: 'user', nome: '', setorId: '' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {usuarioEditando ? 'Atualizar' : 'Criar'} Usuário
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};