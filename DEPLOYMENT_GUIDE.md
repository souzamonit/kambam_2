# Guia de Deploy para Produção

## Configuração do Banco de Dados

### 1. Preparação do Servidor MariaDB

```bash
# Instalar MariaDB (Ubuntu/Debian)
sudo apt update
sudo apt install mariadb-server

# Configurar segurança
sudo mysql_secure_installation

# Acessar MariaDB
sudo mysql -u root -p
```

### 2. Criar Banco de Dados e Usuário

```sql
-- Criar banco de dados
CREATE DATABASE kanban_solicitacoes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário
CREATE USER 'kanban_user'@'localhost' IDENTIFIED BY 'sua_senha_forte';

-- Conceder permissões
GRANT ALL PRIVILEGES ON kanban_solicitacoes.* TO 'kanban_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Executar Scripts de Criação

Execute os scripts SQL na seguinte ordem (conforme documentação):

```sql
-- 1. Criar tabelas básicas
CREATE TABLE setores (...);
CREATE TABLE categorias (...);
CREATE TABLE usuarios (...);

-- 2. Criar tabela de controle
CREATE TABLE contador_protocolo (...);

-- 3. Criar tabela principal
CREATE TABLE solicitacoes (...);

-- 4. Criar tabelas de auditoria
CREATE TABLE logs_auditoria (...);
CREATE TABLE logs_sistema (...);

-- 5. Criar índices
CREATE INDEX idx_solicitacoes_status ON solicitacoes(status);
-- ... outros índices

-- 6. Inserir dados iniciais
INSERT INTO usuarios (...);
INSERT INTO categorias (...);
INSERT INTO setores (...);
INSERT INTO contador_protocolo (...);
```

## Configuração da Aplicação

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=kanban_user
DB_PASSWORD=sua_senha_forte
DB_NAME=kanban_solicitacoes

# Aplicação
NODE_ENV=production
PORT=3000

# JWT (se implementado)
JWT_SECRET=sua_chave_secreta_muito_forte_aqui

# Telegram (opcional)
VITE_TELEGRAM_BOT_TOKEN=seu_bot_token
VITE_TELEGRAM_CHAT_ID=seu_chat_id
```

### 2. Build da Aplicação

```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Testar build localmente
npm run preview
```

### 3. Deploy no Servidor

