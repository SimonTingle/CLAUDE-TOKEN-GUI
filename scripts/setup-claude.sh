#!/bin/bash
set -euo pipefail

CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$CLAUDE_DIR-backup-$(date +%Y%m%d-%H%M%S)"
SCRIPT_DIR="$(dirname "$(realpath "$0")")/.."

echo -e "\033[0;34m[INFO]\033[0m Starting Claude Token Optimizer Setup..."
echo ""

# Backup existing config
if [ -d "$CLAUDE_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -a "$CLAUDE_DIR/." "$BACKUP_DIR/"
    echo -e "\033[0;32m[SUCCESS]\033[0m Backup created at:"
    echo "   $BACKUP_DIR"
fi

# Create directories
mkdir -p "$CLAUDE_DIR"/{scripts,hooks,skills,configs}
echo -e "\033[0;32m[SUCCESS]\033[0m Created ~/.claude directories"

# Copy configs
cp -r "$SCRIPT_DIR/configs/"* "$CLAUDE_DIR/" 2>/dev/null || true
cp -r "$SCRIPT_DIR/hooks/"* "$CLAUDE_DIR/hooks/" 2>/dev/null || true
echo -e "\033[0;32m[SUCCESS]\033[0m Installed optimized configurations"

# Generate status line script
cat > "$CLAUDE_DIR/scripts/status-line.sh" << 'STATUS'
#!/bin/bash
USAGE=$(npx ccusage@latest --today 2>/dev/null | grep -o '[0-9]* tokens' || echo '? tokens')
echo "🧠 Claude | Today: $USAGE"
STATUS
chmod +x "$CLAUDE_DIR/scripts/status-line.sh"
echo -e "\033[0;32m[SUCCESS]\033[0m Generated status-line script"

echo ""
echo -e "\033[0;32m[SUCCESS]\033[0m ✅ Setup complete!"
echo ""
echo "Next steps:"
echo "   1. Restart Claude Code"
echo "   2. Run: npx ccusage@latest"
echo "   3. (Optional) pip install claude-code-usage-monitor && claude-monitor --plan pro"
echo ""
