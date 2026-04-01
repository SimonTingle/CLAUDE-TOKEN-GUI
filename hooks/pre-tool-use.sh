#!/bin/bash
# Pre-tool-use hook: Prevent token waste and dangerous operations

if [[ -z "${1:-}" ]]; then
    echo "⚠️  No command provided to pre-tool hook"
    exit 1
fi

# Block dangerous or high-token commands
if echo "$1" | grep -qE "(rm -rf|cat node_modules|find .* -name .* -exec)"; then
    echo "🚫 Blocked: Potentially dangerous or token-heavy command"
    exit 1
fi

exit 0