#### Opção A: Servidor Próprio com PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo ecosystem.config.js
module.exports = {
  apps: [{
    name: 'kanban-system',
    script: 'npm',
    args: 'run preview',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

# Iniciar aplicação
pm2 start ecosystem.config.js

# Configurar para iniciar automaticamente
pm2 startup
pm2 save
```

#### Opção B: Deploy no Netlify (Frontend Only)

```bash
# Build da aplicação
npm run build

# Deploy manual
# Faça upload da pasta 'dist' para Netlify

# Ou use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Opção C: Deploy no Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Migração de Dados

### 1. Exportar Dados do LocalStorage

No navegador, execute no console:

```javascript
// Exportar todos os dados
const exportData = {
  usuarios: JSON.parse(localStorage.getItem('kanban_usuarios') || '[]'),
  categorias: JSON.parse(localStorage.getItem('kanban_categorias') || '[]'),
  setores: JSON.parse(localStorage.getItem('kanban_setores') || '[]'),
  solicitacoes: JSON.parse(localStorage.getItem('kanban_solicitacoes') || '[]'),
  auditoria: JSON.parse(localStorage.getItem('kanban_auditoria') || '[]'),
  logs: JSON.parse(localStorage.getItem('kanban_logs') || '[]')
};

// Baixar como arquivo JSON
const dataStr = JSON.stringify(exportData, null, 2);
const dataBlob = new Blob([dataStr], {type: 'application/json'});
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'kanban_data_export.json';
link.click();
```

### 2. Converter e Importar para MariaDB

Crie um script de migração:

```javascript
// migration.js
const fs = require('fs');
const mysql = require('mysql2/promise');

async function migrate() {
  // Ler dados exportados
  const data = JSON.parse(fs.readFileSync('kanban_data_export.json', 'utf8'));
  
  // Conectar ao banco
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'kanban_user',
    password: 'sua_senha',
    database: 'kanban_solicitacoes'
  });

  try {
    // Migrar usuários
    for (const usuario of data.usuarios) {
      await connection.execute(
        'INSERT INTO usuarios (id, usuario, senha, tipo, primeiro_login, nome, setor_id, data_criacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [usuario.id, usuario.usuario, usuario.senha, usuario.tipo, usuario.primeiroLogin, usuario.nome, usuario.setorId, usuario.dataCriacao]
      );
    }

    // Migrar categorias
    for (const categoria of data.categorias) {
      await connection.execute(
        'INSERT INTO categorias (id, nome, cor, data_criacao) VALUES (?, ?, ?, ?)',
        [categoria.id, categoria.nome, categoria.cor, categoria.dataCriacao]
      );
    }

    // Migrar setores
    for (const setor of data.setores) {
      await connection.execute(
        'INSERT INTO setores (id, nome, data_criacao) VALUES (?, ?, ?)',
        [setor.id, setor.nome, setor.dataCriacao]
      );
    }

    // Migrar solicitações
    for (const solicitacao of data.solicitacoes) {
      await connection.execute(
        'INSERT INTO solicitacoes (id, protocolo, titulo, descricao, categoria_id, setor_id, status, data_solicitacao, data_atualizacao, criado_por, prioridade, observacoes, prazo_vencimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          solicitacao.id, solicitacao.protocolo, solicitacao.titulo, solicitacao.descricao,
          solicitacao.categoriaId, solicitacao.setorId, solicitacao.status,
          solicitacao.dataSolicitacao, solicitacao.dataAtualizacao, solicitacao.criadoPor,
          solicitacao.prioridade, solicitacao.observacoes, solicitacao.prazoVencimento
        ]
      );
    }

    // Migrar logs de auditoria
    for (const log of data.auditoria) {
      await connection.execute(
        'INSERT INTO logs_auditoria (id, solicitacao_id, protocolo, usuario_id, nome_usuario, acao, campo_alterado, valor_anterior, valor_novo, data_hora, detalhes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          log.id, log.solicitacaoId, log.protocolo, log.usuarioId, log.nomeUsuario,
          log.acao, log.campoAlterado, log.valorAnterior, log.valorNovo, log.dataHora, log.detalhes
        ]
      );
    }

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro na migração:', error);
  } finally {
    await connection.end();
  }
}

migrate();
```

## Configuração do Nginx (Opcional)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoramento e Backup

### 1. Backup Automático do Banco

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u kanban_user -p kanban_solicitacoes > /backups/kanban_$DATE.sql
find /backups -name "kanban_*.sql" -mtime +7 -delete
```

### 2. Monitoramento com PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs kanban-system

# Monitoramento web
pm2 web
```

## Checklist de Deploy

- [ ] Servidor MariaDB configurado
- [ ] Banco de dados criado
- [ ] Scripts SQL executados
- [ ] Dados migrados do LocalStorage
- [ ] Variáveis de ambiente configuradas
- [ ] Build da aplicação realizado
- [ ] Aplicação deployada
- [ ] SSL configurado (se aplicável)
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Testes de funcionalidade realizados

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar credenciais no .env
   - Verificar se MariaDB está rodando
   - Verificar firewall

2. **Build falha**
   - Verificar versão do Node.js
   - Limpar cache: `npm cache clean --force`
   - Reinstalar dependências: `rm -rf node_modules && npm install`

3. **Aplicação não carrega**
   - Verificar logs: `pm2 logs`
   - Verificar porta disponível
   - Verificar permissões de arquivo

4. **Dados não aparecem**
   - Verificar migração de dados
   - Verificar configuração do banco
   - Verificar logs de erro