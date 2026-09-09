# PetJourney Mobile

Aplicativo mobile desenvolvido como parte da Sprint 3 do projeto acadêmico PetJourney na FIAP.

O PetJourney busca apoiar a organização da rotina de clínicas veterinárias. Nesta evolução, o projeto assume um modelo B2B: a clínica é a cliente da plataforma e utiliza o sistema para gerenciar seus usuários, responsáveis pelos animais e pacientes. O acesso é controlado por perfil, e a API mantém os dados operacionais separados por unidade clínica.

Este repositório contém apenas a aplicação cliente em React Native. A API Spring Boot está disponível no [repositório oficial do backend](https://github.com/LucasViana130/api-java-petjourney).

## Perfis e regras de acesso

O aplicativo reconhece quatro perfis:

- `ADMIN_SISTEMA`: administra a plataforma, gerencia as clínicas e cria administradores vinculados a cada clínica.
- `ADMIN_CLINICA`: gerencia a própria unidade e seus Veterinários, Tutores e Pets.
- `VETERINARIO`: cadastra Tutor e Pet em um único fluxo e consulta os pacientes da própria clínica, incluindo os dados do responsável.
- `TUTOR`: pode realizar o primeiro acesso, mas seu módulo interno ainda não faz parte da Sprint 3.

Não existe autocadastro público de usuários internos. Como a clínica é a cliente da plataforma, seus usuários são cadastrados por pessoas autorizadas, garantindo que o vínculo com a unidade seja definido antes da liberação do acesso. O ADMIN_SISTEMA, que representa a equipe responsável pelo PetJourney, cadastra a clínica e cria seu primeiro administrador. O ADMIN_CLINICA gerencia os usuários da própria unidade. Veterinários e Tutores cadastrados com e-mail recebem um código de primeiro acesso para ativar a própria conta e definir sua senha. Assim, o cadastro e a autorização do vínculo são realizados pela clínica, enquanto a ativação é feita pelo próprio usuário.

Após a autenticação, a navegação é escolhida de acordo com a role retornada pela API. Os dados de Clínicas são globais apenas para o `ADMIN_SISTEMA`; os demais cadastros e consultas respeitam o escopo da clínica no backend.

## Funcionalidades implementadas

### Autenticação e sessão

- Login integrado à API.
- Consulta do usuário autenticado para restaurar e validar a sessão.
- Persistência local do token com SecureStore.
- Inclusão automática do token Bearer nas requisições protegidas.
- Navegação protegida e separada por perfil.
- Logout com remoção do token, cancelamento das consultas em andamento e limpeza do cache da sessão.
- Primeiro acesso com e-mail, código temporário e definição de senha.
- Tratamento de erros de rede, validação, conflito, permissão e recurso não encontrado.

### Administração da plataforma

- CRUD completo de Clínicas: listagem, cadastro, edição e exclusão.
- Criação de administrador para uma clínica selecionada.
- Paginação da listagem de Clínicas com dados e limites retornados pela API.

### Administração da clínica

- CRUD completo de Veterinários.
- CRUD completo de Tutores.
- CRUD completo de Pets, com associação ao Tutor responsável.
- Paginação das listagens de Veterinários, Tutores e Pets.
- Paginação do seletor de Tutor no formulário de Pet, mantendo a seleção durante a navegação entre páginas.
- Atualização das listagens após operações de criação, edição e exclusão.

### Área do Veterinário

- Cadastro conjunto de Tutor e Pet em uma única operação.
- Consulta dos pacientes da própria clínica.
- Visualização dos detalhes do Pet e do Tutor responsável.

## Tecnologias

As versões abaixo correspondem ao `package.json` atual:

| Tecnologia | Versão | Uso no projeto |
| --- | --- | --- |
| Expo | `~54.0.36` | Ambiente de desenvolvimento e execução do aplicativo |
| React Native | `0.81.5` | Construção da interface nativa |
| React | `19.1.0` | Componentização e estado da interface |
| TypeScript | `~5.9.2` | Tipagem estática do código |
| React Navigation | `^7.3.18` | Container e organização da navegação |
| Native Stack | `^7.18.10` | Pilhas de telas por perfil |
| TanStack Query | `^5.102.8` | Consultas, mutations, cache e invalidação de dados da API |
| Axios | `^1.20.0` | Cliente HTTP e interceptor de autenticação |
| Expo SecureStore | `~15.0.8` | Armazenamento seguro do token de acesso |
| React Native Safe Area Context | `~5.6.0` | Respeito às áreas seguras dos dispositivos |
| React Native Screens | `~4.16.0` | Integração das telas com a navegação nativa |
| Expo Status Bar | `~3.0.9` | Configuração da barra de status |

O pacote `@react-navigation/bottom-tabs` também está instalado na versão `^7.18.18`, embora a navegação atual seja estruturada com Native Stack.

## Arquitetura

O código está organizado dentro de `src` por responsabilidade:

```text
src/
├── components/   # componentes visuais compartilhados
├── contexts/     # estado global de autenticação e sessão
├── hooks/        # queries e mutations de cada domínio
├── navigation/   # rotas públicas e pilhas por perfil
├── screens/      # telas agrupadas por área de acesso
├── services/     # chamadas HTTP e persistência do token
├── theme/        # tokens da identidade visual
├── types/        # contratos TypeScript do Mobile
└── utils/        # validações e interpretação de erros
```

O fluxo principal de acesso aos dados é:

```text
Tela → Hook → TanStack Query → Service → Axios → API Spring Boot
```

As telas cuidam da interação com o usuário. Os hooks coordenam consultas, mutations e invalidação de cache. Os services conhecem os endpoints, enquanto a instância central do Axios define a URL base e adiciona o token às requisições. Os tipos representam os payloads e respostas usados pelo Mobile.

## Como executar

### Pré-requisitos

- Node.js `20.19.x` ou superior compatível com o Expo SDK 54.
- npm.
- Expo Go em um dispositivo compatível ou um ambiente configurado para Android, iOS ou Web.
- Backend PetJourney em execução.
- PostgreSQL configurado e acessível pelo backend.

O Mobile não contém nem acessa diretamente o banco de dados. Toda persistência ocorre por meio da API Java.

### Instalação

Na raiz deste projeto, instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` local e configure a URL base da API:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

Escolha o endereço de acordo com o ambiente em que o aplicativo será executado:

- Emulador Android no mesmo computador da API: `http://10.0.2.2:8080`.
- Celular físico: use o IP local do computador que executa a API, por exemplo `http://192.168.0.10:8080`. O celular e o computador devem estar em uma rede que permita essa comunicação.
- Navegador no mesmo computador da API: `http://localhost:8080`.

O arquivo `.env` está ignorado pelo Git. Não publique senhas, tokens, chaves privadas ou outras credenciais nesse arquivo ou no repositório.

Com o backend e o PostgreSQL em funcionamento, inicie o Expo:

```bash
npm start
```

Também estão disponíveis os scripts:

```bash
npm run android
npm run ios
npm run web
```

Depois de alterar `EXPO_PUBLIC_API_URL`, encerre o processo anterior e, se o endereço antigo continuar em cache, reinicie com:

```bash
npx expo start -c
```

As instruções de configuração, banco de dados e chaves necessárias para iniciar a API estão no [README do backend](https://github.com/LucasViana130/api-java-petjourney#readme).

## Como testar os fluxos principais

O roteiro abaixo serve como guia de demonstração manual. Ele não representa uma afirmação de que todos os cenários foram executados em um ambiente específico.

1. Inicie o PostgreSQL, a API e o Mobile com `EXPO_PUBLIC_API_URL` apontando para o endereço correto.
2. Entre com uma conta de cada perfil preparada no ambiente de desenvolvimento e confirme o direcionamento para sua respectiva área.
3. Como `ADMIN_SISTEMA`, cadastre, edite e exclua uma Clínica; em seguida, crie um administrador para uma clínica selecionada e navegue pelas páginas da listagem.
4. Como `ADMIN_CLINICA`, execute cadastro, edição e exclusão de Veterinários, Tutores e Pets; valide também a paginação e a associação de um Pet ao Tutor responsável.
5. Cadastre um Veterinário ou Tutor com e-mail, obtenha o código pelo mecanismo configurado no backend de desenvolvimento e conclua o fluxo de primeiro acesso, definindo uma senha.
6. Como `VETERINARIO`, cadastre um Tutor junto com seu Pet e consulte a lista e os detalhes dos pacientes disponíveis para a clínica.
7. Use a ação de logout e confirme o retorno ao Login.

Credenciais de ambientes pessoais não devem ser incluídas neste documento.

## Limitações da Sprint 3

Nesta entrega, o módulo interno do `TUTOR` ainda não possui funcionalidades disponíveis. Agenda, prontuário, medicamentos e outros recursos não representados nas rotas e telas atuais do Mobile também estão fora do escopo da Sprint 3.

O aplicativo não implementa recuperação de senha, reenvio de código de primeiro acesso, busca, filtros ou ordenação nas listagens.

## Entrega e vídeo

### Integrantes

| Nome | RM |
| --- | --- |
| Lucas Gonçalves Viana | RM563254 |
| Deryk de Souza Queiroz | RM563412 |
| Vinicius Paschoeto da Silva | RM563089 |
| Felipe Wiclif Leal da Silva | RM563901 |

### Informações da entrega

- Link do vídeo no YouTube: **[inserir link]**
- Turma: **[inserir turma]**
- Disciplina: **[inserir disciplina]**
- Professor(a): **[inserir nome]**
- Data de entrega da Sprint 3: **12/09/2026**
- Outras informações exigidas pelo professor: **[inserir informações]**
