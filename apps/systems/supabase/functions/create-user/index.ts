import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { email, password, nom, role, studentId } = await req.json()

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    let userId: string

    if (existingUser) {
      // User exists — update role/profile instead of failing
      userId = existingUser.id

      if (role) {
        // Upsert role
        const { data: existingRole } = await supabaseAdmin
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .eq('role', role)
          .maybeSingle()

        if (!existingRole) {
          await supabaseAdmin.from('user_roles').insert({ user_id: userId, role })
        }
        await supabaseAdmin.from('profiles').update({ nom, role }).eq('id', userId)
      }

      if (studentId) {
        await supabaseAdmin.from('students').update({ user_id: userId }).eq('id', studentId)
        await supabaseAdmin.from('profiles').update({ nom }).eq('id', userId)
      }

      return new Response(JSON.stringify({ user: existingUser, existing: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create new user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nom }
    })

    if (userError) throw userError
    userId = userData.user.id

    if (role) {
      await supabaseAdmin.from('user_roles').insert({ user_id: userId, role })
      await supabaseAdmin.from('profiles').update({ nom, role }).eq('id', userId)
    }

    if (studentId) {
      await supabaseAdmin.from('students').update({ user_id: userId }).eq('id', studentId)
      await supabaseAdmin.from('profiles').update({ nom }).eq('id', userId)
    }

    return new Response(JSON.stringify({ user: userData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
