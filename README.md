# DevAcademy

Sistema de gestão para uma escola de tecnologia — projeto acadêmico full-stack
(API REST + painel web) com autenticação, CRUDs completos, componentização e
infraestrutura em Docker.

---

## Persona / Cliente

**Carla Menezes** é diretora da **DevAcademy**, uma escola de tecnologia que
oferece cursos presenciais e online para iniciantes e para pessoas em transição
de carreira. Hoje ela controla o catálogo de cursos, os instrutores e as
matrículas em planilhas, o que gera retrabalho e erros.

A proposta deste projeto é **um painel administrativo web, com acesso restrito
por login**, onde a equipe da escola gerencia:

- **Categorias** de cursos (ex.: Front-end, Back-end, Dados e IA)
- **Instrutores**
- **Cursos** (relacionados a uma categoria e a um instrutor)
- **Matrículas** (relacionam um aluno a um curso)

Cada usuário da equipe também pode **editar o próprio cadastro**.

---

## Stack

| Camada     | Tecnologias                                                             |
| ---------- | ----------------------------------------------------------------------- |
| Back-end   | Node.js 22, **Express**, **TypeScript**, **TypeORM**, MySQL 8, JWT, bcrypt |
| Front-end  | **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind CSS** |
| Infraestrutura | **Docker**, **Docker Compose**, **Nginx** (proxy reverso)            |

> Identificadores, nomes de arquivos e comentários estão em **inglês**.
> Textos de interface e mensagens da API estão em **português (pt-BR)**.

---

## Arquitetura

```
Navegador ──:8080──► Nginx (ÚNICO serviço exposto)
                       ├── /        ──► frontend  (Next.js :3000)
                       └── /api/*   ──► backend   (Express :3000)
                                            └──► MySQL :3306 (volume persistente)

      database, backend e frontend vivem apenas na rede interna devacademy_network
```

Fluxo de autenticação: o front-end envia `POST /api/auth/login`, guarda o JWT no
`localStorage` e o envia em `Authorization: Bearer <token>`. Todas as rotas de
recursos passam pelo middleware `ensureAuthenticated`.

---

## Estrutura de pastas

```
.
├── AGENTS.md                 # Instruções persistentes para agentes de IA
├── opencode.jsonc            # Guardrails (permissões) do agente
├── docker-compose.yml        # Orquestração dos 4 serviços (dev)
├── docker-compose.prod.yml   # Orquestração para deploy em cloud (VM)
├── .env.example              # Variáveis de ambiente do compose (dev)
├── env.production.example    # Template de variáveis para produção
├── nginx/
│   └── nginx.conf            # Proxy reverso
├── .opencode/skills/         # 3 skills específicas dos agentes
│   ├── backend-crud/
│   ├── frontend-page/
│   └── review-requirements/
│
├── backend/
│   └── src/
│       ├── entities/         # Pessoa (abstract) → User, Instructor / Category, Course, Enrollment
│       ├── errors/           # AppError (abstract) → NotFound, Validation, Conflict, ...
│       ├── interfaces/       # PaginatedResult<T>, TokenProvider, PasswordHasher
│       ├── repositories/     # BaseRepository<T> + repositórios específicos
│       ├── services/         # Regras de negócio
│       ├── controllers/      # Camada HTTP
│       ├── routes/           # Rotas /api/*
│       ├── middlewares/      # ensureAuthenticated + errorHandler
│       ├── validators/       # CPF, e-mail e força de senha
│       ├── security/         # BcryptPasswordHasher, JwtTokenProvider
│       ├── dtos/             # Inputs e mappers de resposta
│       ├── database/         # DataSource + seed
│       ├── docs/             # Documento OpenAPI + página do Scalar
│       └── config/           # Leitura tipada das variáveis de ambiente
│
└── frontend/
    └── src/
        ├── app/              # Rotas (App Router): login, register, (protected)/...
        ├── components/ui/    # Componentes genéricos (Button, Input, Table<T>, ...)
        ├── components/layout/# AppShell, Sidebar, Header, AuthGuard
        ├── contexts/         # AuthContext (usuário global) e ToastContext
        ├── services/         # Cliente HTTP + services por recurso
        ├── types/            # Tipos de domínio + PaginatedResponse<T>
        └── utils/            # Validadores (CPF, e-mail, senha) e formatadores
```

---

## Como executar

### Com Docker (recomendado)

Pré-requisito: **Docker Desktop** instalado e em execução.

```bash
# 1) crie os arquivos de ambiente a partir dos exemplos
copy .env.example .env          # Windows
# cp .env.example .env          # Linux/macOS

# 2) suba toda a stack
docker compose up --build

# 3) popule o banco com dados de demonstração (em outro terminal)
docker compose exec backend node dist/database/seed.js
```

Acesse **http://localhost:8080**.

### Localmente (sem Docker)

Back-end (porta 3000):

```bash
cd backend
copy .env.example .env
npm install
npm run seed     # cria as tabelas e os dados de demonstração
npm run dev
```

