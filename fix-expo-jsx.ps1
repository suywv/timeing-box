# URGENT: Fix Expo Web Build JSX Parsing Error
# PowerShell commands to fix webpack/babel configuration

# 1. Clear all caches
Write-Host "Clearing all caches..." -ForegroundColor Yellow
expo r -c
npm cache clean --force
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# 2. Remove node_modules and package-lock
Write-Host "Removing node_modules and package-lock..." -ForegroundColor Yellow
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# 3. Install required babel presets
Write-Host "Installing required babel presets..." -ForegroundColor Yellow
npm install --save-dev @babel/preset-react babel-preset-expo

# 4. Clean install dependencies
Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
npm ci

# 5. Clear Expo cache again after install
Write-Host "Final cache clear..." -ForegroundColor Yellow
expo r -c

# 6. Test web build
Write-Host "Testing web build..." -ForegroundColor Green
expo start --web

Write-Host "Fix completed! JSX parsing should now work." -ForegroundColor Green