'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('🔹 Start login')
    setLoading(true)
    setError('')

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        console.error('❌ Auth error:', loginError)
        alert('خطأ في تسجيل الدخول: ' + loginError.message)
        setLoading(false)
        return
      }

      console.log('✅ Auth success, checking users table...')

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        console.error('⚠️ users query error:', userError)
        alert('الحساب غير موجود في قاعدة البيانات.')
        setLoading(false)
        return
      }

      console.log('🔸 User role:', userData.role)
      alert('✅ تم تسجيل الدخول كـ ' + userData.role)

      if (userData.role === 'admin') {
        console.log('➡️ redirect to /admin')
        window.location.href = '/admin'
      } else if (userData.role === 'client') {
        console.log('➡️ redirect to /client')
        window.location.href = '/client'
      } else {
        alert('⚠️ لا توجد صلاحية صالحة لهذا الحساب.')
      }
    } catch (err) {
      console.error('💥 unexpected error:', err)
      alert('حدث خطأ غير متوقع.')
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Auto Responder Login</h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '... جاري تسجيل الدخول' : 'Login'}
        </button>
      </form>
    </div>
  )
}
