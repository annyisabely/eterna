@echo off
chcp 65001 > nul
echo Iniciando Eterna Cosméticos (Backend + Frontend)...

start "Eterna API Backend (Porta 3001)" cmd /k "cd backend && npm run dev"
start "Eterna Loja Frontend (Porta 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================================
echo 🌸 Servidores em execução:
echo Loja Pública:  http://localhost:5173
echo Painel Admin:  http://localhost:5173/admin
echo API Backend:   http://localhost:3001/api/health
echo ====================================================

