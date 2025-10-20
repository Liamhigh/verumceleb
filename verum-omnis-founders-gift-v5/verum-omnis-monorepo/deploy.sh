#!/bin/bash

###############################################################################
# Verum Omnis Deployment Script
#
# Usage:
#   ./deploy.sh [--check|--local|--production]
#
# Options:
#   --check       Run pre-deployment checks only
#   --local       Start local development server
#   --production  Deploy to production (requires Firebase auth)
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✅${NC} $1"; }
warn() { echo -e "${YELLOW}⚠️${NC} $1"; }
error() { echo -e "${RED}❌${NC} $1"; exit 1; }

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Parse command line arguments
MODE="${1:---check}"

###############################################################################
# Pre-deployment checks
###############################################################################

check_prerequisites() {
    info "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 20."
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        error "Node.js version 20 or higher is required. Current: $(node --version)"
    fi
    success "Node.js $(node --version) ✓"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed."
    fi
    success "npm $(npm --version) ✓"
    
    # Check if functions dependencies are installed
    if [ ! -d "functions/node_modules" ]; then
        warn "Functions dependencies not installed"
        info "Installing dependencies..."
        cd functions && npm ci && cd ..
    fi
    success "Functions dependencies ✓"
}

check_tests() {
    info "Running tests..."
    
    # Test immutable pack verification
    cd functions
    if node -e "import('./index.js').then(() => console.log('OK'))" 2>&1 | grep -q "OK"; then
        success "Immutable pack verification ✓"
    else
        error "Immutable pack verification failed"
    fi
    
    # Run comprehensive tests
    if node test-api.js > /tmp/test-output.log 2>&1; then
        success "All API tests passed ✓"
    else
        error "API tests failed. Check /tmp/test-output.log for details"
    fi
    cd ..
}

check_firebase() {
    info "Checking Firebase configuration..."
    
    # Check if Firebase CLI is installed (for production deploys)
    if [ "$MODE" = "--production" ]; then
        if ! command -v firebase &> /dev/null; then
            error "Firebase CLI not installed. Run: npm install -g firebase-tools"
        fi
        success "Firebase CLI installed ✓"
        
        # Check if logged in
        if ! firebase projects:list &> /dev/null; then
            error "Not logged into Firebase. Run: firebase login"
        fi
        success "Firebase authentication ✓"
    fi
    
    # Check project configuration
    if [ ! -f ".firebaserc" ]; then
        error "Firebase project not configured (.firebaserc missing)"
    fi
    
    PROJECT_ID=$(grep -o '"default": "[^"]*"' .firebaserc | cut -d'"' -f4)
    if [ -z "$PROJECT_ID" ]; then
        error "Firebase project ID not found in .firebaserc"
    fi
    success "Firebase project: $PROJECT_ID ✓"
}

###############################################################################
# Deployment modes
###############################################################################

run_checks() {
    echo ""
    info "Running pre-deployment checks..."
    echo ""
    
    check_prerequisites
    check_tests
    check_firebase
    
    echo ""
    success "All checks passed! Ready for deployment."
    echo ""
    
    info "Next steps:"
    echo "  • Local: ./deploy.sh --local"
    echo "  • Production: ./deploy.sh --production"
    echo ""
}

run_local() {
    echo ""
    info "Starting local development server..."
    echo ""
    
    check_prerequisites
    
    # Check if Firebase CLI is installed for emulators
    if ! command -v firebase &> /dev/null; then
        error "Firebase CLI required for local emulators. Run: npm install -g firebase-tools"
    fi
    
    info "Starting Firebase emulators..."
    echo ""
    info "Access points:"
    echo "  • Web UI: http://localhost:5000"
    echo "  • API: http://localhost:5001/api2/v1/verify"
    echo "  • Emulator UI: http://localhost:4000"
    echo ""
    info "Press Ctrl+C to stop"
    echo ""
    
    firebase emulators:start
}

run_production() {
    echo ""
    info "Deploying to production..."
    echo ""
    
    check_prerequisites
    check_tests
    check_firebase
    
    # Get project ID
    PROJECT_ID=$(grep -o '"default": "[^"]*"' .firebaserc | cut -d'"' -f4)
    
    warn "You are about to deploy to production: $PROJECT_ID"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Deployment cancelled"
    fi
    
    info "Deploying hosting and functions..."
    firebase deploy --only hosting,functions --project "$PROJECT_ID"
    
    echo ""
    success "Deployment complete!"
    echo ""
    info "Verify deployment:"
    echo "  • Web: https://${PROJECT_ID}.web.app"
    echo "  • API: https://us-central1-${PROJECT_ID}.cloudfunctions.net/api2/v1/verify"
    echo ""
}

###############################################################################
# Main
###############################################################################

case "$MODE" in
    --check)
        run_checks
        ;;
    --local)
        run_local
        ;;
    --production)
        run_production
        ;;
    *)
        error "Invalid mode: $MODE\nUsage: ./deploy.sh [--check|--local|--production]"
        ;;
esac
