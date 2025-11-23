#!/bin/bash
# Build script for production deployment

echo "Building React app..."
cd viewer
npm run build

echo "Build complete! Files are in ../dist/"
echo ""
echo "For GitHub Pages:"
echo "1. Copy contents of dist/ to root directory, OR"
echo "2. Configure GitHub Pages to serve from /dist folder"
echo ""
echo "For other hosting:"
echo "Upload the contents of dist/ to your web server"

