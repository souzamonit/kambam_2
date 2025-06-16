import React, { useState, useEffect } from 'react';
import { Solicitacao, Categoria, Setor } from '../types';

interface FormularioSolicitacaoProps {
  solicitacao?: Solicitacao;
  categorias: Categoria[];
  setores: Setor[];
  onSubmit: (dados: Partial<Solicitacao>) => void;
  onCancel: () => void;
}

export const FormularioSolicitacao: React.FC<FormularioSolicitacaoProps> = ({
  solicitacao,
  categorias,
  setores,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoriaId: '',
    setorId: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta',
    observacoes: '',
    prazoVencimento: ''
  });

  useEffect(() => {
    if (solicitacao) {
      setFormData({
        titulo: solicitacao.titulo,
        descricao: solicitacao.descricao,
        categoriaId: solicitacao.categoriaId,
        setorId: solicitacao.setorId,
        prioridade: solicitacao.prioridade,
        observacoes: solicitacao.observacoes || '',
        prazoVencimento: solicitacao.prazoVencimento ? 
          new Date(solicitacao.prazoVencimento).toISOString().slice(0, 16) : ''
      });
    }
  }, [solicitacao]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dadosSubmissao = {
      ...formData,
      prazoVencimento: formData.prazoVencimento ? 
        new Date(formData.prazoVencimento).toISOString() : undefined
    };
    
    onSubmit(dadosSubmissao);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Digite o título da solicitação"
        />
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição *
        </label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Descreva detalhadamente a solicitação"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            id="categoriaId"
            name="categoriaId"
            value={formData.categoriaId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="setorId" className="block text-sm font-medium text-gray-700 mb-1">
            Setor
          </label>
          <select
            id="setorId"
            name="setorId"
            value={formData.setorId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione um setor</option>
            {setores.map(setor => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridade
          </label>
          <select
            id="prioridade"
            name="prioridade"
            value={formData.prioridade}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <div>
          <label htmlFor="prazoVencimento" className="block text-sm font-medium text-gray-700 mb-1">
            Prazo para Conclusão
          </label>
          <input
            type="datetime-local"
            id="prazoVencimento"
            name="prazoVencimento"
            value={formData.prazoVencimento}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Observações adicionais (opcional)"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {solicitacao ? 'Atualizar' : 'Criar'} Solicitação
        </button>
      </div>
    </form>
  );
};