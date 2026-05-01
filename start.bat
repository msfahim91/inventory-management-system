@echo off
echo Starting Inventory Management System...
start "Backend" cmd /k "cd backend && mvnw.cmd spring-boot:run"
timeout /t 15
start "Frontend" cmd /k "cd frontend && npm run dev"
echo Both servers starting...
start chrome http://localhost:5173