Front-end (porta 3001):

```bash
cd frontend
npm install
npm run dev
```

Crie `frontend/.env.local` com:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Deploy em cloud (VM/VPS)

Para publicar em uma VM (AWS EC2, DigitalOcean, Azure/GCP, etc.) use o compose de
produção `docker-compose.prod.yml`. Ele exige os segredos, reinicia os serviços
automaticamente (`restart: always`), tem *healthchecks* e publica **apenas o
Nginx** na porta escolhida.

```bash
# 1) na VM, com Docker + Docker Compose instalados
git clone <url-do-seu-repositorio> && cd <pasta-do-projeto>

# 2) crie o .env a partir do template e ajuste as senhas/segredo
cp env.production.example .env

# 3) suba a stack (constrói as imagens na própria VM)
docker compose -f docker-compose.prod.yml up -d --build

# 4) popule os dados de demonstração
docker compose -f docker-compose.prod.yml exec backend node dist/database/seed.js
```

- Libere a porta no firewall/security group (ex.: `80` e, com TLS, `443`).
- A aplicação fica em `http://<ip-ou-dominio>` e a documentação em
  `http://<ip-ou-dominio>/api/docs`.
- **HTTPS:** coloque um balanceador/Cloudflare na frente, ou use Certbot com um
  Nginx escutando na `443`. O Nginx do projeto já encaminha `/api/` para o backend
  e `/` para o frontend.
- Os serviços têm nomes fixos de imagem (`devacademy-backend:latest`,
  `devacademy-frontend:latest`), então dá para publicá-las em um registry com
  `docker compose -f docker-compose.prod.yml build` + `docker push`.
- **Importante:** gere um `JWT_SECRET` forte (`openssl rand -hex 32`) e troque as
  senhas padrão do MySQL antes de expor na internet.

### Credenciais de demonstração

| E-mail                   | Senha            |
| ------------------------ | ---------------- |
| `admin@devacademy.com`   | `DevAcademy@123` |
| `bruno@devacademy.com`   | `DevAcademy@123` |

---

## Endpoints da API

| Método | Rota                     | Autenticação | Descrição                              |
| ------ | ------------------------ | ------------ | -------------------------------------- |
| POST   | `/api/auth/register`     | Pública      | Cadastro de usuário                    |
| POST   | `/api/auth/login`        | Pública      | Login → retorna JWT                    |
| GET    | `/api/users`             | JWT          | Listagem paginada (apenas leitura)     |
| GET    | `/api/users/me`          | JWT          | Dados do usuário autenticado           |
| PUT    | `/api/users/me`          | JWT          | Edita o próprio usuário                |
| GET    | `/api/categories`        | JWT          | Lista paginada de categorias           |
| GET    | `/api/categories/:id`    | JWT          | Detalhe de uma categoria               |
| POST   | `/api/categories`        | JWT          | Cria categoria                         |
| PUT    | `/api/categories/:id`    | JWT          | Atualiza categoria                     |
| DELETE | `/api/categories/:id`    | JWT          | Remove categoria                       |
| ...    | `/api/instructors`       | JWT          | CRUD completo de instrutores           |
| ...    | `/api/courses`           | JWT          | CRUD completo de cursos                |
| ...    | `/api/enrollments`       | JWT          | CRUD completo de matrículas            |

Respostas:

```jsonc
// listagem paginada
{ "data": [ /* ... */ ], "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }

// erros
{ "statusCode": 404, "error": "NotFoundError", "message": "Curso não encontrado" }
```

---

## Documentação interativa da API (Scalar)

