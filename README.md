# Sistema Kanban - Gerenciamento de Solicitações

Um sistema web moderno para gerenciamento de solicitações usando metodologia Kanban, desenvolvido em React com TypeScript.

## 🚀 Funcionalidades

### Core Features
- **Sistema Kanban**: Interface drag & drop para gerenciar solicitações em diferentes status
- **Autenticação**: Sistema de login com dois níveis (Admin/User)
- **Criação sem Login**: Permite criar solicitações sem autenticação
- **Gerenciamento Admin**: Interface exclusiva para gerenciar categorias e setores
- **Formulários Dinâmicos**: Criação e edição de solicitações com validação
- **Primeira Senha**: Obriga troca de senha no primeiro login do admin
- **Persistência Local**: Dados salvos no localStorage (preparado para MariaDB)

### Interface
- **Design Responsivo**: Otimizado para desktop, tablet e mobile
- **Animações Suaves**: Micro-interações e transições elegantes
- **Cores Organizadas**: Sistema de cores consistente para categorias e status
- **Feedback Visual**: Indicadores de prioridade, datas e status claros

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Drag & Drop**: @hello-pangea/dnd
- **Roteamento**: React Router DOM
- **Ícones**: Lucide React
- **Datas**: date-fns com localização pt-BR
- **Build**: Vite

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos para executar localmente

1. **Clone o repositório**
```bash
git clone <repository-url>
cd sistema-kanban
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute em modo desenvolvimento**
```bash
npm run dev
```

4. **Acesse no navegador**
```
http://localhost:5173
```

### Credenciais Padrão
- **Usuário**: admin
- **Senha**: admin
- **Observação**: O sistema obrigará a troca da senha no primeiro login

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx
│   ├── Modal.tsx
│   ├── SolicitacaoCard.tsx
│   ├── KanbanColumn.tsx
│   └── FormularioSolicitacao.tsx
├── contexts/           # Contextos React
│   └── AuthContext.tsx
├── hooks/              # Custom hooks
│   ├── useSolicitacoes.ts
│   ├── useCategorias.ts
│   └── useSetores.ts
├── pages/              # Páginas principais
│   ├── Login.tsx
│   ├── PrimeiroLogin.tsx
│   ├── Dashboard.tsx
│   └── Admin.tsx
├── types/              # Definições TypeScript
│   └── index.ts
├── utils/              # Utilitários
│   └── storage.ts
├── data/               # Dados iniciais
│   └── initialData.ts
└── App.tsx             # Componente raiz
```

## 🎯 Como Usar

### Para Usuários Finais

1. **Criar Solicitação sem Login**:
   - Na tela de login, clique em "Criar Solicitação"
   - Preencha o formulário
   - A solicitação aparecerá na coluna "Solução sem Categorização"

2. **Login como Usuário**:
   - Use suas credenciais para acessar o dashboard
   - Visualize e edite solicitações
   - Mova solicitações entre colunas arrastando

### Para Administradores

1. **Primeiro Login**:
   - Use admin/admin
   - Altere a senha quando solicitado

2. **Gerenciar Categorias e Setores**:
   - Acesse "Administração" no dashboard
   - Adicione, edite ou remova categorias e setores
   - Defina cores para categorias

3. **Gerenciar Solicitações**:
   - Acesso completo ao Kanban
   - Criar, editar e mover solicitações
   - Definir prioridades e observações

## 🎨 Status das Solicitações

- **🔍 Solução sem Categorização**: Solicitações criadas sem login
- **⏳ Pendente**: Solicitações aguardando início
- **🔄 Em Andamento**: Solicitações sendo trabalhadas
- **✅ Concluída**: Solicitações finalizadas

## 🗄️ Preparação para Banco de Dados

O sistema está preparado para integração com MariaDB:

1. **Arquivo de Configuração**: `.env.example` com variáveis do banco
2. **Documentação**: `DATABASE_DOCUMENTATION.md` com estrutura completa
3. **Scripts SQL**: Estrutura de tabelas e relacionamentos
4. **Migração**: Hooks preparados para substituir localStorage

### Configuração do Banco (Produção)

1. Copie `.env.example` para `.env`
2. Configure as variáveis do MariaDB
3. Execute os scripts SQL da documentação
4. Implemente a integração substituindo o localStorage

## 🔒 Segurança

- Validação de formulários no frontend
- Controle de acesso baseado em roles
- Preparado para criptografia de senhas (bcrypt)
- Sanitização de dados de entrada

## 📱 Responsividade

- **Mobile**: Layout otimizado para telas pequenas
- **Tablet**: Interface adaptada para touch
- **Desktop**: Experiência completa com drag & drop

## 🎨 Personalização

### Cores do Sistema
- Primária: #2563EB (Azul)
- Sucesso: #059669 (Verde)
- Alerta: #F59E0B (Amarelo)
- Erro: #DC2626 (Vermelho)

### Adicionando Novas Categorias
1. Acesse a área administrativa
2. Clique em "Nova Categoria"
3. Escolha nome e cor
4. Confirme a criação

## 🚀 Deploy

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Consulte a documentação do banco de dados
- Verifique os logs no console do navegador

---

**Sistema Kanban** - Desenvolvido com ❤️ usando React + TypeScript