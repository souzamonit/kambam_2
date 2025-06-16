export interface Usuario {
  id: string;
  usuario: string;
  senha: string;
  tipo: 'admin' | 'user';
  primeiroLogin: boolean;
  nome: string;
  setorId?: string; // Obrigatório para usuários comuns
  dataCriacao: string;
}

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  dataCriacao: string;
}

export interface Setor {
  id: string;
  nome: string;
  dataCriacao: string;
}

export interface Solicitacao {
  id: string;
  protocolo: string; // Número de protocolo único
  titulo: string;
  descricao: string;
  categoriaId: string;
  setorId: string;
  status: 'pendente' | 'em-andamento' | 'concluida' | 'sem-categoria';
  dataSolicitacao: string;
  dataAtualizacao: string;
  criadoPor?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  observacoes?: string;
  prazoVencimento?: string; // Data e hora do prazo
}

export interface LogAuditoria {
  id: string;
  solicitacaoId: string;
  protocolo: string;
  usuarioId?: string;
  nomeUsuario: string;
  acao: string;
  campoAlterado?: string;
  valorAnterior?: string;
  valorNovo?: string;
  dataHora: string;
  detalhes?: string;
}

export interface AuthContextType {
  usuario: Usuario | null;
  login: (usuario: string, senha: string) => Promise<boolean>;
  logout: () => void;
  alterarSenha: (senhaAtual: string, novaSenha: string) => Promise<boolean>;
  isAuthenticated: boolean;
}