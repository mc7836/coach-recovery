import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Disclaimer · Stroke Recovery Coach',
}

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'Not a substitute for professional medical care',
    body: 'This app is an educational and organizational tool. It does not provide medical advice, diagnosis, or treatment, and it is not a substitute for care from a licensed physician, physical therapist, or other qualified healthcare professional. Always seek the guidance of your healthcare provider with any questions about a medical condition or recovery program.',
  },
  {
    heading: 'Plans are suggestions only — not clinical prescriptions',
    body: 'Both the AI-generated plans and the algorithm-matched plans in this app are automated suggestions intended for general guidance. They are not clinical prescriptions and have not been reviewed or approved by a licensed physical therapist. Do not treat them as a personalized treatment plan. Confirm any exercise, intensity, or progression with your PT before acting on it.',
  },
  {
    heading: 'Not HIPAA-compliant',
    body: 'Data you enter is stored in a standard database and is not handled in a HIPAA-compliant manner. This app is intended for personal or family use only. Do not enter real patient protected health information (PHI) or use it to manage care for third parties in a professional capacity.',
  },
  {
    heading: 'Not for emergencies',
    body: 'This app is not for emergency use. If you or someone else is experiencing a medical emergency — including signs of a stroke such as sudden facial drooping, arm weakness, or difficulty speaking — call 911 or your local emergency services immediately.',
  },
  {
    heading: 'You assume responsibility for your care decisions',
    body: 'By using this app you acknowledge that you are responsible for consulting your healthcare provider before starting, changing, or stopping any exercise program. You use the information and suggestions provided at your own risk.',
  },
]

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Disclaimer &amp; Terms</h1>
        <p className="text-slate-500 mt-1">
          Please read this carefully before using the app.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {SECTIONS.map((s) => (
          <section key={s.heading} className="p-6">
            <h2 className="font-semibold text-slate-900">{s.heading}</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          If this is a medical emergency, stop and call 911 (or your local
          emergency number) now.
        </p>
      </div>

      <Link href="/" className="inline-block text-sm text-blue-600 hover:underline">
        ← Back
      </Link>
    </div>
  )
}
