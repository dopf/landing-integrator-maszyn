@echo off
rem Uruchamia lokalny serwer i otwiera landing w przegladarce.
cd /d "%~dp0"
start "Synergy - serwer lokalny" python -m http.server 8080
timeout /t 1 /nobreak >nul
start "" http://localhost:8080/index.html
