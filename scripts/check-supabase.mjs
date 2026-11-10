// Checagem do banco do formulário: lê o .env, confirma as tabelas, a função de
// rate limit e a permissão de inserir — e apaga o registro de teste em seguida.
// Uso: node scripts/check-supabase.mjs
// Nunca imprime a chave. Roda só na sua máquina.
import { createClient } from '@supabase/supabase-js'

try {
  process.loadEnvFile('.env')
} catch {
  console.error('✗ .env não encontrado. Copie .env.example para .env e preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key || url.includes('SEU-PROJETO')) {
  console.error('✗ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ainda não preenchidos no .env.')
  process.exit(1)
}
if (!key.startsWith('eyJ') && !key.startsWith('sb_secret_')) {
  console.warn('! A chave não parece ser uma service_role (JWT "eyJ..." ou "sb_secret_..."). Confira em Settings → API.')
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
let failed = false
const ok = (msg) => console.log('✓', msg)
const fail = (msg, err) => {
  failed = true
  console.error('✗', msg, err ? `→ ${err.message ?? err}` : '')
}

// 1. Tabela contact_submissions acessível com service_role
{
  const { error, count } = await supabase.from('contact_submissions').select('id', { count: 'exact', head: true })
  if (error) fail('tabela contact_submissions (rode a migração em supabase/migrations/0001_contact_submissions.sql)', error)
  else ok(`tabela contact_submissions acessível (${count ?? 0} mensagens guardadas)`)
}

// 2. Função de rate limit
{
  const hash = 'healthcheck-' + Date.now().toString(16)
  const { data, error } = await supabase.rpc('claim_contact_attempt', { p_email_hash: hash, p_limit: 5 })
  if (error) fail('função claim_contact_attempt', error)
  else if (data !== true) fail(`claim_contact_attempt devolveu ${JSON.stringify(data)} (esperado true)`)
  else ok('função claim_contact_attempt responde')
  await supabase.from('contact_rate_limits').delete().eq('email_hash', hash)
}

// 3. Inserir e apagar um registro de teste (prova que o insert funciona)
{
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert({ name: 'healthcheck', email: 'healthcheck@example.com', message: 'registro de teste — pode apagar' })
    .select('id')
    .single()
  if (error || !data) fail('insert em contact_submissions', error)
  else {
    const { error: delError } = await supabase.from('contact_submissions').delete().eq('id', data.id)
    if (delError) fail(`apagar registro de teste ${data.id} (apague manualmente no Table Editor)`, delError)
    else ok('insert + delete do registro de teste funcionaram')
  }
}

// 4. Garantia de segurança: a chave anônima NÃO pode ler as mensagens.
//    (só roda se você colocar SUPABASE_ANON_KEY no .env — opcional)
const anon = process.env.SUPABASE_ANON_KEY
if (anon) {
  const pub = createClient(url, anon, { auth: { persistSession: false } })
  const { data, error } = await pub.from('contact_submissions').select('id').limit(1)
  if (!error && Array.isArray(data) && data.length > 0) fail('A CHAVE ANÔNIMA CONSEGUE LER MENSAGENS — revise a RLS/grants da migração!')
  else ok('chave anônima não lê as mensagens (RLS ok)')
}

console.log(failed ? '\nAlgo falhou. Corrija antes de publicar.' : '\nTudo certo: o formulário vai funcionar com estas credenciais.')
process.exit(failed ? 1 : 0)
