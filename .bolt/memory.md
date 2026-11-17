# Project memory

## Product intent & audience

- **FitSync**: fitness/gym management web application with admin capabilities.
- Admin features include user invite system and built-in API testing tools.
- Stripe integration for payment processing.
- Communication language: Portuguese (Brazilian).

## Brand personality & voice

- Practical, direct, instructional tone.
- User-facing copy and documentation in Portuguese.

## Visual design & UX direction

- Vite + React with Tailwind CSS and Lucide React icons.
- Sidebar navigation pattern with grouped sections (e.g., "Conta").
- Built-in "Testar APIs" page: pre-filled JWT token, endpoint selector, request body editor, response display with status code and timing.
- Admin dashboard context implied.

## Decisions, constraints & rationale

- Backend: Supabase Edge Functions (`supabase.co/functions/v1`).
- API documentation provided as OpenAPI spec at `public/fitsync-openapi.json`.
- Postman collection at `api/postman/fitsync-api.postman_collection.json` with `base_url` and `auth_token` environment variables.
- Built-in API tester avoids need for external tools during development.
- `stripe-webhook` endpoint returns 400 outside Stripe — expected behavior (signature validation fails without valid Stripe signature).
- No additional UI/icon packages beyond Lucide React unless explicitly requested.

## Open questions & assumptions

- Full feature scope beyond admin/invites/payments not yet confirmed.
- Exact target audience (gym owners, trainers, members) not fully defined.
- Whether non-admin user roles exist and their permissions.