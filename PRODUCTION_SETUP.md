# Guia de Configuração para Produção Local

## 🚀 Deploy em Produção Local

Este guia explica como configurar o sistema para rodar em produção no seu próprio servidor, respeitando a variável PORT do arquivo .env.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PM2 (opcional, mas recomendado)
- Git (para versionamento)

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```bash
# Instalar dependências do projeto
npm install

# Instalar PM2 globalmente (recomendado)
npm install -g pm2
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

Configure as variáveis no arquivo `.env`:

```env
# Configuração da aplicação
NODE_ENV=production
PORT=3000

# Telegram (opcional)
VITE_TELEGRAM_BOT_TOKEN=seu_bot_token
VITE_TELEGRAM_CHAT_ID=seu_chat_id

# Banco de dados (para futuro uso)
DB_HOST=localhost
DB_PORT=3306
DB_USER=kanban_user
DB_PASSWORD=sua_senha_forte
DB_NAME=kanban_solicitacoes
```

## 🏗️ Build e Deploy

### Opção 1: Deploy Simples com Vite Preview

```bash
# 1. Fazer build da aplicação
npm run build

# 2. Iniciar servidor de produção
npm run preview
```

O servidor irá rodar na porta configurada na variável `PORT` (padrão: 3000).

### Opção 2: Deploy com Express Server (Recomendado)

```bash
# 1. Fazer build da aplicação
npm run build

# 2. Iniciar servidor Express
npm run start
```

### Opção 3: Deploy com PM2 (Produção)

```bash
# 1. Fazer build da aplicação
npm run build

# 2. Iniciar com PM2
npm run pm2:start

# 3. Verificar status
npm run pm2:status

# 4. Ver logs
npm run pm2:logs
```

## 🔍 Comandos Úteis

### Gerenciamento com PM2

```bash
# Iniciar aplicação
npm run pm2:start

# Parar aplicação
npm run pm2:stop

# Reiniciar aplicação
npm run pm2:restart

# Ver logs em tempo real
npm run pm2:logs

# Ver status
npm run pm2:status

# Configurar para iniciar automaticamente no boot
pm2 startup
pm2 save
```

### Build e Teste

```bash
# Build para produção
npm run build

# Testar build localmente
npm run preview

# Executar em modo desenvolvimento
npm run dev

# Verificar código
npm run lint
```

## 🌐 Configuração de Rede

### Acesso Local
- **URL**: http://localhost:3000 (ou porta configurada)
- **Interface**: Todas as interfaces (0.0.0.0)

### Acesso Externo
Para permitir acesso de outras máquinas na rede:

1. **Firewall**: Libere a porta configurada
2. **IP**: Use o IP da máquina na rede
3. **URL**: http://SEU_IP:3000

### Exemplo com IP específico:
```bash
# Descobrir IP da máquina
ip addr show

# Acessar de outra máquina
http://192.168.1.100:3000
```

## 🔒 Configuração de Segurança

### 1. Firewall (Ubuntu/Debian)

```bash
# Permitir porta específica
sudo ufw allow 3000

# Verificar status
sudo ufw status
```

### 2. Nginx como Proxy Reverso (Opcional)

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

### 3. SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com
```

## 📊 Monitoramento

### Logs da Aplicação

```bash
# Logs do PM2
pm2 logs kanban-system

# Logs em tempo real
pm2 logs kanban-system --lines 100 -f

# Logs do sistema
journalctl -u pm2-root -f
```

### Monitoramento de Recursos

```bash
# Status do PM2
pm2 monit

# Uso de recursos
htop

# Espaço em disco
df -h
```

## 🔄 Atualizações

### Deploy de Nova Versão

```bash
# 1. Parar aplicação
npm run pm2:stop

# 2. Atualizar código
git pull origin main

# 3. Instalar dependências (se houver)
npm install

# 4. Fazer novo build
npm run build

# 5. Reiniciar aplicação
npm run pm2:start
```

### Script de Deploy Automatizado

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando deploy..."

# Parar aplicação
npm run pm2:stop

# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Build da aplicação
npm run build

# Reiniciar aplicação
npm run pm2:start

echo "✅ Deploy concluído!"
echo "🌐 Aplicação disponível em http://localhost:$PORT"
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Porta em uso**
   ```bash
   # Verificar o que está usando a porta
   sudo lsof -i :3000
   
   # Matar processo
   sudo kill -9 PID
   ```

2. **Permissões**
   ```bash
   # Dar permissões corretas
   chmod +x deploy.sh
   chown -R $USER:$USER .
   ```

3. **Variáveis de ambiente não carregam**
   ```bash
   # Verificar se o arquivo .env existe
   ls -la .env
   
   # Verificar conteúdo
   cat .env
   ```

4. **Build falha**
   ```bash
   # Limpar cache
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

## 📈 Performance

### Otimizações

1. **Compressão Gzip** (com Nginx)
2. **Cache de assets estáticos**
3. **Minificação automática** (já configurada)
4. **Lazy loading** de componentes

### Monitoramento de Performance

```bash
# Uso de CPU e memória
pm2 monit

# Análise de bundle
npm run build -- --analyze
```

## ✅ Checklist de Deploy

- [ ] Node.js 18+ instalado
- [ ] PM2 instalado globalmente
- [ ] Arquivo `.env` configurado
- [ ] Build da aplicação realizado
- [ ] Firewall configurado
- [ ] Aplicação iniciada com PM2
- [ ] Logs verificados
- [ ] Acesso testado
- [ ] Backup configurado (opcional)
- [ ] Monitoramento ativo

## 🎯 Resultado Final

Após seguir este guia, você terá:

- ✅ Sistema rodando em produção local
- ✅ Porta configurável via variável PORT
- ✅ Gerenciamento com PM2
- ✅ Logs centralizados
- ✅ Reinicialização automática
- ✅ Acesso de qualquer máquina na rede
- ✅ Configuração de segurança básica

**URL de Acesso**: http://localhost:3000 (ou porta configurada)