'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboard() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (error) setMessage('❌ Error fetching clients')
    else setClients(data)
    setLoading(false)
  }

  const toggleStatus = async (clientId, currentRole) => {
    const newRole = currentRole === 'disabled' ? 'client' : 'disabled'
    const { error } = await supabase.from('clients').update({ role: newRole }).eq('id', clientId)
    if (error) setMessage('❌ Error updating status')
    else {
      setMessage('✅ Updated successfully')
      fetchClients()
    }
  }

  const deleteClient = async (clientId) => {
    const { error } = await supabase.from('clients').delete().eq('id', clientId)
    if (error) setMessage('❌ Error deleting client')
    else {
      setMessage('🗑️ Client deleted')
      fetchClients()
    }
  }

  if (loading) return <div className="text-center p-10 text-gray-600">Loading clients...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {message && <p className="mb-4 text-center text-blue-600">{message}</p>}

      <table className="w-11/12 max-w-4xl bg-white rounded shadow border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Business Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Plan</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 && (
            <tr><td colSpan="5" className="text-center p-4 text-gray-400">No clients found.</td></tr>
          )}
          {clients.map(client => (
            <tr key={client.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{client.business_name}</td>
              <td className="p-2">{client.email}</td>
              <td className="p-2">{client.plan_id}</td>
              <td className={`p-2 font-semibold ${client.role === 'disabled' ? 'text-red-500' : 'text-green-600'}`}>
                {client.role}
              </td>
              <td className="p-2 flex justify-center gap-3">
                <button
                  onClick={() => toggleStatus(client.id, client.role)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  {client.role === 'disabled' ? 'Enable' : 'Disable'}
                </button>
                <button
                  onClick={() => deleteClient(client.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
