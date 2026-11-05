# PetJourney Mobile

Aplicativo mobile desenvolvido para o projeto acadêmico **PetJourney**, do curso de Análise e Desenvolvimento de Sistemas da FIAP.

O PetJourney é uma solução voltada para clínicas veterinárias, com diferentes perfis de acesso para administração, equipe veterinária e tutores. Nesta Sprint 4, o aplicativo consolida os principais fluxos desenvolvidos ao longo do semestre, incluindo autenticação, gestão de usuários, pacientes, agenda, atendimentos, notificações e SmartCare.

Este repositório contém apenas a aplicação Mobile em React Native.

Backend:
https://github.com/LucasViana130/api-java-petjourney

API utilizada pela aplicação:
https://petjourney-api.onrender.com

## Funcionalidades

- Login e autenticação com JWT.
- Primeiro acesso com código temporário e definição de senha.
- Navegação separada por perfil.
- Gestão de clínicas.
- Gestão de Veterinários, Tutores e Pets.
- Consulta de pacientes.
- Cadastro conjunto de Tutor e Pet.
- Controle de disponibilidade do Veterinário.
- Agendamento e cancelamento de consultas.
- Registro de atendimento.
- Consulta de registros clínicos e medicamentos.
- SmartCare para apoio à decisão.
- Notificações relacionadas aos agendamentos.
- Tema claro, escuro e sistema.
- Tela Sobre o App com hash do commit de referência.

## Perfis

### ADMIN_SISTEMA

Responsável pela administração geral da plataforma.

Principais funções:

- cadastrar, editar e excluir clínicas;
- criar o administrador responsável por cada clínica;
- visualizar as clínicas cadastradas.

### ADMIN_CLINICA

Responsável pela operação da própria clínica.

Principais funções:

- gerenciar pacientes;
- gerenciar Tutores;
- gerenciar Veterinários;
- gerenciar Pets;
- acessar dados da clínica;
- consultar o SmartCare.

Navegação principal:

```text
Home
Pacientes
Equipe
Perfil
```

### VETERINARIO

Responsável pelos atendimentos da clínica.

Principais funções:

- consultar pacientes;
- visualizar dados do Pet e do Tutor;
- cadastrar Tutor e Pet;
- configurar disponibilidade;
- consultar agenda;
- registrar atendimento;
- registrar medicamentos;
- consultar histórico do paciente;
- utilizar o SmartCare.

### TUTOR

Responsável pelo acompanhamento dos próprios Pets.

Principais funções:

- visualizar Pets vinculados;
- consultar detalhes do Pet;
- consultar horários disponíveis;
- agendar consultas;
- visualizar agenda;
- cancelar consultas dentro das regras permitidas;
- consultar registros clínicos;
- consultar medicamentos;
- receber notificações.

O Tutor não realiza CRUD de Pets. O vínculo entre Tutor e Pet é feito pela clínica.

## SmartCare

O SmartCare funciona como apoio à decisão para Veterinários e Administradores de Clínica.

O Mobile não acessa o SmartCare diretamente. O fluxo utilizado é:

```text
Mobile
  ↓
API Spring Boot
  ↓
SmartCare
```

Serviço publicado:

```text
https://petjourney-smartcare.onrender.com
```

## Tecnologias

- React Native
- Expo SDK 54
- React
- TypeScript
- React Navigation
- TanStack Query
- Axios
- Expo SecureStore
- Expo Notifications
- React Native Safe Area Context
- React Native Screens

As versões específicas das dependências podem ser consultadas no `package.json`.

## Arquitetura

O projeto está organizado por responsabilidade dentro de `src`.

```text
src/
├── components/
├── contexts/
├── hooks/
├── navigation/
├── screens/
├── services/
├── theme/
├── types/
└── utils/
```

Fluxo principal de comunicação com o backend:

```text
Screen
  ↓
Hook
  ↓
TanStack Query
  ↓
Service
  ↓
Axios
  ↓
API Spring Boot
```

## Como executar

### Pré-requisitos

- Node.js compatível com Expo SDK 54
- npm
- Android Studio, dispositivo Android ou ambiente compatível com Expo
- acesso à internet

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_API_URL=https://petjourney-api.onrender.com
EXPO_PUBLIC_COMMIT_HASH=HASH_DO_COMMIT_DE_REFERENCIA
```

Depois execute:

```bash
npx expo start
```

Caso seja necessário limpar o cache:

```bash
npx expo start -c
```

Para executar diretamente no Android:

```bash
npx expo run:android
```

## API de produção

A aplicação utiliza:

```text
https://petjourney-api.onrender.com
```

O Mobile não acessa diretamente o banco de dados ou o SmartCare. Toda comunicação de dados passa pela API Spring Boot.

## Desenvolvimento local

Caso seja necessário utilizar o backend localmente, altere temporariamente a variável:

```env
EXPO_PUBLIC_API_URL=http://ENDERECO_DA_API:8080
```

Exemplos:

Emulador Android:

```text
http://10.0.2.2:8080
```

Celular físico na mesma rede:

```text
http://IP_DO_COMPUTADOR:8080
```

Após alterar a URL, reinicie o Expo com:

```bash
npx expo start -c
```

## Integrantes

**Turma:** 2TDSPX  
**Disciplina:** Mobile Application Development  
**Professor:** Pietro Rischi Nunes

- Felipe Wiclif Leal da Silva — RM563901
- Deryk de Souza Queiroz — RM563412
- Lucas Gonçalves Viana — RM563254
- Vinicius Paschoeto da Silva — RM563089

## Contas de teste

### Admin do Sistema
- Usuário: admin.sistema@petjourney.com
- Senha: 123456

### Admin da Clínica
- Usuário: admin.petfeliz@petjourney.com
- Senha: 123456

### Veterinário
- Usuário: dr.joao@petjourney.com
- Senha: 123456

### Tutor
- Usuário: carlos@petjourney.com
- Senha: 123456

## Vídeo de apresentação

Link do vídeo da Sprint 4:

https://youtube.com/shorts/Hif2wPYoPSc
