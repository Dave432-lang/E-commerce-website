@echo off
echo ========================================================
echo Ecommerce Boutique - MySQL (XAMPP) Database Importer
echo ========================================================
echo.

:: Try to find mysql executable
where mysql >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set MYSQL_CMD=mysql
) else (
    if exist "C:\xampp\mysql\bin\mysql.exe" (
        set MYSQL_CMD="C:\xampp\mysql\bin\mysql.exe"
    ) else (
        echo [ERROR] MySQL client could not be found! 
        echo Please ensure XAMPP is installed at C:\xampp or mysql is in your PATH.
        pause
        exit /b 1
    )
)

echo Found MySQL at: %MYSQL_CMD%
echo.

echo 1. Creating database 'ecommerce_boutique'...
%MYSQL_CMD% -u root -e "CREATE DATABASE IF NOT EXISTS ecommerce_boutique;"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to create database. Is MySQL running in XAMPP?
    pause
    exit /b 1
)

echo 2. Importing schema...
%MYSQL_CMD% -u root ecommerce_boutique < "database\schema.sql"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to import schema.sql
    pause
    exit /b 1
)

echo 3. Importing seed data...
%MYSQL_CMD% -u root ecommerce_boutique < "database\seed.sql"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to import seed.sql
    pause
    exit /b 1
)

echo.
echo ========================================================
echo MySQL Import process finished successfully!
echo ========================================================
pause
