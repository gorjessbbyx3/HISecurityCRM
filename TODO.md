# Task: Complete Incomplete Features and Mock Components in Security CRM

## Current Work
The project is a security company management system with client-side React/Vite and server-side TypeScript/Express/Supabase. The dashboard has mock components and type errors. Server has incomplete routes and auth. The goal is to fix type errors, replace mocks with API calls, complete forms, and test functionality.

## Key Technical Concepts
- React with TanStack Query for data fetching
- Zod for schema validation in shared/schema.ts
- Supabase for storage/DB operations
- Express server with routes for CRUD on entities (incidents, patrols, staff, properties, etc.)
- Authentication with local/memory/replit strategies
- TypeScript strict mode, targeting ES2015+

## Relevant Files and Code
- shared/schema.ts: Added entity types (Client, Property, Incident, PatrolReport, Appointment, FinancialRecord) with id, createdAt, updatedAt. Used for validation and typing.
  - Example: export type Incident = z.infer<typeof insertIncidentSchema> & { id: string; createdAt: Date; updatedAt: Date; }
- client/src/components/dashboard/recent-evidence.tsx: Replaced hardcoded array with useQuery to /api/evidence, added loading state and empty state. Typed as any[] for fallback.
  - Code snippet:
    const { data: evidenceItems, isLoading } = useQuery({
      queryKey: ["/api/evidence"],
      enabled: isAuthenticated,
    });
    const items = evidenceItems as any[] || [];
- client/src/lib/queryClient.ts: Uses fetch for queries, apiRequest for mutations with auth token.

## Problem Solving
- Type errors from unknown query data: Used 'as any[]' fallback and query typing where possible.
- Hardcoded mocks: Replaced with API calls assuming /api/evidence endpoint exists (uses supabaseStorage).
- NaN placeholders: Identified in pages like accounting.tsx (form defaultValues), server/routes.ts (onError: NaN).
- Missing dependencies: UI components like @radix-ui/react-* not installed, but focus on core functionality first.
- Auth issues: Server auth files have missing types for passport, express-session.

## Pending Tasks and Next Steps
- Fix type errors in dashboard components (e.g., crime-map.tsx analytics as {}, add interfaces).
  - "From tsc output: client/src/components/dashboard/crime-map.tsx:52: Property 'totalIncidents' does not exist on type '{}'."
  - Next: Read crime-map.tsx, add interface for analytics, type the query.
- Complete QuickActions: Already has navigation, but fix 'field' any type in CSV generation.
  - "client/src/components/dashboard/quick-actions.tsx:107: Parameter 'field' implicitly has an 'any' type."
  - Next: Edit to type field as string.
- Fix forms in pages/accounting.tsx: Complete schema usage, fix mutation onError NaN, add missing UI.
  - "client/src/pages/accounting.tsx:153: 'financialRecords' is of type 'unknown'."
  - Next: Read file, type query as FinancialRecord[], fix form.
- Fix server/routes.ts: Replace NaN with proper error handlers.
  - Next: Read server/routes.ts, edit onError: (error) => { console.error(error); res.status(500).json({ error }); }
- Install missing deps if needed (e.g., @radix-ui/* for UI, but skip for now as not critical).
- Test: Run tsc --noEmit, then browser_action to localhost:5173, check dashboard loads, quick actions work, no console errors.
  - "From previous browser_action: Navigation timeout - likely dev server not fully running due to TS errors."
  - Next: After fixes, re-run tsc, then browser test.
