import React from 'react';
import { Calendar, Edit, AlertCircle, User, Building, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Solicitacao, Categoria, Setor } from '../types';
import { CountdownTimer } from './CountdownTimer';

interface SolicitacaoCardProps {
  solicitacao: Solicitacao;
  categoria?: Categoria;
  setor?: Setor;
  onEdit: (solicitacao: Solicitacao) => void;
}

export const SolicitacaoCard: React.FC<SolicitacaoCardProps> = ({
  solicitacao,
  categoria,
  setor,
  onEdit
}) => {
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'text-red-600 bg-red-100';
      case 'media': return 'text-yellow-600 bg-yellow-100';
      case 'baixa': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrioridadeLabel = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return 'Não definida';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header com protocolo e botão editar */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
            #{solicitacao.protocolo}
          </span>
        </div>
        <button
          onClick={() => onEdit(solicitacao)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="Editar solicitação"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>

      {/* Título */}
      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
        {solicitacao.titulo}
      </h3>

      {/* Descrição */}
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {solicitacao.descricao}
      </p>

      {/* Informações da solicitação */}
      <div className="space-y-2 mb-3">
        {categoria && (
          <div className="flex items-center text-xs">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: categoria.cor }}
            ></div>
            <span className="text-gray-600">{categoria.nome}</span>
          </div>
        )}

        {setor && (
          <div className="flex items-center text-xs text-gray-600">
            <Building className="h-3 w-3 mr-2" />
            <span>{setor.nome}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(solicitacao.prioridade)}`}>
            <AlertCircle className="h-3 w-3 mr-1" />
            {getPrioridadeLabel(solicitacao.prioridade)}
          </span>
        </div>
      </div>

      {/* Cronômetro de prazo */}
      <div className="mb-3">
        <CountdownTimer prazoVencimento={solicitacao.prazoVencimento} />
      </div>

      {/* Datas */}
      <div className="border-t border-gray-100 pt-2 space-y-1">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Criado: {format(new Date(solicitacao.dataSolicitacao), 'dd/MM/yyyy', { locale: ptBR })}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Atualizado: {format(new Date(solicitacao.dataAtualizacao), 'dd/MM/yyyy', { locale: ptBR })}</span>
        </div>
      </div>
    </div>
  );
};