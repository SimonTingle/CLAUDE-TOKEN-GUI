# Claude Token Optimization Guide (10-Step System)

## The Framework

1. **Daily Usage Check** - Run `npx ccusage@latest` every morning
2. **Identify Burn Rate** - Spot your expensive sessions
3. **Monitor Billing Windows** - Watch 5-hour windows closely
4. **Install Live Monitor** - `pip install claude-code-usage-monitor`
5. **Use Split Terminal** - Claude + monitor side-by-side
6. **Reduce Model Cost** - Switch to Sonnet + low effort on spikes
7. **Auto-Summarize** - Use hooks to compress large outputs
8. **Weekly Review** - Track cache-read ratios and trends
9. **Lazy Loading** - Enable MCP lazy load in settings
10. **Set Budget** - Enforce weekly token budget

## Top Token-Saving Techniques

- Default to Claude 3.5 Sonnet + low effort
- Use auto-summarizing hooks
- Enable lazy tool loading
- Run `/compact` frequently
- Use on-demand skills instead of long prompts
- Enable prompt caching in settings
- Monitor during high-effort sessions

## Reference

See community resources for 36+ additional optimization tips.
