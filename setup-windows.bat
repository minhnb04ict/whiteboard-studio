@echo off
cd /d "%~dp0"
call npm install
if errorlevel 1 goto fail
call npm run setup
if errorlevel 1 goto fail
echo Setup completed. Run start-windows.bat.
pause
exit /b 0
:fail
echo Setup failed. Read the error above.
pause
exit /b 1
