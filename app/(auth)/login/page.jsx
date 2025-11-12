'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRole(null)

    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        setError('خطأ في تسجيل الدخول: ' + loginError.message)
        setLoading(false)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        setError('الحساب غير موجود في قاعدة البيانات.')
        setLoading(false)
        return
      }

      setRole(userData.role) // نخزن الدور لنستخدمه في useEffect
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError('حدث خطأ غير متوقع.')
      setLoading(false)
    }
  }

  // 👇 التوجيه يحدث هنا بمجرد تغيير role
  useEffect(() => {
    if (!role) return
    if (role === 'admin') router.replace('/admin')
    if (role === 'client') router.replace('/client')
  }, [role, router])

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Auto Responder Login</h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {role && <p className="text-green-600 text-center mb-3">تسجيل دخول كـ{role === 'admin' ? ' أدمن ✅' : ' عميل ✅'}</p>}

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
