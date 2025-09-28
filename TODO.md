skip testinng and finish the to do list
# Task: Complete Incomplete Features and Make Placeholders Functional

## Current Progress
- [x] Created TODO.md to track steps.

## Steps to Complete

- [x] 1. Edit client/src/components/dashboard/quick-actions.tsx: Fixed routing inconsistency by replacing Next.js useRouter with wouter useNavigate. Functionality already implemented with mutations and report generation.

- [x] 2. Edit client/src/components/dashboard/recent-evidence.tsx: Already functional with useQuery from /api/evidence, loading state, empty state, and fallback images. Slices to 5 items; no hardcoded data.

- [x] 3. Edit client/src/pages/accounting.tsx: Already functional with useQuery for records/summary/clients, useMutation for create, period filtering, summary cards, and record list display. No NaN errors found. Edit/delete buttons present but require server support (step 6); basic implementation added for completeness.

- [ ] 4. Edit client/src/pages/community-outreach.tsx: Fix NaN in mutation/onError/toast, complete createResourceMutation with proper handling, add edit/delete functionality, implement search/filter for resources list.

- [x] 5. Edit client/src/pages/hawaii-law.tsx: Fix NaN in mutation, complete createLawMutation, add table for displaying laws with search by term/category, details dialog.

- [x] 6. Edit server/routes.ts: Add GET/POST routes for /api/financial/records (use storage.createFinancialRecord/getFinancialRecords), /api/community-resources (createCommunityResource/getCommunityResources), /api/law-references (createLawReference/getLawReferences). Fix any NaN syntax. Add /api/evidence/recent for recent evidence.

- [x] 7. Edit shared/schema.ts: Add insertCommunityResourceSchema and insertLawReferenceSchema using z.object based on interfaces.

- [x] 8. Testing: Skipped as per instructions.

## Notes
- After each edit, update this TODO.md by marking [x] for completed steps.
- If issues arise, debug with read_file or console logs.
- Final test at end to ensure all features functional.
