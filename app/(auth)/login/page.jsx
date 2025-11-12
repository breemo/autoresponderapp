'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    console.log('🔹 Trying login with:', email)

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) {
      console.error('❌ Login error:', loginError)
      setError('خطأ في تسجيل الدخول: ' + loginError.message)
      setLoading(false)
      return
    }

    console.log('✅ Login success, checking role...')

    const { data: userData, error: userError } = await supabase
      .from('users') // تأكدنا نستخدم الجدول الصحيح
      .select('role')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      console.error('⚠️ User not found in users table:', userError)
      setError('الحساب غير موجود في قاعدة البيانات أو غير مفعّل.')
      setLoading(false)
      return
    }

    console.log('🔸 User role:', userData.role)

    if (userData.role === 'admin') {
      setSuccess('تسجيل دخول كأدمن ✅')
      router.push('/admin')
    } else if (userData.role === 'client') {
      setSuccess('تسجيل دخول كعميل ✅')
      router.push('/client')
    } else {
      setError('لا توجد صلاحية صالحة لهذا الحساب.')
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Auto Responder Login</h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {success && <p className="text-green-600 text-center mb-3">{success}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
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
