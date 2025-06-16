export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  details?: any;
  userId?: string;
  userName?: string;
  ip?: string;
  userAgent?: string;
}

export interface LogFilter {
  level?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Máximo de logs mantidos em memória
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  constructor() {
    this.loadLogsFromStorage();
  }

  private loadLogsFromStorage() {
    try {
      const storedLogs = localStorage.getItem('kanban_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.error('Erro ao carregar logs do storage:', error);
    }
  }

  private saveLogsToStorage() {
    try {
      // Manter apenas os últimos logs para não sobrecarregar o localStorage
      const logsToSave = this.logs.slice(-this.maxLogs);
      localStorage.setItem('kanban_logs', JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Erro ao salvar logs no storage:', error);
    }
  }

  private createLogEntry(
    level: LogEntry['level'],
    category: string,
    message: string,
    details?: any,
    userInfo?: { id?: string; name?: string }
  ): LogEntry {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      userId: userInfo?.id,
      userName: userInfo?.name,
      ip: 'localhost', // Em produção, capturar IP real
      userAgent: navigator.userAgent
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Manter apenas os últimos logs em memória
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.saveLogsToStorage();
    this.notifyListeners();

    // Log no console para desenvolvimento
    const consoleMethod = entry.level === 'error' ? 'error' : 
                         entry.level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${entry.level.toUpperCase()}] ${entry.category}: ${entry.message}`, entry.details);
  }

  info(category: string, message: string, details?: any, userInfo?: { id?: string; name?: string }) {
    this.addLog(this.createLogEntry('info', category, message, details, userInfo));
  }

  warn(category: string, message: string, details?: any, userInfo?: { id?: string; name?: string }) {
    this.addLog(this.createLogEntry('warn', category, message, details, userInfo));
  }

  error(category: string, message: string, details?: any, userInfo?: { id?: string; name?: string }) {
    this.addLog(this.createLogEntry('error', category, message, details, userInfo));
  }

  debug(category: string, message: string, details?: any, userInfo?: { id?: string; name?: string }) {
    this.addLog(this.createLogEntry('debug', category, message, details, userInfo));
  }

  // Métodos específicos para diferentes operações
  logAuth(action: string, username: string, success: boolean, details?: any) {
    const level = success ? 'info' : 'warn';
    this.addLog(this.createLogEntry(
      level,
      'AUTH',
      `${action}: ${username} - ${success ? 'Sucesso' : 'Falha'}`,
      details,
      { name: username }
    ));
  }

  logSolicitacao(action: string, protocolo: string, userId?: string, userName?: string, details?: any) {
    this.addLog(this.createLogEntry(
      'info',
      'SOLICITACAO',
      `${action} - Protocolo: ${protocolo}`,
      details,
      { id: userId, name: userName }
    ));
  }

  logAdmin(action: string, target: string, userId?: string, userName?: string, details?: any) {
    this.addLog(this.createLogEntry(
      'info',
      'ADMIN',
      `${action} - ${target}`,
      details,
      { id: userId, name: userName }
    ));
  }

  logSystem(message: string, details?: any) {
    this.addLog(this.createLogEntry('info', 'SYSTEM', message, details));
  }

  logError(category: string, error: Error | string, details?: any, userInfo?: { id?: string; name?: string }) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorDetails = error instanceof Error ? 
      { ...details, stack: error.stack } : details;
    
    this.addLog(this.createLogEntry('error', category, errorMessage, errorDetails, userInfo));
  }

  // Métodos para gerenciar listeners (para componentes React)
  subscribe(callback: (logs: LogEntry[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  // Métodos para filtrar e buscar logs
  getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level);
      }

      if (filter.category) {
        filteredLogs = filteredLogs.filter(log => 
          log.category.toLowerCase().includes(filter.category!.toLowerCase())
        );
      }

      if (filter.dateFrom) {
        const fromDate = new Date(filter.dateFrom);
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= fromDate
        );
      }

      if (filter.dateTo) {
        const toDate = new Date(filter.dateTo + 'T23:59:59');
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= toDate
        );
      }

      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log =>
          log.message.toLowerCase().includes(searchTerm) ||
          log.category.toLowerCase().includes(searchTerm) ||
          (log.userName && log.userName.toLowerCase().includes(searchTerm))
        );
      }
    }

    return filteredLogs.reverse(); // Mais recentes primeiro
  }

  // Limpar logs
  clearLogs() {
    this.logs = [];
    this.saveLogsToStorage();
    this.notifyListeners();
    this.info('SYSTEM', 'Logs limpos pelo usuário');
  }

  // Exportar logs
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Category', 'Message', 'User', 'Details'];
      const csvContent = [
        headers.join(','),
        ...this.logs.map(log => [
          log.timestamp,
          log.level,
          log.category,
          `"${log.message.replace(/"/g, '""')}"`,
          log.userName || '',
          log.details ? `"${JSON.stringify(log.details).replace(/"/g, '""')}"` : ''
        ].join(','))
      ].join('\n');
      return csvContent;
    }

    return JSON.stringify(this.logs, null, 2);
  }

  // Estatísticas dos logs
  getStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const logs24h = this.logs.filter(log => new Date(log.timestamp) >= last24h);
    const logs7d = this.logs.filter(log => new Date(log.timestamp) >= last7d);

    const levelCounts = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryCounts = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.logs.length,
      last24h: logs24h.length,
      last7d: logs7d.length,
      byLevel: levelCounts,
      byCategory: categoryCounts,
      errors: this.logs.filter(log => log.level === 'error').length,
      warnings: this.logs.filter(log => log.level === 'warn').length
    };
  }
}

// Instância singleton do logger
export const logger = new Logger();

// Capturar erros globais
window.addEventListener('error', (event) => {
  logger.error('GLOBAL_ERROR', event.error || event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('UNHANDLED_PROMISE', event.reason, {
    promise: event.promise
  });
});

// Log inicial do sistema
logger.logSystem('Sistema iniciado');