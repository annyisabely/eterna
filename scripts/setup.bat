@echo off
chcp 65001 > nul
echo ====================================================
echo 🌸 Eterna Cosméticos - Instalação do Ambiente
echo ====================================================

echo [1/4] Instalando dependências do Backend...
cd backend
call npm install
if not exist .env (
    copy .env.example .env
    echo Arquivo .env criado no backend. Por favor configure suas credenciais.
)
cd ..

echo.
echo [2/4] Instalando dependências do Frontend...
cd frontend
call npm install
if not exist .env (
    copy .env.example .env
    echo Arquivo .env criado no frontend.
)
cd ..

echo.
echo [3/4] Testando compilação do Backend...
cd backend
call npm run build
cd ..

echo.
echo [4/4] Testando compilação do Frontend...
cd frontend
call npm run build
cd ..

echo.
echo ====================================================
echo ✅ Instalação concluída com sucesso!
echo.
echo Próximos passos:
echo 1. Configure o banco PostgreSQL no backend/.env (DATABASE_URL)
echo 2. Execute a migration: psql DATABASE_URL -f backend/migrations/001_initial_schema.sql
echo 3. Crie o admin: cd backend && npm run seed:admin
echo 4. Inicie o sistema: scripts\run-dev.bat
echo ====================================================

