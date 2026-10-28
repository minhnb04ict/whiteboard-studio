@echo off
setlocal DisableDelayedExpansion
pushd "%~dp0"
if errorlevel 1 goto folderfail
where node >nul 2>nul
if errorlevel 1 goto nonode
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"
if errorlevel 1 goto oldnode
if not exist "scripts\setup-tts.mjs" goto missingfiles
if not exist "scripts\python-runtime.mjs" goto missingfiles
if not exist "scripts\piper_tts.py" goto missingfiles
rem No npm or node_modules needed for the Piper installer.
node "scripts\setup-tts.mjs"
if errorlevel 1 goto fail
echo.
echo Piper ready. Restart the app and download a voice.
echo To install the whole app, run setup-windows.bat.
popd
pause
exit /b 0
:nonode
echo Node.js was not found. Install Node.js LTS 64-bit version 22 or newer.
echo Close this window, open a new CMD and run this file again.
goto fail
:oldnode
echo Node.js 22 or newer is required. Install Node.js LTS 64-bit.
goto fail
:missingfiles
echo Setup files are missing. Extract the COMPLETE source ZIP first.
echo Do not run this BAT directly inside the ZIP viewer.
goto fail
:fail
echo.
echo Piper setup failed. Read the error above. Project data was kept.
popd
pause
exit /b 1
:folderfail
echo Cannot open the project folder. Extract the ZIP to a writable local folder.
pause
exit /b 1
