@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
if errorlevel 1 goto fail
call npm run doctor
if not errorlevel 1 goto start
call npm run setup
if errorlevel 1 goto fail
:start
call npm start
pause
exit /b 0
:fail
echo Setup is incomplete. Read the error above. No project data was deleted.
pause
exit /b 1
