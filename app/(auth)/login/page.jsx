'use client';
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim())
      .maybeSingle()

    console.log('USER:', data, 'ERROR:', error)

    if (error || !data) {
      setMessage('❌ المستخدم غير موجود')
      return
    }

    if (data.password?.trim() !== password.trim()) {
      setMessage('❌ كلمة المرور غير صحيحة')
      return
    }

    localStorage.setItem('user', JSON.stringify(data))

    // ✅ بدل router.push نستخدم redirect
    if (data.role === 'admin') {
      console.log('redirecting to /admin...')
      window.location.assign('/admin')
    } else {
      console.log('redirecting to /client...')
      window.location.assign('/client')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white shadow-md rounded-lg px-8 py-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Auto Responder Login</h2>

        {message && (
          <p className="text-center mb-3 font-semibold text-green-600">{message}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  )
}
