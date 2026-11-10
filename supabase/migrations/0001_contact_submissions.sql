-- Mensagens do formulário de contato.
-- Visitantes NÃO têm acesso algum (RLS ligada, sem policies, grants só para service_role).
-- A server function insere usando a chave service_role, que nunca vai ao navegador.

create extension if not exists pgcrypto;

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 1 and 255),
  message text not null check (char_length(message) between 1 and 3000),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;
revoke all on public.contact_submissions from anon, authenticated;
grant select, insert on public.contact_submissions to service_role;

-- Contadores de tentativas por hash de e-mail e janela de 1 hora.
-- Guardamos só o SHA-256 do e-mail normalizado, nunca o e-mail em si.
create table if not exists public.contact_rate_limits (
  email_hash text not null,
  window_start timestamptz not null,
  attempts integer not null default 0,
  primary key (email_hash, window_start)
);

alter table public.contact_rate_limits enable row level security;
revoke all on public.contact_rate_limits from anon, authenticated;
grant select, insert, update, delete on public.contact_rate_limits to service_role;

-- Reserva uma tentativa de forma ATÔMICA: o UPSERT incrementa e devolve
-- true só se, após incrementar, o total ainda está dentro do limite.
-- Duas requisições simultâneas não conseguem "passar juntas" pelo limite.
create or replace function public.claim_contact_attempt(p_email_hash text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz := date_trunc('hour', now());
  v_attempts integer;
begin
  insert into public.contact_rate_limits (email_hash, window_start, attempts)
  values (p_email_hash, v_window, 1)
  on conflict (email_hash, window_start)
  do update set attempts = public.contact_rate_limits.attempts + 1
  returning attempts into v_attempts;

  -- Limpeza oportunista de janelas antigas (mais de 1 dia)
  delete from public.contact_rate_limits where window_start < now() - interval '1 day';

  return v_attempts <= p_limit;
end;
$$;

revoke all on function public.claim_contact_attempt(text, integer) from public, anon, authenticated;
grant execute on function public.claim_contact_attempt(text, integer) to service_role;
