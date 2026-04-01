#!/bin/bash
# setup-dashboard.sh
# One-command dashboard setup - installs all dependencies for frontend and backend

set -euo pipefail

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Get script directory
SCRIPT_DIR="$(dirname "$(realpath "$0")")/.."
cd "$SCRIPT_DIR" || { log_error "Failed to enter $SCRIPT_DIR"; exit 1; }

echo "=========================================================="
echo " Claude Token Dashboard - Setup"
echo "=========================================================="
echo ""

# Check Node.js
log_info "Checking Node.js..."
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 16+"
    exit 1
fi
NODE_VERSION=$(node --version)
log_success "Node.js: $NODE_VERSION"

# Check npm
log_info "Checking npm..."
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm --version)
log_success "npm: $NPM_VERSION"

echo ""
log_info "Installing backend dependencies..."
cd "$SCRIPT_DIR/dashboard-server" || exit 1
npm install --legacy-peer-deps 2>&1 | tail -5
log_success "Backend dependencies installed"

echo ""
log_info "Installing frontend dependencies..."
cd "$SCRIPT_DIR/dashboard" || exit 1
npm install --legacy-peer-deps 2>&1 | tail -5
log_success "Frontend dependencies installed"

# Initialize database
echo ""
log_info "Initializing SQLite database..."
cd "$SCRIPT_DIR/dashboard-server" || exit 1

# Check if ccusage is available
if command -v ccusage &> /dev/null || npm list -g ccusage@latest &>/dev/null 2>&1; then
    log_success "ccusage is available"
else
    log_warning "ccusage is not installed globally"
    log_info "Installing ccusage globally..."
    npm install -g ccusage@latest &>/dev/null || log_warning "Could not auto-install ccusage"
fi

echo ""
echo "=========================================================="
echo " ✅ Setup Complete!"
echo "=========================================================="
echo ""
echo "📚 Next Steps:"
echo "   1. Start the dashboard:"
echo "      ./scripts/start-dashboard.sh"
echo ""
echo "   2. Open in browser:"
echo "      http://localhost:3000"
echo ""
echo "📊 Services will run on:"
echo "   • Backend API: http://localhost:5000"
echo "   • Frontend Dashboard: http://localhost:3000"
echo ""
echo "💡 Pro Tip:"
echo "   Open both URLs in split-screen terminal for best experience"
echo ""
