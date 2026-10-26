@echo off
echo Starting Django Backend Server on port 8000...
cd /d "%~dp0backend"
"%~dp0backend\venv\Scripts\python.exe" manage.py runserver 0.0.0.0:8000
pause
