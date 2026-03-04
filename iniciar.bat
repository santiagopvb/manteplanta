@echo off
echo Iniciando APP-Nuevos Desarrollos...
where python >nul 2>&1
if %errorlevel% == 0 (
    start "" "http://localhost:8080"
    timeout /t 2 >nul
    python -m http.server 8080 --directory "%~dp0"
) else (
    where py >nul 2>&1
    if %errorlevel% == 0 (
        start "" "http://localhost:8080"
        timeout /t 2 >nul
        py -m http.server 8080 --directory "%~dp0"
    ) else (
        echo ERROR: Python no esta instalado.
        echo Instálalo desde https://www.python.org
        pause
    )
)
