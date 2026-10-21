# G11 Conceito Financeiro — Plataforma Web Premium & CMS Administrável

Site institucional com interface visual luxuosa, identidade sob medida, navegação fluida e painel administrativo completo e persistente desenvolvido com **React 19 + TypeScript + Vite + Tailwind CSS + Node.js (Express) + SQLite**.

---

## 1. Endereços de Acesso Local

- **Site Público:** [http://localhost:5173](http://localhost:5173) (ou [http://localhost:5000](http://localhost:5000))
- **Painel Administrativo:** [http://localhost:5173/admin](http://localhost:5173/admin) (acessível exclusivamente digitando `/admin` no navegador)
- **Credenciais de Acesso:**
  - **Usuário:** `admin`
  - **Senha:** `g11admin2026`

---

## 2. Deploy no Vercel (100% Gratuito e Sem Banco de Dados)

O site foi completamente adaptado para hospedar no **Vercel**:
- Todo o conteúdo cadastrado e anexos do painel administrativo estão fixados diretamente no código-fonte (`client/src/data/initialSiteData.ts` e `client/public/uploads`).
- **Zero custo de banco de dados:** Não é necessário conectar nem pagar por nenhum serviço de banco de dados externo.
- **Acesso ao Admin Oculto:** O painel administrativo não possui botões ou links visíveis no site público; para acessá-lo, basta digitar `/admin` na URL do seu domínio (ex: `seusite.vercel.app/admin`).
- **Arquivos de configuração prontos:** Inclui `vercel.json` na raiz e no cliente configurados com URL rewrites para SPA.

### Como publicar no Vercel:
1. Suba o projeto para seu repositório no GitHub ou GitLab.
2. No painel do [Vercel](https://vercel.com), clique em **Add New Project** e selecione o repositório.
3. Se importar pela raiz do repositório, o Vercel detectará automaticamente o build através do `vercel.json`.
4. Se preferir definir o **Root Directory** como `client`, o comando de build será `npm run build` e o diretório de saída será `dist`.
5. Clique em **Deploy**. Seu site estará no ar instantaneamente!

---

## 2. Conteúdos Extraídos e Importados (100% Persistidos)

Todo o conteúdo original do site `g11conceitofinanceiro.com.br` foi extraído na resolução original e importado no banco de dados SQLite (`database/g11.sqlite`):

### A. Identidade Visual & Hero Section
- **Logotipo Oficial:** Posicionado exclusivamente no centro da Hero Section, respeitando proporções e com controle dinâmico de tamanho para desktop e mobile via painel administrativo.
- **Slideshow Imersivo da Hero:** Configurado com transições cinemáticas entre viagens e eventos reais (Capri/Itália, Japão, África do Sul, Grécia, Paris) com escurecimento de fundo ajustável.
- **Logotipos & Badges:** Ícones da G11, logo de cabeçalho/rodapé e grid de seguradoras parceiras (incluindo Omint).

### B. Galerias de Realizações & Viagens (8 Pastas com Fotos Originais)
1. 🇮🇹 **Capri / Itália** (8 fotos em alta resolução)
2. 🇿🇦 **África do Sul** (10 fotos em alta resolução)
3. 🇫🇷 **Paris / França** (9 fotos em alta resolução)
4. 🇬🇷 **Grécia** (9 fotos em alta resolução)
5. 🇯🇵 **Japão** (10 fotos em alta resolução)
6. 🏆 **Awards & Premiações** (3 fotos em alta resolução)
7. 🏨 **Convenção Novotel** (7 fotos em alta resolução)
8. ✨ **Experiências & Reconhecimento** (Capa exclusiva e álbum dinâmico)
- **Funcionalidades da Galeria:** Filtros por categoria ("Todas", "Viagens Internacionais", "Eventos & Premiações"), modal imersivo de álbum, lightbox em tela cheia com navegação anterior/próxima e download da foto original.

### C. Seções Institucionais & Produtos
- **Sobre a G11:** Data de fundação (10/08/2021), narrativa histórica, foto da equipe e fundadores, Missão, Visão e os 5 Valores institucionais (Excelência, Conexão, Inovação, Transparência, Desenvolvimento).
- **Produtos & Soluções:** Seguro de Vida, Seguro Viagem, Previdência Privada e Plano de Saúde com cards interativos e simulação direta no WhatsApp.
- **Benefícios Exclusivos:** Assistência 24h, Seguro Residencial, Seguro Odontológico, Auxílio-Funeral e Descontos Exclusivos.
- **Depoimentos Reais:** Avaliações de corretores e clientes (André S., Mariana R., Carlos M., Fernanda L.).
- **Central de Sinistros & FAQ:** Explicação de sinistro e etapas recomendadas com botão de emergência para o WhatsApp.
- **Localização & Contato:** Endereço físico completo em Perdizes (Av. Antártica 675, SP), horários, formulário de contato integrado e link com mensagem pré-formatada para o WhatsApp (`+55 11 99160-6951`).
- **Feed do Instagram:** Publicações oficiais integradas com suporte a script oficial de incorporação e links diretos para `@g11conceitofinanceiro`.

---

## 3. Arquitetura do Sistema

```
dama/
├── database/
│   └── g11.sqlite              # Banco de dados relacional SQLite persistente
├── uploads/                    # Armazenamento persistente de mídias locais
│   ├── branding/               # Logos oficiais e emblemas
│   ├── capas_eventos/          # Fotos de capa dos álbuns
│   ├── eventos_e_viagens/      # Pastas individuais de cada viagem
│   ├── institucional/          # Fotos de equipe e banners
│   └── produtos/               # Imagens dos cards de seguros
├── server/                     # Backend API (Node.js + Express)
│   ├── db.js                   # Inicialização do banco e schemas
│   ├── seed.js                 # Importador automático dos dados extraídos
│   ├── auth.js                 # Autenticação JWT e hash bcrypt
│   ├── routes/
│   │   ├── public.js           # Endpoint consolidado (/api/public/site-data)
│   │   ├── hero.js             # Gestão de slides e configurações da hero
│   │   ├── albums.js           # CRUD de álbuns e fotos da galeria
│   │   ├── instagram.js        # Gestão de embeds e posts do Instagram
│   │   ├── content.js          # Gestão de Sobre, Produtos, Benefícios e FAQ
│   │   ├── settings.js         # Configurações de contato e SEO
│   │   ├── media.js            # Biblioteca de mídia e upload com multer
│   │   └── stats.js            # Métricas do dashboard administrativo
│   └── index.js                # Servidor Express (porta 5000)
├── client/                     # Frontend (React 19 + TypeScript + Tailwind v4 + Vite)
│   ├── src/
│   │   ├── components/public/  # Componentes do site público (Hero, Navbar, etc.)
│   │   ├── pages/admin/        # Módulos do painel administrativo
│   │   ├── services/api.ts     # Cliente HTTP com interceptor JWT
│   │   └── types/index.ts      # Modelos de dados TypeScript
│   └── vite.config.ts          # Configuração Vite com proxy para API
└── README.md
```

---

## 4. Como Iniciar e Parar os Serviços

### Iniciar o Backend (API na porta 5000)
```powershell
node server/index.js
```

### Iniciar o Frontend (Vite na porta 5173)
```powershell
cd client
npm run dev
```

### Compilar para Produção
```powershell
cd client
npm run build
```
*Ao compilar para produção, o próprio servidor Express (`node server/index.js`) serve a aplicação estática e a API na porta 5000.*

---

## 5. Módulos do Painel Administrativo (`/admin`)

1. **Visão Geral & Métricas:** Indicadores em tempo real de álbuns, fotos, slides da hero e posts do Instagram.
2. **Hero Section & Logotipo:** Controle de largura do logo (desktop/mobile), substituição do arquivo de logo, ativação do slideshow, tempo de transição, efeito (fade/zoom/slide), escurecimento do overlay e reordenação dos slides.
3. **Pastas & Galerias:** Criação e edição de álbuns, alteração de foto de capa, upload de novas fotos, reordenação e exclusão.
4. **Publicações Instagram:** Cadastro de links de publicações oficiais, categorização e controle de ativação.
5. **Conteúdo & Produtos:** Edição dos textos da empresa (Missão, Visão, Valores), produtos de seguro, benefícios adicionais, depoimentos e FAQ de sinistros.
6. **Configurações & SEO:** Telefones, links de WhatsApp, horários de funcionamento, endereço, meta titles e descrições para motores de busca.
7. **Biblioteca de Mídia:** Visualização de todos os arquivos no servidor, upload em massa e botão de cópia de URL.
