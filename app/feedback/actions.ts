'use server'

import { createClient } from '@/lib/supabase/server'

export type FeedbackState = { success?: boolean; error?: string } | undefined

export async function submitFeedback(
  _prev: FeedbackState,
  formData: FormData
): Promise<FeedbackState> {
  const message = (formData.get('message') as string | null)?.trim()
  const email = (formData.get('email') as string | null)?.trim() || null

  if (!message) return { error: 'Message is required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('feedback').insert({
    user_id: user?.id ?? null,
    message,
    email,
  })

  if (error) return { error: 'Something went wrong. Please try again.' }
  return { success: true }
}
