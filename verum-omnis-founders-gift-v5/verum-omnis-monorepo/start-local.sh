#!/bin/bash
# Quick start script for Verum Omnis local development

echo "🚀 Verum Omnis - Quick Start"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: Please run this script from the verum-omnis-monorepo directory"
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed"
    exit 1
fi

echo "✅ Starting development server..."
echo ""
echo "📍 Access the application at:"
echo "   - Homepage:     http://localhost:5000"
echo "   - Verify:       http://localhost:5000/verify.html"
echo "   - Legal/Treaty: http://localhost:5000/legal.html"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the Python HTTP server
cd web && python3 -m http.server 5000
