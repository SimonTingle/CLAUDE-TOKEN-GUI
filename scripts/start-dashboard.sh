#!/bin/bash
# start-dashboard.sh
# Start both backend API server and frontend React app

set -euo pipefail

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Get script directory
SCRIPT_DIR="$(dirname "$(realpath "$0")")/.."
cd "$SCRIPT_DIR" || { log_error "Failed to enter $SCRIPT_DIR"; exit 1; }

echo "=========================================================="
echo " Claude Token Dashboard - Starting Services"
echo "=========================================================="
echo ""

# Function to cleanup on exit
cleanup() {
    log_warning "Shutting down services..."

    # Kill background processes
    if [ -n "${BACKEND_PID:-}" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "${FRONTEND_PID:-}" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    log_success "Services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Check if ports are available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_error "Port $1 is already in use"
        return 1
    fi
    return 0
}

log_info "Checking ports..."
check_port 5000 || { log_error "Port 5000 is in use. Stop the service or change PORT env var."; exit 1; }
check_port 3000 || { log_warning "Port 3000 is in use. Frontend will try next available port."; }

echo ""

# Start backend
log_info "Starting backend API server on port 5000..."
cd "$SCRIPT_DIR/dashboard-server" || exit 1

# Use npm run dev if available, otherwise build and run
if npm run build 2>&1 | tail -3; then
    npm start &
    BACKEND_PID=$!
    log_success "Backend started (PID: $BACKEND_PID)"
else
    log_error "Failed to build backend"
    exit 1
fi

# Wait for backend to be ready
log_info "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        log_success "Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Backend failed to start"
        exit 1
    fi
    sleep 1
done

echo ""

# Start frontend
log_info "Starting frontend React app on port 3000..."
cd "$SCRIPT_DIR/dashboard" || exit 1

npm run dev &
FRONTEND_PID=$!
log_success "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "=========================================================="
echo " ${GREEN}✅ Services Running${NC}"
echo "=========================================================="
echo ""
echo "${CYAN}Dashboard:${NC} http://localhost:3000"
echo "${CYAN}Backend API:${NC} http://localhost:5000"
echo "${CYAN}Backend Health:${NC} http://localhost:5000/api/health"
echo ""
echo "📊 Real-time token monitoring active!"
echo "⏱️  Dashboard updates every 10 seconds"
echo "🔄 Backend syncs tokens every 5 minutes"
echo ""
echo "💡 Quick Commands:"
echo "   • Ctrl+C to stop all services"
echo "   • Check backend: curl http://localhost:5000/api/usage"
echo ""
echo "=========================================================="
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
