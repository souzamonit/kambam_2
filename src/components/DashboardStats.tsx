import React from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { Solicitacao, Categoria, Setor } from '../types';

interface DashboardStatsProps {
  solicitacoes: Solicitacao[];
  categorias: Categoria[];
  setores: Setor[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  solicitacoes,
  categorias,
  setores
}) => {
  const totalSolicitacoes = solicitacoes.length;
  const pendentes = solicitacoes.filter(s => s.status === 'pendente').length;
  const emAndamento = solicitacoes.filter(s => s.status === 'em-andamento').length;
  const concluidas = solicitacoes.filter(s => s.status === 'concluida').length;
  const semCategoria = solicitacoes.filter(s => s.status === 'sem-categoria').length;
  const altaPrioridade = solicitacoes.filter(s => s.prioridade === 'alta').length;

  const taxaConclusao = totalSolicitacoes > 0 ? Math.round((concluidas / totalSolicitacoes) * 100) : 0;

  const estatisticasPorCategoria = categorias.map(categoria => ({
    nome: categoria.nome,
    cor: categoria.cor,
    total: solicitacoes.filter(s => s.categoriaId === categoria.id).length,
    concluidas: solicitacoes.filter(s => s.categoriaId === categoria.id && s.status === 'concluida').length
  }));

  const estatisticasPorSetor = setores.map(setor => ({
    nome: setor.nome,
    total: solicitacoes.filter(s => s.setorId === setor.id).length,
    pendentes: solicitacoes.filter(s => s.setorId === setor.id && s.status === 'pendente').length
  }));

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
              <p className="text-2xl font-bold text-gray-900">{totalSolicitacoes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{pendentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{concluidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alta Prioridade</p>
              <p className="text-2xl font-bold text-gray-900">{altaPrioridade}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Sem Categoria</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{semCategoria}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-400 h-2 rounded-full" 
                    style={{ width: `${totalSolicitacoes > 0 ? (semCategoria / totalSolicitacoes) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Pendente</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{pendentes}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${totalSolicitacoes > 0 ? (pendentes / totalSolicitacoes) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Em Andamento</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{emAndamento}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${totalSolicitacoes > 0 ? (emAndamento / totalSolicitacoes) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Concluída</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{concluidas}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${totalSolicitacoes > 0 ? (concluidas / totalSolicitacoes) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Taxa de Conclusão */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Geral</h3>
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${taxaConclusao}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{taxaConclusao}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Taxa de Conclusão</p>
          </div>
        </div>
      </div>

      {/* Estatísticas por Categoria */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Solicitações por Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estatisticasPorCategoria.map(categoria => (
            <div key={categoria.nome} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: categoria.cor }}
                  ></div>
                  <span className="font-medium text-gray-900">{categoria.nome}</span>
                </div>
                <span className="text-sm text-gray-600">{categoria.total}</span>
              </div>
              <div className="text-xs text-gray-500">
                {categoria.concluidas} concluídas de {categoria.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estatísticas por Setor */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Solicitações por Setor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {estatisticasPorSetor.map(setor => (
            <div key={setor.nome} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">{setor.nome}</span>
                </div>
                <span className="text-sm text-gray-600">{setor.total}</span>
              </div>
              <div className="text-xs text-gray-500">
                {setor.pendentes} pendentes
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};