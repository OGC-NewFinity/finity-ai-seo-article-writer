#!/bin/sh
set -e

echo "Verifying critical dependencies..."
if [ ! -d "node_modules/@google/generative-ai" ]; then
  echo "⚠️  @google/generative-ai not found in node_modules, installing dependencies..."
  npm install
  echo "✅ Dependencies installed"
else
  echo "✅ @google/generative-ai found"
fi

# Verify the package can be loaded (ES module syntax)
# Temporarily disable exit on error for verification
set +e
node --input-type=module -e "import('@google/generative-ai').then(() => console.log('✅ @google/generative-ai package verified')).catch(() => { console.error('❌ ERROR: @google/generative-ai package cannot be loaded!'); process.exit(1); })" 2>&1
VERIFY_EXIT_CODE=$?
set -e

if [ $VERIFY_EXIT_CODE -ne 0 ]; then
  echo "⚠️  Package verification failed, attempting to reinstall..."
  npm install @google/generative-ai
  
  # Verify again after reinstall
  set +e
  node --input-type=module -e "import('@google/generative-ai').then(() => console.log('✅ @google/generative-ai reinstalled and verified')).catch(() => { console.error('❌ CRITICAL: Failed to install @google/generative-ai'); process.exit(1); })" 2>&1
  REINSTALL_EXIT_CODE=$?
  set -e
  
  if [ $REINSTALL_EXIT_CODE -ne 0 ]; then
    echo "❌ CRITICAL: Failed to install @google/generative-ai"
    exit 1
  fi
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Running Prisma migrations..."
npx prisma migrate deploy || echo "Migrations failed, continuing..."

echo "Starting application..."
exec npm run start
