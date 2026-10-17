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

> Identificadores e nomes de arquivos estão em **inglês**.
> Comentários, textos de interface e mensagens da API estão em **português (pt-BR)**.

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

### Perfis de acesso (RBAC)

No cadastro público é possível escolher o perfil pretendido:

- **Aluno (`STUDENT`)** entra ativo na hora e já pode fazer login.
- **Instrutor (`INSTRUCTOR`)** e **Administrador (`ADMIN`)** nascem como
  `PENDING` e **não conseguem logar até um ADMIN aprovar** o cadastro
  (`PATCH /api/users/:id/status`).

Um ADMIN também pode **criar contas diretamente** com qualquer perfil e uma
**senha base** (`POST /api/users`). Nesse caso a conta já nasce ativa, mas o
usuário é **obrigado a trocar a senha no primeiro acesso**: enquanto não trocar,
o backend responde **403** nas demais rotas e o frontend redireciona para a
tela `/change-password` (a troca acontece em `PUT /api/users/me`).

O perfil é lido do banco a cada requisição (não fica "congelado" no JWT), o que
permite revogar permissões imediatamente.

| Perfil | O que pode fazer |
| --- | --- |
| `ADMIN` | Gerencia tudo: categorias, instrutores, cursos, matrículas, contas e perfis de usuário. Aprova/recusa cadastros pendentes. É o **único** que enxerga o **CPF** dos instrutores. |
| `INSTRUCTOR` | Edita os **próprios** cursos e gerencia/aprova as matrículas das **suas** aulas. Não vê o CPF de outros instrutores. |
| `STUDENT` | Consulta o catálogo, **solicita matrícula** em um curso e vê apenas as próprias matrículas. Nunca vê CPF de instrutores. |

As checagens acontecem em duas camadas: um `requireRole(...)` no middleware
(checagem grosseira por perfil) e a validação de **propriedade** dentro dos
serviços (`ForbiddenError`), que é a fonte da verdade. Requisições sem permissão
retornam **403**.

**Situação da conta (`status`):** `PENDING` (aguardando aprovação), `ACTIVE`
(liberada para login) ou `REJECTED` (recusada). Um cadastro recusado pode ser
reaprovado depois.

**Solicitação de matrícula:** o aluno envia `POST /api/enrollments` com
`{ "courseId": "..." }` e a matrícula nasce como `PENDING`. O instrutor da aula
(ou um admin) aprova com `PUT /api/enrollments/:id` enviando
`{ "studentId": "...", "courseId": "...", "status": "ACTIVE" }`. O aluno pode
cancelar a própria solicitação enquanto ela ainda está pendente.

**Instrutor = perfil + conta de acesso (sincronizado nos dois sentidos):** o
cadastro acadêmico (`Instructor`) e a conta de login (`User`) são entidades
distintas, mas mantidas em sincronia:

- **Criar um instrutor** (`POST /api/instructors`) cria, na mesma transação, a
  conta `User` com perfil `INSTRUCTOR`, `ACTIVE` e troca de senha obrigatória no
  1º acesso (a senha base vem no corpo).
- **Uma conta ativa com perfil `INSTRUCTOR`** (criada em `/users/new`, promovida
  por `PATCH /api/users/:id/role`, ou aprovada após o cadastro público) **gera
  automaticamente** o cadastro de instrutor, com especialidade `A definir`
  (editável depois em `/instructors`). Contas criadas antes disso são
  reconciliadas na **inicialização da API**.
- **Editar** o instrutor mantém o **nome** em sincronia com a conta (e-mail/CPF
  do cadastro são apenas de contato e não mudam o login); **excluir** o instrutor
  remove a conta, e mudar a role/desativar remove o cadastro — ambos são
  **bloqueados** (`409`) se houver cursos vinculados.

Assim **não existe instrutor sem login** nem conta `INSTRUCTOR` sem cadastro de
instrutor. As contas de `INSTRUCTOR` podem surgir por: cadastro público aprovado
pelo ADMIN, troca de role, `POST /api/users`, ou `POST /api/instructors`.

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
│       ├── middlewares/      # ensureAuthenticated, requireRole + errorHandler
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
        ├── components/auth/  # Can e RoleGuard (controle de acesso na UI)
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

| E-mail                     | Senha            | Perfil       |
| -------------------------- | ---------------- | ------------ |
| `admin@devacademy.com`     | `DevAcademy@123` | `ADMIN`      |
| `instrutor@devacademy.com` | `DevAcademy@123` | `INSTRUCTOR` |
| `marina@devacademy.com`    | `DevAcademy@123` | `INSTRUCTOR` |
| `bruno@devacademy.com`     | `DevAcademy@123` | `STUDENT`    |
| `pedro@devacademy.com`     | `DevAcademy@123` | `INSTRUCTOR` (cadastro **pendente**) |

> As contas `instrutor@devacademy.com` (Carlos Mendes) e `marina@devacademy.com`
> estão vinculadas aos respectivos instrutores. A conta `pedro@devacademy.com`
> nasce **pendente** para demonstrar a aprovação de cadastro pelo ADMIN (o login
> só funciona depois de aprovado).

