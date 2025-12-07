-- Add image_url column to store_products
alter table "public"."store_products" add column "image_url" text;

-- Create storage bucket for store products
insert into storage.buckets (id, name, public)
values ('store-products', 'store-products', true)
on conflict (id) do nothing;

-- Storage Policies
-- 1. Public Read Access
create policy "Store Products Images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'store-products' );

-- 2. Authenticated Upload Access
create policy "Authenticated users can upload store product images"
  on storage.objects for insert
  with check ( bucket_id = 'store-products' and auth.role() = 'authenticated' );

-- 3. Authenticated Update Access (Own images ideally, but generally auth for now)
create policy "Authenticated users can update store product images"
  on storage.objects for update
  using ( bucket_id = 'store-products' and auth.role() = 'authenticated' );

-- 4. Authenticated Delete Access
create policy "Authenticated users can delete store product images"
  on storage.objects for delete
  using ( bucket_id = 'store-products' and auth.role() = 'authenticated' );
