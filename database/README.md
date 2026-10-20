# Arquivos SQL antigos

O projeto agora usa SQLite no arquivo `data/kanban.db` e cria as tabelas ao iniciar. Não precisa executar scripts SQL nem instalar um servidor de banco de dados.

Os arquivos `01_schema.sql`, `02_consultas.sql` e `03_historico.sql` são mantidos apenas como referência de instalações antigas que usavam MySQL. A aplicação SQLite não os executa. Bases MySQL existentes precisam ser exportadas/importadas separadamente; a troca de configuração não migra os dados.
