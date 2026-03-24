#!/bin/bash
set -e

echo "=== Garlicton Studio Deploy ==="
echo "Building with Vercel CLI..."
npx vercel build --prod

echo "Deploying pre-built output..."
npx vercel deploy --prebuilt --prod

echo "=== Deploy complete! ==="
