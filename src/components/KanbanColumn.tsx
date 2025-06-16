import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { SolicitacaoCard } from './SolicitacaoCard';
import { Solicitacao, Categoria, Setor } from '../types';

interface KanbanColumnProps {
  title: string;
  status: string;
  solicitacoes: Solicitacao[];
  categorias: Categoria[];
  setores: Setor[];
  onEditSolicitacao: (solicitacao: Solicitacao) => void;
  color: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  solicitacoes,
  categorias,
  setores,
  onEditSolicitacao,
  color
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 min-h-[600px] w-80">
      <div className="flex items-center mb-4">
        <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: color }}></div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <span className="ml-auto bg-gray-200 text-gray-600 text-sm px-2 py-1 rounded-full">
          {solicitacoes.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[500px] transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
            }`}
          >
            {solicitacoes.map((solicitacao, index) => (
              <Draggable
                key={solicitacao.id}
                draggableId={solicitacao.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transition-transform duration-200 ${
                      snapshot.isDragging ? 'rotate-3 scale-105' : ''
                    }`}
                  >
                    <SolicitacaoCard
                      solicitacao={solicitacao}
                      categoria={categorias.find(c => c.id === solicitacao.categoriaId)}
                      setor={setores.find(s => s.id === solicitacao.setorId)}
                      onEdit={onEditSolicitacao}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};