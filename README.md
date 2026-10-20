# Kanban — Sistema de Gerenciamento de Tarefas

Aplicação full stack com HTML5, CSS3, Java 17, Spring Boot e SQLite. O SQLite armazena os dados em um único arquivo local (`data/kanban.db`); não é necessário instalar ou iniciar um servidor de banco de dados.

## Início rápido — Docker

Requisito: Docker com Compose em execução.

```sh
docker compose up --build -d
```

Abra **http://localhost:8080**. O app cria `kanban.db` automaticamente dentro do volume `kanban_data` e gera as tabelas na primeira inicialização. Os dados continuam lá depois de parar e iniciar os containers:

```sh
docker compose down
docker compose up -d
```

Para acompanhar a inicialização:

```sh
docker compose logs -f app
```

Se a porta 8080 estiver ocupada, escolha outra:

```powershell
$env:KANBAN_PORT = '8081'
docker compose up --build -d
```

No Linux ou macOS, use `KANBAN_PORT=8081 docker compose up --build -d`.

## Executar localmente

Requisitos: Node.js, Java 17 e Maven no PATH. Execute na pasta do projeto:

```powershell
node scripts/start.mjs
```

O inicializador cria a pasta `data/`, inicia a aplicação e abre o navegador quando ela estiver pronta. O arquivo SQLite fica em `data/kanban.db`. No VS Code, pressione F5 e escolha **Kanban — Front + Back (SQLite)**.

Também é possível iniciar pelo Maven com `mvn spring-boot:run`, desde que a pasta `data/` exista.

## Funcionalidades

- Criar, editar, excluir e mover tarefas entre etapas.
- Prioridade, prazo e indicação de atraso.
- Busca por título/descrição e filtros de prioridade e prazo.
- Layout responsivo e validação no servidor.
- Persistência local em SQLite por meio da API REST.
- Histórico de criação, edição, movimentação e exclusão.

## Arquivo de dados

Em execução local, os dados ficam em `data/kanban.db`. Faça uma cópia desse arquivo para backup, com a aplicação parada. No Docker, o arquivo fica no volume nomeado `kanban_data`.

O projeto anteriormente tinha uma base H2 (`data/kanban.mv.db`). Ela permanece intocada; esta alteração não migra automaticamente dados da base antiga. O app novo cria `data/kanban.db` ao iniciar.

## API

| Método | Rota | Resultado |
| --- | --- | --- |
| GET | `/tarefas` | Listar tarefas |
| GET | `/tarefas/{id}` | Buscar uma tarefa |
| POST | `/tarefas` | Criar (201) |
| PUT | `/tarefas/{id}` | Atualizar |
| DELETE | `/tarefas/{id}` | Excluir (204) |
| GET | `/historico` | Últimos 100 eventos do quadro |
| GET | `/tarefas/{id}/historico` | Últimos 100 eventos da tarefa, inclusive após exclusão |

Status: `A_FAZER`, `EM_ANDAMENTO`, `CONCLUIDO`. Prioridades: `BAIXA`, `MEDIA`, `ALTA`. O servidor gera `id`, `criadaEm` e `atualizadaEm`.

Esta versão é para um espaço pessoal, sem autenticação.
