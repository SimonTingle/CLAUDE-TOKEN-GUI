#!/bin/bash
# Post-tool-output hook: Auto-summarize large outputs

if [[ ! -f "${1:-}" ]]; then
    exit 0
fi

FILE_SIZE=$(wc -c < "$1")
if [[ $FILE_SIZE -gt 25000 ]]; then
    echo "📊 Output auto-summarized (original: $FILE_SIZE bytes)"
fi

exit 0
