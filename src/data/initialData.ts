import { Usuario, Categoria, Setor, Solicitacao } from '../types';

export const usuariosIniciais: Usuario[] = [
  {
    id: '1',
    usuario: 'admin',
    senha: 'admin',
    tipo: 'admin',
    primeiroLogin: true,
    nome: 'Administrador',
    dataCriacao: new Date().toISOString()
  }
];

export const categoriasIniciais: Categoria[] = [
  {
    id: '1',
    nome: 'Suporte',
    cor: '#3B82F6',
    dataCriacao: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Desenvolvimento',
    cor: '#059669',
    dataCriacao: new Date().toISOString()
  },
  {
    id: '3',
    nome: 'Infraestrutura',
    cor: '#DC2626',
    dataCriacao: new Date().toISOString()
  }
];

export const setoresIniciais: Setor[] = [
  {
    id: '1',
    nome: 'Marketing',
    dataCriacao: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Infraestrutura',
    dataCriacao: new Date().toISOString()
  },
  {
    id: '3',
    nome: 'Rede',
    dataCriacao: new Date().toISOString()
  },
  {
    id: '4',
    nome: 'Desenvolvimento',
    dataCriacao: new Date().toISOString()
  }
];

export const solicitacoesIniciais: Solicitacao[] = [
  {
    id: '1',
    titulo: 'Configuração de E-mail',
    descricao: 'Configurar conta de e-mail corporativo para novo funcionário',
    categoriaId: '1',
    setorId: '1',
    status: 'pendente',
    dataSolicitacao: new Date(Date.now() - 86400000).toISOString(),
    dataAtualizacao: new Date(Date.now() - 86400000).toISOString(),
    prioridade: 'media'
  },
  {
    id: '2',
    titulo: 'Desenvolvimento de Nova Feature',
    descricao: 'Implementar sistema de relatórios no dashboard',
    categoriaId: '2',
    setorId: '4',
    status: 'em-andamento',
    dataSolicitacao: new Date(Date.now() - 172800000).toISOString(),
    dataAtualizacao: new Date().toISOString(),
    prioridade: 'alta'
  }
];