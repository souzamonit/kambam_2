import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { getLogsAuditoria } from '../utils/storage';
import { LogAuditoria } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, User, Calendar, Filter, Eye } from 'lucide-react';

export const Auditoria: React.FC = () => {
  const [logs] = useState<LogAuditoria[]>(getLogsAuditoria());
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Filtrar logs baseado nos critérios
  const logsFiltrados = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = !searchTerm || 
        log.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.nomeUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.acao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchUsuario = !filtroUsuario || 
        log.nomeUsuario.toLowerCase().includes(filtroUsuario.toLowerCase());

      const matchData = (!dataInicio || new Date(log.dataHora) >= new Date(dataInicio)) &&
        (!dataFim || new Date(log.dataHora) <= new Date(dataFim + 'T23:59:59'));

      return matchSearch && matchUsuario && matchData;
    });
  }, [logs, searchTerm, filtroSetor, filtroUsuario, dataInicio, dataFim]);

  const getAcaoColor = (acao: string) => {
    switch (acao.toLowerCase()) {
      case 'criação':
        return 'bg-green-100 text-green-800';
      case 'edição':
        return 'bg-blue-100 text-blue-800';
      case 'mudança de status':
        return 'bg-yellow-100 text-yellow-800';
      case 'exclusão':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const limparFiltros = () => {
    setSearchTerm('');
    setFiltroSetor('');
    setFiltroUsuario('');
    setDataInicio('');
    setDataFim('');
  };

  return (
    <Layout title="Auditoria">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Auditoria do Sistema</h1>
          <p className="text-gray-600">
            Histórico completo de alterações nas solicitações
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filtros de Pesquisa</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesquisa Geral
              </label>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Protocolo, usuário ou ação..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <input
                type="text"
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome do usuário"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Mostrando {logsFiltrados.length} de {logs.length} registros
            </p>
            <button
              onClick={limparFiltros}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Histórico de Alterações
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protocolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campo Alterado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alteração
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logsFiltrados.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {format(new Date(log.dataHora), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        #{log.protocolo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        {log.nomeUsuario}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAcaoColor(log.acao)}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.campoAlterado || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      {log.valorAnterior && log.valorNovo ? (
                        <div className="space-y-1">
                          <div className="text-red-600">
                            <span className="font-medium">De:</span> {log.valorAnterior}
                          </div>
                          <div className="text-green-600">
                            <span className="font-medium">Para:</span> {log.valorNovo}
                          </div>
                        </div>
                      ) : (
                        log.detalhes || '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logsFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Eye className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum registro encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não há logs de auditoria que correspondam aos filtros aplicados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};