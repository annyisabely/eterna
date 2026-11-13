@echo off
chcp 65001 > nul
echo Gerando backup do banco de dados Eterna Cosméticos...
set TIMESTAMP=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%
if not exist backups mkdir backups
pg_dump -d eterna_db -U postgres -F c -b -v -f "backups/eterna_backup_%TIMESTAMP%.dump"
echo Backup concluído em backups/eterna_backup_%TIMESTAMP%.dump

