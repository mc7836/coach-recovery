'use client'

import { deletePatient } from '@/app/actions'
import { useState } from 'react'

export default function DeletePatientButton({
  patientId,
  patientName,
}: {
  patientId: string
  patientName: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = confirm(`Delete patient "${patientName}"? This cannot be undone.`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deletePatient(patientId)
    } catch (err) {
      alert('Error deleting patient.')
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-sm text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
    >
      {isDeleting ? 'Deleting…' : 'Delete patient'}
    </button>
  )
}