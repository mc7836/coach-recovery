import { notFound } from 'next/navigation'
import { getPatient } from '@/lib/db'
import { updatePatient } from '@/app/actions'
import PatientForm from '@/app/ui/patient-form'

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = await getPatient(id)
  if (!patient) notFound()

  const boundAction = updatePatient.bind(null, id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <a
          href={`/patients/${id}`}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← {patient.name}
        </a>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Edit Patient</h1>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <PatientForm
          action={boundAction}
          patient={patient}
          submitLabel="Save changes"
          pendingLabel="Saving..."
        />
      </div>
    </div>
  )
}
