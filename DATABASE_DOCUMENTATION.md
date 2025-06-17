# Documentação do Banco de Dados - Sistema Kanban

## Visão Geral
Este documento descreve a estrutura do banco de dados MariaDB para o Sistema Kanban de Gerenciamento de Solicitações com funcionalidades avançadas de auditoria, logs e notificações.

## Estrutura das Tabelas

### 1. Tabela: `usuarios`
Armazena informações dos usuários do sistema com controle de acesso por setor.

```sql
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'user') NOT NULL,
    primeiro_login BOOLEAN DEFAULT TRUE,
    nome VARCHAR(100) NOT NULL,
    setor_id VARCHAR(36),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE SET NULL
);
```

**Campos:**
- `id`: Identificador único do usuário (UUID)
- `usuario`: Nome de usuário para login (único)
- `senha`: Senha criptografada do usuário
- `tipo`: Tipo de usuário (admin ou user)
- `primeiro_login`: Indica se é o primeiro login (para forçar troca de senha)
- `nome`: Nome completo do usuário
- `setor_id`: Referência ao setor (obrigatório para usuários comuns)
- `data_criacao`: Data de criação do registro
- `data_atualizacao`: Data da última atualização

### 2. Tabela: `categorias`
Armazena as categorias das solicitações com cores para identificação visual.

