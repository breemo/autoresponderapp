'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AddClient() {
  const [form, setForm] = useState({
    email: '',
    business_name: '',
    plan_id: '',
    bot_token: '',
    chat_id: '',
    sheet_url: ''
  })
  const [msg, setMsg] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('clients').insert([
      {
        email: form.email,
        business_name: form.business_name,
        plan_id: form.plan_id
      }
    ])
    setMsg(error ? '❌ ' + error.message : '✅ Client added successfully!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Add New Client</h2>
        {['email', 'business_name', 'plan_id', 'bot_token', 'chat_id', 'sheet_url'].map((f) => (
          <input
            key={f}
            name={f}
            placeholder={f}
            onChange={handleChange}
            className="border p-2 mb-2 w-full rounded"
          />
        ))}
        <button className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700">
          Save
        </button>
        {msg && <p className="mt-2 text-center">{msg}</p>}
      </form>
    </div>
  )
}
