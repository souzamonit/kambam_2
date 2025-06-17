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

#### Para Desenvolvimento Local (com servidor Node.js)
Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=kanban_user
DB_PASSWORD=sua_senha_forte
DB_NAME=kanban_solicitacoes

# Aplicação
NODE_ENV=development
PORT=3000

# JWT (se implementado)
JWT_SECRET=sua_chave_secreta_muito_forte

# Telegram (opcional)
VITE_TELEGRAM_BOT_TOKEN=seu_bot_token
VITE_TELEGRAM_CHAT_ID=seu_chat_id
```

#### Para Produção no Netlify
**IMPORTANTE**: O Netlify é um serviço de hospedagem estática. Ele não executa servidores Node.js nem usa variáveis como `PORT` ou `DB_*`.

No Netlify, configure apenas as variáveis com prefixo `VITE_` nas configurações do site:

```env
# Apenas estas variáveis funcionam no Netlify:
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

### 3. Deploy no Netlify

#### Opção A: Deploy Automático via Git
1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente no painel do Netlify
3. O deploy acontece automaticamente a cada push

#### Opção B: Deploy Manual
```bash
# Build da aplicação
npm run build

# Deploy manual
# Faça upload da pasta 'dist' para Netlify

# Ou use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Opção C: Deploy via Bolt (como feito)
O deploy já foi realizado automaticamente. Acesse:
- **URL do Site**: https://remarkable-hamster-304afa.netlify.app
- **Claim URL**: Para transferir para sua conta Netlify

## Configurações Específicas do Netlify

### 1. Arquivo netlify.toml (Opcional)
Crie na raiz do projeto para configurações avançadas:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Variáveis de Ambiente no Netlify
No painel do Netlify (Site settings > Environment variables):

```
VITE_TELEGRAM_BOT_TOKEN = seu_bot_token
VITE_TELEGRAM_CHAT_ID = seu_chat_id
```

**NOTA IMPORTANTE**: 
- ❌ `PORT` não é usado no Netlify (sempre 443/80)
- ❌ `DB_*` não funcionam no frontend (apenas backend)
- ✅ Apenas variáveis `VITE_*` são acessíveis no cliente

## Diferenças entre Ambientes

### Desenvolvimento Local
- Usa `npm run dev` (porta configurável via PORT)
- Pode usar servidor Node.js com banco de dados
- LocalStorage como fallback

### Produção no Netlify
- Site estático (sem servidor Node.js)
- Sempre HTTPS na porta 443
- Apenas LocalStorage disponível
- Variáveis `VITE_*` configuradas no painel

### Produção com Servidor Próprio
- Use PM2 ou similar
- Configure todas as variáveis de ambiente
- Banco de dados MariaDB
- Nginx como proxy reverso

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

## Configuração do Nginx (Para Servidor Próprio)

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

### 2. Monitoramento com PM2 (Servidor Próprio)

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs kanban-system

# Monitoramento web
pm2 web
```

## Checklist de Deploy

### Para Netlify (Atual)
- [x] Build da aplicação realizado
- [x] Deploy no Netlify concluído
- [x] Site acessível via HTTPS
- [x] LocalStorage funcionando
- [ ] Configurar variáveis VITE_* (se necessário)
- [ ] Configurar domínio customizado (opcional)

### Para Servidor Próprio (Futuro)
- [ ] Servidor MariaDB configurado
- [ ] Banco de dados criado
- [ ] Scripts SQL executados
- [ ] Dados migrados do LocalStorage
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação deployada com PM2
- [ ] SSL configurado
- [ ] Backup automático configurado
- [ ] Monitoramento ativo

## Troubleshooting

### Problemas Comuns no Netlify

1. **Site não carrega**
   - Verificar se o build foi bem-sucedido
   - Verificar se a pasta `dist` foi gerada
   - Verificar logs de deploy no painel Netlify

2. **Variáveis de ambiente não funcionam**
   - Certificar que têm prefixo `VITE_`
   - Configurar no painel do Netlify, não no arquivo `.env`
   - Fazer novo deploy após configurar

3. **Rotas não funcionam (404)**
   - Adicionar arquivo `_redirects` na pasta `public`:
     ```
     /*    /index.html   200
     ```

4. **Funcionalidades não funcionam**
   - Lembrar que é site estático (sem backend)
   - Apenas LocalStorage disponível
   - Sem acesso a banco de dados

### Problemas Comuns em Servidor Próprio

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
   - Verificar se porta está disponível
   - Verificar permissões de arquivo

4. **Dados não aparecem**
   - Verificar migração de dados
   - Verificar configuração do banco
   - Verificar logs de erro

## Resumo das Diferenças

| Aspecto | Netlify (Atual) | Servidor Próprio |
|---------|----------------|------------------|
| **Tipo** | Site estático | Aplicação full-stack |
| **Porta** | 443 (HTTPS) automático | Configurável via PORT |
| **Banco** | LocalStorage apenas | MariaDB + LocalStorage |
| **Variáveis** | Apenas VITE_* | Todas as variáveis |
| **Custo** | Gratuito (com limites) | Custo do servidor |
| **Manutenção** | Mínima | Requer administração |
| **Escalabilidade** | Automática | Manual |
| **Backup** | Não necessário | Necessário |

O sistema atual no Netlify está funcionando perfeitamente para um site estático com LocalStorage. A variável PORT não é relevante neste contexto.