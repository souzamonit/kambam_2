import { Usuario, Categoria, Setor, Solicitacao, LogAuditoria } from '../types';
import { usuariosIniciais, categoriasIniciais, setoresIniciais, solicitacoesIniciais } from '../data/initialData';

const STORAGE_KEYS = {
  USUARIOS: 'kanban_usuarios',
  CATEGORIAS: 'kanban_categorias',
  SETORES: 'kanban_setores',
  SOLICITACOES: 'kanban_solicitacoes',
  AUDITORIA: 'kanban_auditoria',
  CONTADOR_PROTOCOLO: 'kanban_contador_protocolo'
};

// Gerar número de protocolo único
export const gerarProtocolo = (): string => {
  const contador = getContadorProtocolo();
  const novoContador = contador + 1;
  localStorage.setItem(STORAGE_KEYS.CONTADOR_PROTOCOLO, novoContador.toString());
  
  const ano = new Date().getFullYear();
  const numeroFormatado = novoContador.toString().padStart(6, '0');
  return `${ano}${numeroFormatado}`;
};

const getContadorProtocolo = (): number => {
  const contador = localStorage.getItem(STORAGE_KEYS.CONTADOR_PROTOCOLO);
  return contador ? parseInt(contador) : 0;
};

// Inicializar dados se não existirem
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuariosIniciais));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIAS)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(categoriasIniciais));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETORES)) {
    localStorage.setItem(STORAGE_KEYS.SETORES, JSON.stringify(setoresIniciais));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SOLICITACOES)) {
    localStorage.setItem(STORAGE_KEYS.SOLICITACOES, JSON.stringify(solicitacoesIniciais));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDITORIA)) {
    localStorage.setItem(STORAGE_KEYS.AUDITORIA, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTADOR_PROTOCOLO)) {
    localStorage.setItem(STORAGE_KEYS.CONTADOR_PROTOCOLO, '0');
  }
};

// Registrar log de auditoria
export const registrarLogAuditoria = (log: Omit<LogAuditoria, 'id' | 'dataHora'>) => {
  const logs = getLogsAuditoria();
  const novoLog: LogAuditoria = {
    ...log,
    id: Date.now().toString(),
    dataHora: new Date().toISOString()
  };
  
  logs.push(novoLog);
  localStorage.setItem(STORAGE_KEYS.AUDITORIA, JSON.stringify(logs));
};

// Usuários
export const getUsuarios = (): Usuario[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USUARIOS);
  return data ? JSON.parse(data) : [];
};

export const saveUsuarios = (usuarios: Usuario[]) => {
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
};

// Categorias
export const getCategorias = (): Categoria[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIAS);
  return data ? JSON.parse(data) : [];
};

export const saveCategorias = (categorias: Categoria[]) => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(categorias));
};

// Setores
export const getSetores = (): Setor[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SETORES);
  return data ? JSON.parse(data) : [];
};

export const saveSetores = (setores: Setor[]) => {
  localStorage.setItem(STORAGE_KEYS.SETORES, JSON.stringify(setores));
};

// Solicitações
export const getSolicitacoes = (): Solicitacao[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SOLICITACOES);
  return data ? JSON.parse(data) : [];
};

export const saveSolicitacoes = (solicitacoes: Solicitacao[]) => {
  localStorage.setItem(STORAGE_KEYS.SOLICITACOES, JSON.stringify(solicitacoes));
};

// Auditoria
export const getLogsAuditoria = (): LogAuditoria[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AUDITORIA);
  return data ? JSON.parse(data) : [];
};

export const saveLogsAuditoria = (logs: LogAuditoria[]) => {
  localStorage.setItem(STORAGE_KEYS.AUDITORIA, JSON.stringify(logs));
};