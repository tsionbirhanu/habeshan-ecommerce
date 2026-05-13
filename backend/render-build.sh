#!/bin/bash
set -e

echo "Installing all dependencies (including devDependencies)..."
npm install --legacy-peer-deps

echo "Generating Prisma client..."
npx prisma generate

echo "Building TypeScript..."
npm run build

echo "Build completed successfully!"
