'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string; message?: string } | undefined

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string | null)?.trim()
  const password = formData.get('password') as string | null
  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  // Refresh the layout so the server re-reads the new session cookie.
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string | null)?.trim()
  const password = formData.get('password') as string | null
  const agreed = formData.get('agree') === 'on'
  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }
  // Enforce agreement server-side too — the checkbox alone isn't trustworthy.
  if (!agreed) {
    return { error: 'You must agree to the terms and disclaimer to create an account.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }

  // When email confirmation is enabled, sign-up returns no session — the user
  // must confirm before logging in. Otherwise they're signed in immediately.
  if (!data.session) {
    return {
      message: 'Account created. Check your email to confirm, then log in.',
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
