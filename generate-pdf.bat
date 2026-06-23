@echo off
echo Generating PDF guides...
cd /d "%~dp0docs"
if not exist "node_modules" (
  echo Installing pdf dependencies...
  call npm install
)
call npm run generate
if errorlevel 1 (
  echo Puppeteer failed - trying Python fallback...
  python "%~dp0scripts\generate_pdf.py"
)
echo PDF: docs\HOW_TO_RUN_AND_DEMO.pdf
pause
