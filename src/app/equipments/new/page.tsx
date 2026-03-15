'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function NewEquipment() {

  const router = useRouter()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [intervalDays, setIntervalDays] = useState(30)
  const [lastMaintenance, setLastMaintenance] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      router.push('/login')
      return
    }

    const userId = userData.user.id

    // criar equipamento
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipments')
      .insert({
        name,
        location,
        user_id: userId
      })
      .select()
      .single()

    if (equipmentError) {
      alert('Erro ao criar equipamento')
      setLoading(false)
      return
    }

    // calcular próxima manutenção
    const lastDate = new Date(lastMaintenance)
    const nextDate = new Date(lastDate)
    nextDate.setDate(nextDate.getDate() + intervalDays)

    // criar plano de manutenção
    const { error: planError } = await supabase
      .from('maintenance_plans')
      .insert({
        equipment_id: equipment.id,
        interval_days: intervalDays,
        last_maintenance: lastMaintenance,
        next_maintenance: nextDate.toISOString(),
        user_id: userId
      })

    if (planError) {
      alert('Erro ao criar plano de manutenção')
      setLoading(false)
      return
    }

    router.push('/equipments')

  }

  return (

    <div className="max-w-xl">

      <h1 className="text-2xl font-semibold mb-6">
        Novo Equipamento
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          type="text"
          placeholder="Nome do equipamento"
          className="w-full border p-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Localização"
          className="w-full border p-2"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />

        <div>
          <label className="text-sm">
            Intervalo de manutenção (dias)
          </label>

          <input
            type="number"
            className="w-full border p-2"
            value={intervalDays}
            onChange={e => setIntervalDays(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="text-sm">
            Última manutenção
          </label>

          <input
            type="date"
            className="w-full border p-2"
            value={lastMaintenance}
            onChange={e => setLastMaintenance(e.target.value)}
            required
          />
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>

      </form>

    </div>

  )
}
