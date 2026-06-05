import { getPatients } from '@/lib/db'
import AddPatientForm from '@/app/ui/add-patient-form'
import Link from 'next/link'

export default async function HomePage() {
  const patients = await getPatients()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
        <p className="text-slate-500 mt-1">Select a patient to view their dashboard or log a workout.</p>
      </div>

      {patients.length === 0 ? (
        <p className="text-slate-400 italic">No patients yet. Add one below.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {patient.name}
                  </p>
                  {patient.notes && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{patient.notes}</p>
                  )}
                </div>
                <span className="text-slate-300 group-hover:text-blue-400 transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Add Patient</h2>
        <AddPatientForm />
      </div>
    </div>
  )
}
