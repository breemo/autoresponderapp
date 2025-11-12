'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        alert('❌ خطأ في تسجيل الدخول: ' + loginError.message)
        setLoading(false)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        alert('⚠️ المستخدم غير موجود في قاعدة البيانات')
        setLoading(false)
        return
      }

      alert(`✅ تم تسجيل الدخول كـ ${userData.role}`)

      // ✅ استخدم router بدل window.location
      if (userData.role === 'admin') {
        router.push('/admin')
      } else if (userData.role === 'client') {
        router.push('/client')
      }
    } catch (err) {
      alert('حدث خطأ غير متوقع')
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Auto Responder Login</h2>

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