```sql
CREATE TABLE categorias (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(7) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único da categoria (UUID)
- `nome`: Nome da categoria
- `cor`: Cor em hexadecimal para identificação visual
- `data_criacao`: Data de criação da categoria

### 3. Tabela: `setores`
Armazena os setores organizacionais para controle de acesso.

```sql
CREATE TABLE setores (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único do setor (UUID)
- `nome`: Nome do setor
- `data_criacao`: Data de criação do setor

### 4. Tabela: `solicitacoes`
Armazena as solicitações do sistema com protocolo único e controle de prazo.

```sql
CREATE TABLE solicitacoes (
    id VARCHAR(36) PRIMARY KEY,
    protocolo VARCHAR(20) UNIQUE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    categoria_id VARCHAR(36),
    setor_id VARCHAR(36),
    status ENUM('pendente', 'em-andamento', 'concluida', 'sem-categoria') NOT NULL,
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    criado_por VARCHAR(36),
    prioridade ENUM('baixa', 'media', 'alta') DEFAULT 'media',
    observacoes TEXT,
    prazo_vencimento TIMESTAMP NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE SET NULL,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

**Campos:**
- `id`: Identificador único da solicitação (UUID)
- `protocolo`: Número de protocolo único sequencial (formato: AAAANNNNNN)
- `titulo`: Título da solicitação
- `descricao`: Descrição detalhada da solicitação
- `categoria_id`: Referência à categoria (FK)
- `setor_id`: Referência ao setor (FK)
- `status`: Status atual da solicitação
- `data_solicitacao`: Data de criação da solicitação
- `data_atualizacao`: Data da última atualização
- `criado_por`: Referência ao usuário que criou (FK, opcional)
- `prioridade`: Nível de prioridade da solicitação
- `observacoes`: Observações adicionais
- `prazo_vencimento`: Data e hora limite para conclusão (opcional)

### 5. Tabela: `logs_auditoria`
Registra todas as alterações feitas nas solicitações para auditoria.

```sql
CREATE TABLE logs_auditoria (
    id VARCHAR(36) PRIMARY KEY,
    solicitacao_id VARCHAR(36) NOT NULL,
    protocolo VARCHAR(20) NOT NULL,
    usuario_id VARCHAR(36),
    nome_usuario VARCHAR(100) NOT NULL,
    acao VARCHAR(100) NOT NULL,
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalhes TEXT,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

**Campos:**
- `id`: Identificador único do log (UUID)
- `solicitacao_id`: Referência à solicitação alterada
- `protocolo`: Número do protocolo da solicitação
- `usuario_id`: Referência ao usuário que fez a alteração
- `nome_usuario`: Nome do usuário (para preservar histórico)
- `acao`: Tipo de ação realizada (Criação, Edição, Mudança de Status, Exclusão)
- `campo_alterado`: Nome do campo que foi alterado
- `valor_anterior`: Valor antes da alteração
- `valor_novo`: Valor após a alteração
- `data_hora`: Data e hora da alteração
- `detalhes`: Informações adicionais sobre a alteração

### 6. Tabela: `logs_sistema`
Registra logs detalhados do sistema para monitoramento e debugging.

```sql
CREATE TABLE logs_sistema (
    id VARCHAR(36) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level ENUM('info', 'warn', 'error', 'debug') NOT NULL,
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    details JSON,
    user_id VARCHAR(36),
    user_name VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

**Campos:**
- `id`: Identificador único do log (UUID)
- `timestamp`: Data e hora do evento
- `level`: Nível do log (info, warn, error, debug)
- `category`: Categoria do evento (AUTH, SOLICITACAO, ADMIN, SYSTEM, TELEGRAM)
- `message`: Mensagem do log
- `details`: Detalhes adicionais em formato JSON
- `user_id`: Referência ao usuário relacionado ao evento
- `user_name`: Nome do usuário (para preservar histórico)
- `ip_address`: Endereço IP do usuário
- `user_agent`: Informações do navegador/cliente

### 7. Tabela: `contador_protocolo`
Controla a sequência de números de protocolo.

```sql
CREATE TABLE contador_protocolo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ano INT NOT NULL,
    contador INT NOT NULL DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ano (ano)
);
```

**Campos:**
- `id`: Identificador único
- `ano`: Ano de referência
- `contador`: Contador sequencial para o ano
- `data_criacao`: Data de criação do registro
- `data_atualizacao`: Data da última atualização

## Relacionamentos

### 1. `usuarios` → `setores`
- **Tipo**: N:1 (muitos usuários para um setor)
- **Chave estrangeira**: `setor_id`
- **Ação**: ON DELETE SET NULL
- **Regra**: Obrigatório para usuários do tipo 'user', opcional para 'admin'

### 2. `solicitacoes` → `categorias`
- **Tipo**: N:1 (muitas solicitações para uma categoria)
- **Chave estrangeira**: `categoria_id`
- **Ação**: ON DELETE SET NULL

### 3. `solicitacoes` → `setores`
- **Tipo**: N:1 (muitas solicitações para um setor)
- **Chave estrangeira**: `setor_id`
- **Ação**: ON DELETE SET NULL

### 4. `solicitacoes` → `usuarios`
- **Tipo**: N:1 (muitas solicitações para um usuário)
- **Chave estrangeira**: `criado_por`
- **Ação**: ON DELETE SET NULL

### 5. `logs_auditoria` → `solicitacoes`
- **Tipo**: N:1 (muitos logs para uma solicitação)
- **Chave estrangeira**: `solicitacao_id`
- **Ação**: ON DELETE CASCADE

### 6. `logs_auditoria` → `usuarios`
- **Tipo**: N:1 (muitos logs para um usuário)
- **Chave estrangeira**: `usuario_id`
- **Ação**: ON DELETE SET NULL

### 7. `logs_sistema` → `usuarios`
- **Tipo**: N:1 (muitos logs para um usuário)
- **Chave estrangeira**: `user_id`
- **Ação**: ON DELETE SET NULL

## Índices Recomendados

```sql
-- Índices para performance de consultas
CREATE INDEX idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX idx_solicitacoes_categoria ON solicitacoes(categoria_id);
CREATE INDEX idx_solicitacoes_setor ON solicitacoes(setor_id);
CREATE INDEX idx_solicitacoes_data_solicitacao ON solicitacoes(data_solicitacao);
CREATE INDEX idx_solicitacoes_prioridade ON solicitacoes(prioridade);
CREATE INDEX idx_solicitacoes_protocolo ON solicitacoes(protocolo);
CREATE INDEX idx_solicitacoes_prazo ON solicitacoes(prazo_vencimento);

-- Índices para auditoria
CREATE INDEX idx_auditoria_solicitacao ON logs_auditoria(solicitacao_id);
CREATE INDEX idx_auditoria_protocolo ON logs_auditoria(protocolo);
CREATE INDEX idx_auditoria_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_auditoria_data ON logs_auditoria(data_hora);
CREATE INDEX idx_auditoria_acao ON logs_auditoria(acao);

-- Índices para logs do sistema
CREATE INDEX idx_logs_timestamp ON logs_sistema(timestamp);
CREATE INDEX idx_logs_level ON logs_sistema(level);
CREATE INDEX idx_logs_category ON logs_sistema(category);
CREATE INDEX idx_logs_user ON logs_sistema(user_id);

-- Índices para usuários
CREATE INDEX idx_usuarios_setor ON usuarios(setor_id);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
```

## Dados Iniciais

### Usuário Administrador Padrão
```sql
INSERT INTO usuarios (id, usuario, senha, tipo, primeiro_login, nome) 
VALUES ('1', 'admin', 'admin', 'admin', TRUE, 'Administrador');
```

### Categorias Iniciais
```sql
INSERT INTO categorias (id, nome, cor) VALUES 
('1', 'Suporte', '#3B82F6'),
('2', 'Desenvolvimento', '#059669'),
('3', 'Infraestrutura', '#DC2626');
```

### Setores Iniciais
```sql
INSERT INTO setores (id, nome) VALUES 
('1', 'Marketing'),
('2', 'Infraestrutura'),
('3', 'Rede'),
('4', 'Desenvolvimento');
```

### Contador de Protocolo Inicial
```sql
INSERT INTO contador_protocolo (ano, contador) 
VALUES (YEAR(NOW()), 0);
```

## Funcionalidades Implementadas

### 1. Sistema de Protocolo Único
- Geração automática de protocolo no formato AAAANNNNNN (ano + sequencial)
- Controle por ano com reset automático
- Exibição do protocolo ao usuário após criação

### 2. Controle de Acesso por Setor
- Usuários comuns só visualizam solicitações do seu setor
- Administradores têm acesso completo
- Validação obrigatória de setor para usuários comuns

### 3. Sistema de Prazo e Cronômetro
- Campo opcional de prazo de vencimento
- Cronômetro regressivo em tempo real
- Indicadores visuais de urgência e vencimento

### 4. Auditoria Completa
- Registro de todas as alterações
- Histórico detalhado com antes/depois
- Filtros por protocolo, usuário, setor e período
- Preservação de dados mesmo após exclusão de usuários

### 5. Sistema de Logs Avançado
- Logs categorizados por tipo de operação
- Diferentes níveis de severidade
- Detalhes em JSON para flexibilidade
- Monitoramento em tempo real

### 6. Integração com Telegram
- Notificações automáticas de mudanças
- Configuração via variáveis de ambiente
- Formatação rica das mensagens
- Log de tentativas de envio

## Configurações de Ambiente

### Variáveis do Banco de Dados
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=kanban_solicitacoes
```

### Variáveis do Telegram
```env
VITE_TELEGRAM_BOT_TOKEN=seu_bot_token
VITE_TELEGRAM_CHAT_ID=seu_chat_id
```

### Outras Configurações
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=sua_chave_secreta_muito_forte
```

## Considerações de Segurança

1. **Senhas**: Devem ser criptografadas usando bcrypt ou similar
2. **Validação**: Implementar validação de dados no nível da aplicação
3. **Permissões**: Configurar permissões adequadas no banco de dados
4. **Backup**: Implementar rotina de backup regular
5. **Auditoria**: Sistema completo de auditoria implementado
6. **Logs**: Monitoramento detalhado de todas as operações
7. **Acesso**: Controle granular por setor e tipo de usuário

## Scripts de Migração

Para implementar esta estrutura, execute os scripts SQL na seguinte ordem:
1. Criar tabelas `setores`, `categorias`, `usuarios`
2. Criar tabela `contador_protocolo`
3. Criar tabela `solicitacoes` (depende das anteriores)
4. Criar tabelas `logs_auditoria` e `logs_sistema`
5. Criar índices
6. Inserir dados iniciais

## Manutenção

- **Limpeza**: Considerar arquivamento de logs antigos (> 1 ano)
- **Otimização**: Monitorar performance das consultas
- **Integridade**: Verificar periodicamente a integridade referencial
- **Backup**: Backup diário dos dados de auditoria
- **Monitoramento**: Alertas para logs de erro críticos

## Migração do LocalStorage

O sistema atual utiliza localStorage para desenvolvimento. Para migração:

1. **Exportar dados**: Usar funcionalidades de exportação implementadas
2. **Converter formato**: Adaptar estrutura para SQL
3. **Importar dados**: Executar scripts de importação
4. **Validar integridade**: Verificar consistência dos dados
5. **Atualizar configuração**: Alterar para conexão com MariaDB

## Performance e Escalabilidade

### Otimizações Recomendadas
- Particionamento da tabela `logs_sistema` por data
- Índices compostos para consultas frequentes
- Cache de consultas para dados estáticos
- Compressão de dados históricos

### Limites Sugeridos
- Logs do sistema: Manter últimos 6 meses online
- Auditoria: Manter histórico completo
- Solicitações: Arquivar concluídas após 2 anos
- Backup: Retenção de 7 anos para auditoria

Esta documentação reflete o estado atual do sistema com todas as funcionalidades implementadas e serve como guia para a migração para ambiente de produção com MariaDB.