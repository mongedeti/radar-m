'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Header() {

  const router = useRouter()
  const [email, setEmail] = useState('')
  
  useEffect(() => {
  loadUser()
}, [])

async function loadUser() {

  const { data } = await supabase.auth.getUser()

  if (data.user) {
    setEmail(data.user.email || '')
  }

}


  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (

    <header className="border-b bg-white">

      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">

        <div className="flex items-center gap-6">

          <Link href="/dashboard" className="font-bold text-lg">
            Radar M
          </Link>

          <nav className="flex gap-4 text-sm">

            <Link href="/dashboard">
              Dashboard
            </Link>

            <Link href="/equipments">
              Equipamentos
            </Link>

            <Link
              href="/equipments/new"
              className="text-blue-600"
            >
              + Equipamento
            </Link>

          </nav>

        </div>

        <div className="flex items-center gap-4">

          <span className="text-sm">
             {email}
          </span>

          <button
            onClick={handleLogout}
            className="text-red-500 text-sm"
          >
            Sair
          </button>

        </div>

      </div>

    </header>

  )
}