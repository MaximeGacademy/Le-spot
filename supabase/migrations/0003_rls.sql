-- =====================================================================
--  Le Spot · Row Level Security
--  Active la RLS sur courts, bookings et profiles.
-- =====================================================================

-- Fonction helper pour éviter la récursion lors du check admin sur courts.
-- security definer : s'exécute avec les droits du propriétaire de la fonction,
-- donc la RLS de profiles ne s'applique pas à cet appel interne.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- --- courts -----------------------------------------------------------

alter table courts enable row level security;

-- Lecture publique : anonymes et utilisateurs connectés peuvent voir les terrains.
create policy "courts_select_public"
  on courts for select
  using (true);

-- Écriture réservée aux admins.
create policy "courts_insert_admin"
  on courts for insert
  with check (public.is_admin());

create policy "courts_update_admin"
  on courts for update
  using (public.is_admin());

create policy "courts_delete_admin"
  on courts for delete
  using (public.is_admin());

-- --- bookings ---------------------------------------------------------

alter table bookings enable row level security;

-- Un utilisateur ne voit que ses propres réservations.
create policy "bookings_select_own"
  on bookings for select
  using (auth.uid() = user_id);

-- USING : la ligne existante doit appartenir à l'utilisateur.
-- WITH CHECK : la ligne résultante doit aussi lui appartenir
-- (empêche de réattribuer une réservation à quelqu'un d'autre).
create policy "bookings_insert_own"
  on bookings for insert
  with check (auth.uid() = user_id);

create policy "bookings_update_own"
  on bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "bookings_delete_own"
  on bookings for delete
  using (auth.uid() = user_id);

-- --- profiles ---------------------------------------------------------

alter table profiles enable row level security;

-- Chacun ne voit que son propre profil.
create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

-- Chacun ne peut modifier que son propre profil.
create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Pas de policy INSERT : le trigger handle_new_user() s'en charge
-- avec security definer, donc hors RLS.
-- Pas de policy DELETE : la cascade depuis auth.users s'en charge.
