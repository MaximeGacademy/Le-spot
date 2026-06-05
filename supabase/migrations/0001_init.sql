-- =====================================================================
--  Le Spot · schéma initial
--  Réservation de terrains de padel (support pédagogique J3-J4).
-- =====================================================================

-- --- profiles -------------------------------------------------------
-- Une ligne par utilisateur. On y range le rôle (client / admin).
-- Liée à auth.users : si le compte est supprimé, le profil l'est aussi.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'client' check (role in ('client','admin')),
  created_at timestamptz not null default now()
);

-- --- courts ---------------------------------------------------------
-- Les terrains. Les "énumérations" (type, format) sont du texte + un CHECK
-- plutôt qu'un type ENUM Postgres : migrations plus simples, valeurs lisibles.
create table courts (
  id bigint generated always as identity primary key,
  name text not null,
  type text not null check (type in ('indoor','outdoor')),
  format text not null check (format in ('simple','double')),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- --- bookings -------------------------------------------------------
-- Une réservation = un terrain, un utilisateur, une date, une heure de début.
-- Un créneau = le triplet (court_id, date, start_hour).
create table bookings (
  id bigint generated always as identity primary key,
  court_id bigint not null references courts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  start_hour int not null check (start_hour between 9 and 21),
  status text not null default 'confirmee' check (status in ('confirmee','annulee')),
  created_at timestamptz not null default now()
);

-- Index pour la requête principale (le planning d'un jour).
create index bookings_court_date_idx on bookings (court_id, date);

-- --- création automatique du profil à l'inscription -----------------
-- Quand un compte est créé dans auth.users, on crée le profil correspondant.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
--  NB (formateur) : la RLS n'est volontairement PAS activée ici.
--  Voir cours/notes-formateur.md. C'est une faiblesse assumée pour J5-J6.
-- =====================================================================