---

## Endpoints da API

| Método | Rota                     | Autenticação | Descrição                              |
| ------ | ------------------------ | ------------ | -------------------------------------- |
| POST   | `/api/auth/register`     | Pública      | Cadastro (escolhe perfil; privilegiados ficam pendentes) |
| POST   | `/api/auth/login`        | Pública      | Login → retorna JWT (bloqueado se pendente/recusado) |
| GET    | `/api/users`             | JWT (ADMIN/INSTRUCTOR) | Listagem paginada (filtros `role`/`status`, sem CPF) |
| POST   | `/api/users`             | JWT (ADMIN)  | Cria conta com senha base (troca no 1º acesso) |
| GET    | `/api/users/me`          | JWT          | Dados do usuário autenticado           |
| PUT    | `/api/users/me`          | JWT          | Edita o próprio usuário / troca a senha |
| PATCH  | `/api/users/:id/role`    | JWT (ADMIN)  | Troca o perfil de acesso               |
| PATCH  | `/api/users/:id/status`  | JWT (ADMIN)  | Aprova/recusa um cadastro pendente     |
| GET    | `/api/categories`        | JWT          | Lista paginada de categorias           |
| GET    | `/api/categories/:id`    | JWT          | Detalhe de uma categoria               |
| POST   | `/api/categories`        | JWT (ADMIN)  | Cria categoria                         |
| PUT    | `/api/categories/:id`    | JWT (ADMIN)  | Atualiza categoria                     |
| DELETE | `/api/categories/:id`    | JWT (ADMIN)  | Remove categoria                       |
| ...    | `/api/instructors`       | JWT (escrita: ADMIN) | CRUD completo de instrutores   |
| ...    | `/api/courses`           | JWT (criação: ADMIN; edição: ADMIN/INSTRUCTOR dono) | CRUD completo de cursos |
| ...    | `/api/enrollments`       | JWT (escrita: ADMIN/INSTRUCTOR; aluno solicita) | Matrículas + solicitação/aprovação |

> **RBAC em detalhe:** escritas de categorias e instrutores são exclusivas do
> **ADMIN**; cursos e matrículas aceitam **INSTRUCTOR**, mas apenas sobre os
> próprios recursos. Sem permissão, a API responde **403** (`ForbiddenError`).
> O aluno solicita a própria matrícula em `POST /api/enrollments` (criada como
> `PENDING`) e só pode cancelá-la enquanto pendente.

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

## Design "Academy modern"

A interface usa uma linguagem visual quente e acadêmica, centralizada em tokens
em `frontend/tailwind.config.ts`:

- **Paleta:** vinho (`primary`) para as ações, dourado (`accent`) para destaques
  e neutros quentes para superfícies e texto (o `gray` padrão foi substituído).
- **Tipografia:** serif de display nos títulos, sans no corpo e mono em valores,
  resolvidas por variáveis CSS (`--font-display`, `--font-sans`, `--font-mono`)
  em `globals.css` — sem download externo no momento do build.
- **Componentes:** `components/ui/*` (`Button`, `Table<T>`, `Badge`, ...) e o
  shell (`AppShell`, `Sidebar`, `Header`) seguem os mesmos tokens.
- **Acessibilidade:** foco visível consistente, contraste AA e respeito a
  `prefers-reduced-motion`.

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
- **Perfis de acesso (RBAC)** — `entities/UserRole.ts`, `middlewares/requireRole.ts`
  e a validação de propriedade dentro de `CourseService`/`EnrollmentService`
  (`ForbiddenError`). O CPF do instrutor só é retornado ao **ADMIN**.
- **Solicitação de matrícula** — o aluno cria a própria matrícula como `PENDING`
  (`EnrollmentService.create`) e o instrutor/admin aprova via `PUT`.
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
- **RBAC na interface** — `AuthContext` expõe `role`/`isAdmin`/`isInstructor`;
  `RoleGuard` protege as telas de escrita, o componente `Can` esconde ações e o
  menu lateral é filtrado por perfil. A tela `/users` permite ao **ADMIN** trocar
  o perfil de uma conta.
- **Solicitação de matrícula** — o aluno vê "Matricular-se" na lista de cursos e
  acompanha o status (Badge *Pendente*); instrutor/admin têm a ação **Aprovar**.
- **Design system** — ver [Design "Academy modern"](#design-academy-modern).
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
  cadastro, login, edição do próprio usuário e a troca de perfil pelo admin). O
  endpoint `GET /api/users` é somente-leitura e existe para **selecionar o aluno**
  ao cadastrar uma matrícula.
- Os perfis (`ADMIN`/`INSTRUCTOR`/`STUDENT`) são aplicados no back-end (fonte da
  verdade) e refletidos na interface; o aluno **solicita** matrícula e precisa de
  aprovação.
- O Nginx publica a porta **8080** no host (evita conflito com a porta 80 do
  Windows); internamente ele escuta na 80.
- Os arquivos `.env` não são versionados e o agente de IA é impedido, por
  guardrail, de lê-los ou escrevê-los.
