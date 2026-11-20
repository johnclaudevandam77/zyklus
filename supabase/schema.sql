-- Zyklus – Backend für die Partner-Freigabe (Supabase, kostenloser Tarif)
-- In Supabase: SQL Editor → New query → diesen Inhalt einfügen → Run.
--
-- Sicherheitskonzept:
--  * Die App verschlüsselt alle Daten auf dem Gerät (AES-256-GCM). Der Schlüssel steckt
--    nur im Freigabe-Code und wird nie an den Server geschickt. Der Server speichert nur Chiffretext.
--  * Private Notizen werden gar nicht erst hochgeladen.
--  * Auf die Tabelle selbst gibt es keinen direkten Zugriff (RLS ohne Policies).
--    Zugriff nur über die drei Funktionen unten.
--  * Schreiben/Löschen erfordert ein Geheimnis, das nur das Gerät der Besitzerin kennt
--    (gespeichert als bcrypt-Hash).

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.shares (
  id                text primary key,
  owner_secret_hash text not null,
  payload           text not null,
  updated_at        timestamptz not null default now()
);

alter table public.shares enable row level security;
revoke all on public.shares from anon, authenticated;

-- Hochladen / Aktualisieren
create or replace function public.push_share(p_id text, p_secret text, p_payload text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  existing text;
begin
  if p_id is null or length(p_id) < 10 or length(p_id) > 64
     or p_secret is null or length(p_secret) < 20
     or p_payload is null or length(p_payload) > 2000000 then
    raise exception 'invalid';
  end if;

  select owner_secret_hash into existing from public.shares where id = p_id;

  if existing is null then
    insert into public.shares (id, owner_secret_hash, payload)
    values (p_id, crypt(p_secret, gen_salt('bf')), p_payload);
  elsif existing = crypt(p_secret, existing) then
    update public.shares set payload = p_payload, updated_at = now() where id = p_id;
  else
    raise exception 'forbidden';
  end if;
end;
$$;

-- Lesen (für Partner:in) – liefert nur den verschlüsselten Inhalt
create or replace function public.get_share(p_id text)
returns table (payload text, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select s.payload, s.updated_at from public.shares s where s.id = p_id;
$$;

-- Freigabe beenden
create or replace function public.delete_share(p_id text, p_secret text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  existing text;
begin
  select owner_secret_hash into existing from public.shares where id = p_id;
  if existing is null then return; end if;
  if existing = crypt(p_secret, existing) then
    delete from public.shares where id = p_id;
  else
    raise exception 'forbidden';
  end if;
end;
$$;

revoke all on function public.push_share(text, text, text) from public;
revoke all on function public.get_share(text) from public;
revoke all on function public.delete_share(text, text) from public;
grant execute on function public.push_share(text, text, text) to anon;
grant execute on function public.get_share(text) to anon;
grant execute on function public.delete_share(text, text) to anon;
