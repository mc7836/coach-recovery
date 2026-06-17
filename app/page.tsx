import { getPatients } from '@/lib/db'
import PatientForm from '@/app/ui/patient-form'
import { addPatient } from '@/app/actions'
import DeletePatientButton from '@/app/ui/delete-patient-button'
import Link from 'next/link'

export default async function HomePage() {
  const patients = await getPatients()
  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4 text-sm text-blue-900 leading-relaxed">
        <p className="font-semibold mb-1">Work in progress</p>
        <p>
          This app is in active development. The exercise-matching algorithm is currently being reviewed
          with physical therapists for clinical accuracy, and a library of short instructional videos
          for each exercise is coming soon. Feedback and suggestions are welcome —{' '}
          <a
            href="mailto:margaritajcf623@gmail.com"
            className="underline hover:text-blue-700 transition-colors font-medium"
          >
            email margaritajcf623@gmail.com
          </a>
          .
        </p>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
        <p className="text-slate-500 mt-1">Select a patient to view their dashboard or log a workout.</p>
      </div>
      {patients.length === 0 ? (
        <p className="text-slate-400 italic">No patients yet. Add one below.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all group relative"
            >
              <Link href={`/patients/${patient.id}`} className="block">
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
              <div className="mt-3 pt-3 border-t border-slate-100">
                <DeletePatientButton patientId={patient.id} patientName={patient.name} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Add Patient</h2>
        <PatientForm action={addPatient} submitLabel="Add Patient" pendingLabel="Adding..." />
      </div>
    </div>
  )
}