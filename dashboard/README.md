# Claude Token Dashboard - Frontend

React-based real-time dashboard with steam gauge visualization for Claude token usage monitoring.

## Features

- **3 Steam Gauges** - Daily, Weekly, Monthly token usage display
- **Real-time Updates** - Polls backend every 10 seconds
- **Color Zones** - 🟢 Green (safe) → 🟡 Yellow (caution) → 🔴 Red (danger)
- **Responsive Design** - Works on desktop, tablet, mobile
- **Status Indicators** - Live backend connection status, last sync time
- **Zero Configuration** - Works out of the box with default settings

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

```bash
cd dashboard
npm install
```

### Development

```bash
npm run dev
```

Starts on http://localhost:3000 with hot reload.

### Production Build

```bash
npm run build
npm run preview
```

## Components

### Gauge Component
**File:** `src/components/Gauge.tsx`

Reusable SVG-based circular gauge with:
- Animated needle showing percentage
- Color zones (green/yellow/red)
- Real-time stat updates
- Progress bar

**Props:**
```typescript
interface GaugeProps {
  title: string;           // e.g., "💼 Daily Usage"
  stats: UsageStats;       // { used, limit, remaining, percentage, color, formatted }
}
```

### Dashboard Component
**File:** `src/components/Dashboard.tsx`

Main container that:
- Fetches usage data from backend API
- Renders 3 Gauge components (daily/weekly/monthly)
- Handles loading and error states
- Polls for updates every 10 seconds

## API Integration

### Endpoint
```
GET http://localhost:5000/api/usage
```

### Response Format
```json
{
  "daily": {
    "used": 45000,
    "limit": 100000,
    "remaining": 55000,
    "percentage": 45,
    "color": "green",
    "formatted": {
      "used": "45K",
      "remaining": "55K"
    }
  },
  "weekly": { /* ... */ },
  "monthly": { /* ... */ },
  "lastUpdated": "2026-04-01T14:30:00.000Z"
}
```

## Styling

### Color Theme
- **Background:** Dark blue gradient (#0f172a → #1e293b)
- **Primary:** Sky blue (#60a5fa)
- **Success:** Emerald green (#34d399)
- **Warning:** Amber (#eab308)
- **Danger:** Red (#ef4444)

### CSS Files
- `App.css` - Global app styles
- `components/Dashboard.css` - Dashboard layout
- `components/Gauge.css` - Gauge component styles
- `index.css` - Root styles

## Project Structure

```
dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx      # Main dashboard component
│   │   ├── Dashboard.css
│   │   ├── Gauge.tsx          # Reusable gauge component
│   │   └── Gauge.css
│   ├── services/
│   │   └── api.ts             # Backend API integration
│   ├── App.tsx                # Root app component
│   ├── App.css
│   ├── main.tsx               # Entry point
│   ├── index.css              # Global styles
│   └── vite-env.d.ts
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Configuration

### Environment Variables

Create `.env.local` if needed:

```bash
# Backend API URL (default: /api which proxies to localhost:5000)
VITE_API_URL=http://localhost:5000

# Polling interval in milliseconds (default: 10000)
VITE_POLL_INTERVAL=10000
```

### Vite Configuration

**File:** `vite.config.ts`

Key settings:
- Port: 3000
- Proxy: `/api` → `http://localhost:5000`
- Build output: `dist/`

## Performance

- **Bundle Size:** ~150KB (gzipped)
- **Updates:** 10-second polling (configurable)
- **Memory:** <50MB at runtime
- **Rendering:** Optimized with React.memo

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Android Chrome 90+)

## Troubleshooting

### Dashboard shows "Failed to fetch"
- Ensure backend is running on port 5000
- Check: `curl http://localhost:5000/api/health`
- Check browser console for CORS errors

### Gauges not updating
- Check if backend is syncing tokens
- Verify network tab shows `/api/usage` requests
- Try manual sync: `curl -X POST http://localhost:5000/api/sync`

### Port 3000 already in use
- Vite will automatically try the next available port
- Or specify: `npm run dev -- --port 3001`

### Build fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 16+)
- Try: `npm run build` to see detailed error

## Development Tips

### Adding a New Gauge
```typescript
// In Dashboard.tsx
<Gauge
  title="🎯 Custom Period"
  stats={usage.custom}
/>
```

### Styling Customization
Edit `src/components/Gauge.css` or `src/components/Dashboard.css`

Key CSS variables (in `index.css`):
```css
--primary: #60a5fa;
--secondary: #34d399;
--danger: #ef4444;
--warning: #eab308;
```

### Local Testing with Mock Data
Modify `api.ts` to return mock data:
```typescript
export async function getUsage(): Promise<UsageResponse> {
  return getMockUsage();  // Skip API call
}
```

## Performance Optimization

- Uses React 18 with automatic batching
- CSS animations use GPU-accelerated transforms
- Gauge needle rotates with CSS transitions (60fps)
- Efficient re-renders with proper dependency management

## Future Enhancements

- [ ] Historical charts (line graph over time)
- [ ] Export daily/weekly/monthly reports
- [ ] Custom alert thresholds
- [ ] Dark/light mode toggle
- [ ] Multiple account support
- [ ] Keyboard shortcuts

---

Made with ❤️ for the Claude community.
