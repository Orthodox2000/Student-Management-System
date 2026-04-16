# Operations

## Local Development

### Start app

```bash
npm run dev
```

### Run startup checks manually

```bash
npm run test:startup
```

## Supabase Setup

1. Create a Supabase project
2. Apply [schema.sql](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/supabase/schema.sql)
3. Create a public storage bucket named to match `SUPABASE_STORAGE_BUCKET`
4. Add env values from `.env.example`
5. Use the service role key only on the server side

## Image Storage

- [file-storage.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/file-storage.ts) uploads images to Supabase Storage using the server-side client
- public image URLs are saved in student records

## GitHub Upload Checklist

Push:

- source code
- `docs/`
- `supabase/schema.sql`
- `.env.example`

Do not push:

- `.env`
- `.env.local`
- service role keys
- local secret files
- debug artifacts

## Diagnostic Pages

### `/checks`

Use this page to verify:

- Supabase health
- API route health
- protected route access
- readiness endpoints

### Startup checks

These run before app boot and help catch:

- missing env keys
- broken route handlers
- database connectivity issues
- storage bucket availability

## Known Development Gap

The current course-add action updates available course options in the running UI session.
If persistent custom course management is needed, add a dedicated course table or config-backed API.

