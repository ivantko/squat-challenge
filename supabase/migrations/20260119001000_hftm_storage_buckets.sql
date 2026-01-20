-- =============================================================================
-- HamsForTheMaams: Storage buckets + access policies
-- =============================================================================

-- Buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Avatars (public read; authenticated write to owned objects)
-- ---------------------------------------------------------------------------

drop policy if exists "Public can view avatars" on storage.objects;
create policy "Public can view avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

drop policy if exists "Users can upload avatars" on storage.objects;
create policy "Users can upload avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars' and
  auth.uid() = owner
);

drop policy if exists "Users can update avatars" on storage.objects;
create policy "Users can update avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars' and
  auth.uid() = owner
)
with check (
  bucket_id = 'avatars' and
  auth.uid() = owner
);

drop policy if exists "Users can delete avatars" on storage.objects;
create policy "Users can delete avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars' and
  auth.uid() = owner
);

-- ---------------------------------------------------------------------------
-- Proofs (private; only owner can read/write)
-- ---------------------------------------------------------------------------

drop policy if exists "Users can upload proofs" on storage.objects;
create policy "Users can upload proofs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'proofs' and
  auth.uid() = owner
);

drop policy if exists "Users can view proofs" on storage.objects;
create policy "Users can view proofs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'proofs' and
  auth.uid() = owner
);

drop policy if exists "Users can update proofs" on storage.objects;
create policy "Users can update proofs"
on storage.objects for update
to authenticated
using (
  bucket_id = 'proofs' and
  auth.uid() = owner
)
with check (
  bucket_id = 'proofs' and
  auth.uid() = owner
);

drop policy if exists "Users can delete proofs" on storage.objects;
create policy "Users can delete proofs"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'proofs' and
  auth.uid() = owner
);

