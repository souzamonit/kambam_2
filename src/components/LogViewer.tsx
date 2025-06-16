import React, { useState, useEffect, useMemo } from 'react';
import { LogEntry, LogFilter, logger } from '../utils/logger';
import { SearchBar } from './SearchBar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  Download, 
  Trash2, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Bug,
  Eye,
  EyeOff,
  Calendar,
  User,
  Activity
} from 'lucide-react';

interface LogViewerProps {
  height?: string;
  showFilters?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  height = '600px',
  showFilters = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(autoRefresh);

  useEffect(() => {
    // Carregar logs iniciais
    setLogs(logger.getLogs());

    // Inscrever-se para atualizações em tempo real
    const unsubscribe = logger.subscribe((newLogs) => {
      setLogs(newLogs);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      setLogs(logger.getLogs(filter));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, filter]);

  const filteredLogs = useMemo(() => {
    const filterWithSearch = { ...filter, search: searchTerm };
    return logger.getLogs(filterWithSearch);
  }, [logs, filter, searchTerm]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug':
        return <Bug className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'AUTH': 'bg-purple-100 text-purple-800',
      'SOLICITACAO': 'bg-green-100 text-green-800',
      'ADMIN': 'bg-orange-100 text-orange-800',
      'SYSTEM': 'bg-indigo-100 text-indigo-800',
      'TELEGRAM': 'bg-cyan-100 text-cyan-800',
      'ERROR': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleExportLogs = (format: 'json' | 'csv') => {
    const content = logger.exportLogs(format);
    const blob = new Blob([content], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
      logger.clearLogs();
    }
  };

  const stats = logger.getStats();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Logs do Sistema</h3>
            <div className="ml-4 flex items-center space-x-4 text-sm text-gray-500">
              <span>Total: {stats.total}</span>
              <span>Erros: {stats.errors}</span>
              <span>Avisos: {stats.warnings}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`p-2 rounded-md transition-colors ${
                isAutoRefresh 
                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isAutoRefresh ? 'Desativar atualização automática' : 'Ativar atualização automática'}
            >
              <RefreshCw className={`h-4 w-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => handleExportLogs('json')}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Exportar como JSON"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleExportLogs('csv')}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Exportar como CSV"
            >
              <FileText className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleClearLogs}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Limpar todos os logs"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Pesquisar logs..."
              />
            </div>
            
            <div>
              <select
                value={filter.level || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, level: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todos os níveis</option>
                <option value="error">Erro</option>
                <option value="warn">Aviso</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
            
            <div>
              <select
                value={filter.category || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todas as categorias</option>
                <option value="AUTH">Autenticação</option>
                <option value="SOLICITACAO">Solicitações</option>
                <option value="ADMIN">Administração</option>
                <option value="SYSTEM">Sistema</option>
                <option value="TELEGRAM">Telegram</option>
              </select>
            </div>
            
            <div>
              <input
                type="date"
                value={filter.dateFrom || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Data início"
              />
            </div>
            
            <div>
              <input
                type="date"
                value={filter.dateTo || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Data fim"
              />
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
            <span>Mostrando {filteredLogs.length} de {logs.length} logs</span>
            <button
              onClick={() => {
                setFilter({});
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Lista de Logs */}
      <div className="overflow-auto" style={{ height }}>
        <div className="divide-y divide-gray-200">
          {filteredLogs.map((log) => (
            <div key={log.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getLevelIcon(log.level)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                      </div>
                      {log.userName && (
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          {log.userName}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-900 font-medium">{log.message}</p>
                    
                    {log.details && (
                      <button
                        onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                        className="mt-1 inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {showDetails === log.id ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Ocultar detalhes
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Ver detalhes
                          </>
                        )}
                      </button>
                    )}
                    
                    {showDetails === log.id && log.details && (
                      <div className="mt-2 p-3 bg-gray-100 rounded-md">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum log encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Não há logs que correspondam aos filtros aplicados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};