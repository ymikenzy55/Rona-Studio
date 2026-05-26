@echo off
echo Clearing Vite cache and node_modules...
echo.

echo Step 1: Removing node_modules/.vite folder...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ Removed node_modules/.vite
) else (
    echo - node_modules/.vite not found
)

echo.
echo Step 2: Removing dist folder...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✓ Removed dist
) else (
    echo - dist not found
)

echo.
echo ✓ Cache cleared successfully!
echo.
echo Now restart your dev server:
echo   npm run dev
echo.
pause
