@echo off
rem Starts the store at http://localhost:8080 and opens it in your browser.
rem Needs Node.js (https://nodejs.org). Close this window to stop the store.
cd /d "%~dp0"
start "" http://localhost:8080
node server.js
pause
