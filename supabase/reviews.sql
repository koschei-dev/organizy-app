-- Reviews for the Organizy website.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- What the public (anon) key can do after this:
--   * insert a review with only name, rating and body (it always starts unapproved)
--   * read approved reviews (name, rating, body, date)
-- It cannot read pending reviews, approve anything, edit or delete.
-- You approve reviews in Table Editor → reviews → set "approved" to true.

create table if not exists public.reviews (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text     not null check (char_length(btrim(name)) between 1 and 40),
  rating      smallint not null check (rating between 1 and 5),
  body        text     not null check (char_length(btrim(body)) between 10 and 600),
  approved    boolean  not null default false,
  -- No links: cuts most spam before it reaches your queue.
  constraint reviews_no_links check ((name || ' ' || body) !~* '(https?://|www\.)')
);

alter table public.reviews enable row level security;

-- Column-level grants: anon can only send these three fields and read these four.
revoke all on public.reviews from anon, authenticated;
grant insert (name, rating, body) on public.reviews to anon;
grant select (name, rating, body, created_at) on public.reviews to anon;

drop policy if exists "Read approved reviews" on public.reviews;
create policy "Read approved reviews"
  on public.reviews for select to anon
  using (approved = true);

drop policy if exists "Submit a review for moderation" on public.reviews;
create policy "Submit a review for moderation"
  on public.reviews for insert to anon
  with check (approved = false);

create index if not exists reviews_approved_created_idx
  on public.reviews (created_at desc) where approved;
