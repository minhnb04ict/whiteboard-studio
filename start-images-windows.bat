@echo off
cd /d "%~dp0"
call npm install
if errorlevel 1 goto fail
call npm start
pause
exit /b 0
:fail
echo Node dependencies installation failed. Read the error above.
pause
exit /b 1
