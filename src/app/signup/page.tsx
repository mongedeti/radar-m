'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignupPage() {

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {

    e.preventDefault()

    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage('Conta criada! Verifique seu email.')
    setLoading(false)
  }

  return (

    <div className="flex items-center justify-center min-h-screen">

      <form
        onSubmit={handleSignup}
        className="border p-6 rounded w-full max-w-sm space-y-4"
      >

        <h1 className="text-xl font-semibold">
          Criar conta
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full border p-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-600 text-sm">
            {message}
          </p>
        )}

        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar conta'}
        </button>

        <p className="text-sm text-center">
          Já tem conta?{' '}
          <a
            href="/login"
            className="text-blue-600"
          >
            Entrar
          </a>
        </p>

      </form>

    </div>
  )
}