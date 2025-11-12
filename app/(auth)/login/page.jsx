'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (loginError) {
      setMessage('❌ خطأ في تسجيل الدخول: ' + loginError.message)
      setLoading(false)
      return
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      setMessage('⚠️ المستخدم غير موجود في قاعدة البيانات')
      setLoading(false)
      return
    }

    const role = userData.role
    setMessage(`✅ تم تسجيل الدخول كـ ${role}`)

    // ✅ دالة تحول للمسار الصحيح بناءً على موقع الصفحة الحالي
    const goTo = (path) => {
      const base = window.location.origin
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      window.location.assign(`${base}${normalizedPath}`)
    }

    setTimeout(() => {
      if (role === 'admin') {
        console.log('➡️ redirecting to /admin...')
        goTo('admin')
      } else if (role === 'client') {
        console.log('➡️ redirecting to /client...')
        goTo('client')
      }
    }, 800)

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Auto Responder Login</h2>

        {message && (
          <p
            className={`mb-4 text-center ${
              message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}

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
