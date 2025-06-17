import React, { useState } from 'react';
import { Database, CheckCircle, XCircle, RefreshCw, Server, HardDrive, Users, Activity, AlertTriangle } from 'lucide-react';
import { databaseManager } from '../utils/database';

interface DatabaseInfoProps {
  className?: string;
}

export const DatabaseInfo: React.FC<DatabaseInfoProps> = ({ className = '' }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const isUsingDatabase = databaseManager.isUsingDatabase();
  const dbConfig = databaseManager.getConfig();

  // Informações do banco de dados
  const databaseInfo = {
    type: isUsingDatabase ? 'MariaDB (Produção)' : 'LocalStorage (Desenvolvimento)',
    host: isUsingDatabase ? dbConfig?.host || 'Configurado' : 'Browser Local Storage',
    database: isUsingDatabase ? dbConfig?.database || 'kanban_solicitacoes' : 'kanban_solicitacoes',
    status: 'Ativo',
    version: isUsingDatabase ? 'MariaDB 10.x' : '1.0.0',
    tables: [
      { name: 'usuarios', records: localStorage.getItem('kanban_usuarios') ? JSON.parse(localStorage.getItem('kanban_usuarios')!).length : 0 },
      { name: 'categorias', records: localStorage.getItem('kanban_categorias') ? JSON.parse(localStorage.getItem('kanban_categorias')!).length : 0 },
      { name: 'setores', records: localStorage.getItem('kanban_setores') ? JSON.parse(localStorage.getItem('kanban_setores')!).length : 0 },
      { name: 'solicitacoes', records: localStorage.getItem('kanban_solicitacoes') ? JSON.parse(localStorage.getItem('kanban_solicitacoes')!).length : 0 },
      { name: 'auditoria', records: localStorage.getItem('kanban_auditoria') ? JSON.parse(localStorage.getItem('kanban_auditoria')!).length : 0 },
      { name: 'logs', records: localStorage.getItem('kanban_logs') ? JSON.parse(localStorage.getItem('kanban_logs')!).length : 0 }
    ]
  };

  const totalRecords = databaseInfo.tables.reduce((sum, table) => sum + table.records, 0);

  const checkConnection = async () => {
    setIsChecking(true);
    
    try {
      if (isUsingDatabase) {
        // Testar conexão real com o banco
        const result = await databaseManager.testConnection();
        setConnectionStatus(result.success ? 'connected' : 'disconnected');
        setConnectionMessage(result.message);
      } else {
        // Verificar se localStorage está funcionando
        const testKey = 'connection_test';
        localStorage.setItem(testKey, 'test');
        const testValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (testValue === 'test') {
          setConnectionStatus('connected');
          setConnectionMessage('LocalStorage funcionando corretamente');
        } else {
          setConnectionStatus('disconnected');
          setConnectionMessage('Erro no LocalStorage');
        }
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setConnectionMessage(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsChecking(false);
      setLastCheck(new Date());
    }
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (isChecking) return 'Verificando...';
    
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      default:
        return 'Status desconhecido';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'disconnected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Informações do Banco de Dados
        </h3>
        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          Testar Conexão
        </button>
      </div>

      {/* Alerta se não estiver usando banco de dados */}
      {!isUsingDatabase && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="font-medium text-yellow-800">Modo de Desenvolvimento</h4>
              <p className="text-sm text-yellow-700 mt-1">
                O sistema está usando LocalStorage. Para produção, configure as variáveis de ambiente do MariaDB.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status da Conexão */}
      <div className={`flex items-center justify-between p-4 rounded-lg border mb-6 ${getStatusColor()}`}>
        <div className="flex items-center">
          {getStatusIcon()}
          <div className="ml-3">
            <p className="font-medium">{getStatusText()}</p>
            {connectionMessage && (
              <p className="text-sm opacity-75 mt-1">{connectionMessage}</p>
            )}
            {lastCheck && (
              <p className="text-sm opacity-75">
                Última verificação: {lastCheck.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Informações Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Server className="h-4 w-4 mr-2" />
            Configuração
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-medium">{databaseInfo.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Host:</span>
              <span className="font-medium">{databaseInfo.host}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="font-medium">{databaseInfo.database}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Versão:</span>
              <span className="font-medium">{databaseInfo.version}</span>
            </div>
            {isUsingDatabase && dbConfig && (
              <div className="flex justify-between">
                <span className="text-gray-600">Porta:</span>
                <span className="font-medium">{dbConfig.port}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Estatísticas
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de Registros:</span>
              <span className="font-medium">{totalRecords.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tabelas:</span>
              <span className="font-medium">{databaseInfo.tables.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">{databaseInfo.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ambiente:</span>
              <span className="font-medium">{isUsingDatabase ? 'Produção' : 'Desenvolvimento'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabelas */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
          <HardDrive className="h-4 w-4 mr-2" />
          Tabelas do Sistema
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tabela
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {databaseInfo.tables.map((table) => (
                <tr key={table.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {table.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {table.records.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuração para Produção */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">
          {isUsingDatabase ? 'Configuração Ativa' : 'Configuração para Produção'}
        </h5>
        <p className="text-sm text-blue-700 mb-3">
          {isUsingDatabase 
            ? 'O sistema está configurado para usar MariaDB em produção.'
            : 'Para usar MariaDB em produção, configure as seguintes variáveis de ambiente:'
          }
        </p>
        <div className="bg-blue-100 p-3 rounded font-mono text-xs text-blue-800">
          DB_HOST={isUsingDatabase ? dbConfig?.host || 'configurado' : 'localhost'}<br />
          DB_PORT={isUsingDatabase ? dbConfig?.port || 'configurado' : '3306'}<br />
          DB_USER={isUsingDatabase ? 'configurado' : 'seu_usuario'}<br />
          DB_PASSWORD={isUsingDatabase ? '***' : 'sua_senha'}<br />
          DB_NAME={isUsingDatabase ? dbConfig?.database || 'configurado' : 'kanban_solicitacoes'}
        </div>
        {!isUsingDatabase && (
          <p className="text-xs text-blue-600 mt-2">
            <strong>Nota:</strong> Após configurar as variáveis, reinicie a aplicação para ativar o banco de dados.
          </p>
        )}
      </div>

      {/* Instruções de Migração */}
      {!isUsingDatabase && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Passos para Migração</h5>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Configure um servidor MariaDB</li>
            <li>Execute os scripts SQL da documentação</li>
            <li>Configure as variáveis de ambiente</li>
            <li>Exporte os dados do LocalStorage</li>
            <li>Importe os dados para o MariaDB</li>
            <li>Reinicie a aplicação</li>
          </ol>
        </div>
      )}
    </div>
  );
};