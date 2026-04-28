'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SignupPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (!error) {
      window.location.href = '/dashboard'
    } else {
      alert('Erro ao criar conta')
    }
  }

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-title">Radar C</div>
        <div className="auth-subtitle">
          Crie sua conta gratuita
        </div>

        <form onSubmit={handleSignup}>

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
            Criar conta
          </button>

        </form>

        <div className="auth-footer">
          Já tem conta? <a href="/login">Entrar</a>
        </div>

      </div>

    </div>
  )
}
