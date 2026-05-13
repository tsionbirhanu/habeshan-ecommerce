#!/bin/bash
set -e

echo "Installing dependencies (including devDependencies)..."
npm ci

echo "Generating Prisma client..."
npx prisma generate

echo "Building TypeScript..."
npm run build

echo "Build completed successfully!"
