# EventConnect × Maxify Integration Plan

## Architecture

```
EventConnect
    ↓
MaxifyService
    ↓
MaxifyProvider interface
├── MaxifyDemoProvider (Demo Day)
└── MaxifyApiProvider (Future Production)
```

## Key Principles

1. **Provider Selection**: Server-side only via `MAXIFY_INTEGRATION_MODE` env var
2. **Frontend Agnostic**: Frontend never knows which provider is active
3. **Demo Mode**: Deterministic data for TechConnect Lagos 2026
4. **Production Mode**: Stub implementation awaiting real credentials
5. **No Fake APIs**: Demo provider simulates operations, doesn't claim to be real Maxify API

## Environment Variables

```env
# New
MAXIFY_INTEGRATION_MODE=demo  # or "production"

# Production mode requires (only if mode=production)
MAXIFY_API_KEY=...
MAXIFY_API_URL=...
MAXIFY_WEBHOOK_SECRET=...
```

## Demo Event: TechConnect Lagos 2026

- Expected guests: 500
- Regular tickets: ₦20,000 (184 sold)
- VIP tickets: ₦50,000 (100 sold)
- Registered: 284
- Checked in: 230
- Attendance rate: ~81%

## Features to Build

1. ✅ Event Workspace
2. ✅ Event Readiness Score
3. ✅ Maxify Integration Card
4. ✅ Ticket Dashboard
5. ✅ Guest Registration Stats
6. ✅ QR/Check-in Demonstration
7. ✅ Attendance Analytics
8. ✅ Event Health
9. ✅ Demo Environment Indicator
10. ✅ Provider Architecture

## UI Messaging

- Show: "Maxify Tickets"
- Show: "Partner Demo Environment"
- Show: "This prototype demonstrates the proposed EventConnect × Maxify Tickets workflow. Production API integration requires partner credentials."

Do NOT show:
- "Connected to Maxify API"
- Fake API endpoints
- Imaginary credentials

## Database Changes

Add to `EventConnect-Server/prisma/schema.prisma`:
- Event model
- EventVendor model
- Ticket model
- CheckIn model
- EventAnalytics model

## API Routes

New routes in backend:
- `/api/events` - CRUD
- `/api/events/[id]/readiness` - Calculate readiness
- `/api/events/[id]/launch` - Launch with Maxify
- `/api/events/[id]/maxify/*` - Maxify operations (tickets, check-in, analytics)

## Implementation Order

1. Backend: Prisma schema + migration
2. Backend: Maxify provider abstraction + demo provider
3. Backend: Event API routes + controllers
4. Frontend: TypeScript types
5. Frontend: API client functions
6. Frontend: Event routes and workspace UI
