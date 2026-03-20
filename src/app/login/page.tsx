'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) {
      window.location.href = '/dashboard'
    } else {
      alert('Erro ao fazer login')
    }
  }

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-title">Radar M</div>
        <div className="auth-subtitle">
          Acesse sua conta
        </div>

        <form onSubmit={handleLogin}>

          <input
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-button">
            Entrar
          </button>

        </form>

        <div className="auth-footer">
          Não tem conta? <a href="/signup">Criar conta</a>
        </div>

      </div>

    </div>
  )
}