A API é descrita por um documento **OpenAPI 3.1** e renderizada pelo
**[Scalar](https://scalar.com)**:

| O quê | Rota |
| ----- | ---- |
| Referência interativa (Scalar) | `GET /api/docs` |
| Documento OpenAPI (JSON) | `GET /api/docs/openapi.json` |

Acesse com a aplicação no ar:

- Local/Docker: <http://localhost:8080/api/docs>
- Cloud: `https://<seu-dominio>/api/docs`

No Scalar você pode autenticar (botão **Authorize**, colando o token JWT devolvido
pelo login) e testar todos os endpoints direto pelo navegador. O documento é
mantido em `backend/src/docs/openapi.ts`, é servido pelo próprio backend e não
adiciona dependência de runtime (o Scalar é carregado via CDN oficial).

---

## Configuração de agentes de IA

O projeto foi desenvolvido com apoio de agentes (OpenCode) e inclui a
configuração exigida:

1. **`AGENTS.md`** — instruções persistentes: comandos, convenções de camadas,
   regras de segurança e verificação obrigatória antes de concluir.
2. **3 skills** em `.opencode/skills/`:
   - `backend-crud` — receita para criar um CRUD completo no back-end
   - `frontend-page` — receita para criar telas (listagem/cadastro/edição)
   - `review-requirements` — auditoria do projeto contra os requisitos
3. **Guardrails** em `opencode.jsonc` (regras de permissão):
   - **Proteção de arquivos sensíveis:** leitura e escrita de `*.env` e `*.env.*`
     são **negadas** (`deny`), enquanto `*.env.example` continua liberado.
   - **Limites de shell:** `git push`, remoção de volumes e leitura de `.env`
     são bloqueados.
   - **Fora do projeto:** exige aprovação (`external_directory: ask`).
   - Um subagente `reviewer` somente-leitura (não pode editar arquivos).

Para demonstrar a proteção, basta pedir ao agente: _"leia o arquivo .env"_ — a
operação é bloqueada pelos guardrails.

---

## Aderência aos requisitos

### Back-end com IA Generativa

- **Autenticação** — `backend/src/services/AuthService.ts`,
  `middlewares/ensureAuthenticated.ts`, `security/JwtTokenProvider.ts`.
  Senha criptografada com bcrypt, e-mail validado por regex, login apenas de
  usuário existente e retorno de JWT.
- **Cadastro de Usuário** — `User.assertStrongPassword`, validadores de CPF
  (`validators/cpfValidator.ts`), nível de senha (`validators/passwordValidator.ts`),
  e-mail e unicidade de CPF/e-mail.
- **Edição de Usuário** — `services/UserService.ts`: rota autenticada,
  somente o próprio usuário, todos os campos obrigatórios, e-mail imutável.
- **CRUDs completos** — Categorias, Instrutores, Cursos e Matrículas, todos com
  rotas autenticadas, paginação, 404 em edição/remoção de inexistentes e
  relacionamentos (Curso→Categoria, Curso→Instrutor, Matrícula→Usuário/Curso).
- **Configuração de Agentes** — seção acima.

### Front-end

- **Autenticação** — `app/login/page.tsx`: validação de e-mail, token no
  `localStorage`, tratamento amigável de erros e redirecionamento para a área
  logada.
- **Cadastro** — `app/register/page.tsx`: campos obrigatórios, verificação dupla
  de senha, validação de CPF/e-mail e redirecionamento para o login.
- **Edição de Usuário** — `app/(protected)/profile/page.tsx`: `AuthContext`
  expõe o usuário globalmente, valida CPF/nível de senha, confirma a senha e não
  permite alterar o e-mail.
- **CRUDs completos** — para cada recurso há **três telas separadas**
  (listagem paginada, cadastro `/new` e edição `/[id]/edit`).
- **Componentização** — componentes genéricos e reutilizáveis em
  `components/ui/` (incluindo `Table<T>` genérico), páginas compostas por vários
  componentes e componentes exclusivos de página em `_components/`.

### Ferramentas DevOps

- `docker-compose.yml` comentado e indentado, com variáveis de ambiente, volume
  nomeado (`mysql_data`) e rede dedicada (`devacademy_network`).
- Backend conecta ao MySQL, o front-end consome a API e o **Nginx** atua como
  proxy reverso.
- **Persistência:** o volume `mysql_data` mantém os dados entre reinícios.
- **Isolamento:** apenas o serviço `nginx` publica porta (`8080:80`); banco,
  back-end e front-end não expõem portas ao host.

### Tech Forge (TypeScript / POO)

| Critério                  | Onde é atendido                                                                 |
| ------------------------- | -------------------------------------------------------------------------------- |
| **Encapsulamento**        | Campos `private` em todas as entidades (`entities/`), com construtores limpos    |
| **Acesso controlado**     | Getters de leitura e setters **apenas onde há regra** (CPF, e-mail, senha, preço); a senha nunca é exposta |
| **Modelagem / POO**       | `abstract class BaseEntity` e `abstract class Person` com herança real; polimorfismo via `describe()` e hierarquia de `AppError` |
| **Tipagem avançada**      | Interfaces, type aliases e generics (`BaseRepository<T>`, `PaginatedResult<T>`, `Table<T>`); `strict: true` e nenhum `any` |
| **SOLID**                 | Serviços com responsabilidade única, repositórios extensíveis, inversão de dependência (`TokenProvider`, `PasswordHasher`) |
| **Exceções/organização**  | Hierarquia de exceções customizadas + middleware global; pastas entities/services/repositories |

### Evolução do projeto

- **Conexão com a persona/cliente:** ver seção [Persona / Cliente](#persona--cliente).
- **Uso de TypeScript sem JavaScript:** todo o código-fonte (back e front) é
  `.ts`/`.tsx` com `strict: true`.

---

## Observações

- O CRUD de **usuários** não é completo por exigência do trabalho (apenas
  cadastro, login e edição do próprio usuário). O endpoint `GET /api/users` é
  somente-leitura e existe para **selecionar o aluno** ao cadastrar uma matrícula.
- O Nginx publica a porta **8080** no host (evita conflito com a porta 80 do
  Windows); internamente ele escuta na 80.
- Os arquivos `.env` não são versionados e o agente de IA é impedido, por
  guardrail, de lê-los ou escrevê-los.
