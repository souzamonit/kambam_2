# Documentação do Banco de Dados - Sistema Kanban

## Visão Geral
Este documento descreve a estrutura do banco de dados MariaDB para o Sistema Kanban de Gerenciamento de Solicitações.

## Estrutura das Tabelas

### 1. Tabela: `usuarios`
Armazena informações dos usuários do sistema.

```sql
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'user') NOT NULL,
    primeiro_login BOOLEAN DEFAULT TRUE,
    nome VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único do usuário (UUID)
- `usuario`: Nome de usuário para login (único)
- `senha`: Senha criptografada do usuário
- `tipo`: Tipo de usuário (admin ou user)
- `primeiro_login`: Indica se é o primeiro login (para forçar troca de senha)
- `nome`: Nome completo do usuário
- `data_criacao`: Data de criação do registro
- `data_atualizacao`: Data da última atualização

### 2. Tabela: `categorias`
Armazena as categorias das solicitações.

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
Armazena os setores organizacionais.

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
Armazena as solicitações do sistema.

```sql
CREATE TABLE solicitacoes (
    id VARCHAR(36) PRIMARY KEY,
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
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE SET NULL,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

**Campos:**
- `id`: Identificador único da solicitação (UUID)
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

## Relacionamentos

### 1. `solicitacoes` → `categorias`
- **Tipo**: N:1 (muitas solicitações para uma categoria)
- **Chave estrangeira**: `categoria_id`
- **Ação**: ON DELETE SET NULL (se categoria for deletada, campo fica NULL)

### 2. `solicitacoes` → `setores`
- **Tipo**: N:1 (muitas solicitações para um setor)
- **Chave estrangeira**: `setor_id`
- **Ação**: ON DELETE SET NULL (se setor for deletado, campo fica NULL)

### 3. `solicitacoes` → `usuarios`
- **Tipo**: N:1 (muitas solicitações para um usuário)
- **Chave estrangeira**: `criado_por`
- **Ação**: ON DELETE SET NULL (se usuário for deletado, campo fica NULL)

## Índices Recomendados

```sql
-- Índices para melhorar performance de consultas
CREATE INDEX idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX idx_solicitacoes_categoria ON solicitacoes(categoria_id);
CREATE INDEX idx_solicitacoes_setor ON solicitacoes(setor_id);
CREATE INDEX idx_solicitacoes_data_solicitacao ON solicitacoes(data_solicitacao);
CREATE INDEX idx_solicitacoes_prioridade ON solicitacoes(prioridade);
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

## Considerações de Segurança

1. **Senhas**: Devem ser criptografadas usando bcrypt ou similar
2. **Validação**: Implementar validação de dados no nível da aplicação
3. **Permissões**: Configurar permissões adequadas no banco de dados
4. **Backup**: Implementar rotina de backup regular
5. **Auditoria**: Considerar tabela de auditoria para mudanças críticas

## Scripts de Migração

Para implementar esta estrutura, execute os scripts SQL na seguinte ordem:
1. Criar tabelas `usuarios`, `categorias`, `setores`
2. Criar tabela `solicitacoes` (depende das anteriores)
3. Criar índices
4. Inserir dados iniciais

## Manutenção

- **Limpeza**: Considerar arquivamento/exclusão de solicitações antigas
- **Otimização**: Monitorar performance das consultas
- **Integridade**: Verificar periodicamente a integridade referencial