'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Equipment = {
  id: string
  name: string
  location: string | null
  created_at: string
}

export default function EquipmentsPage() {

  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEquipments()
  }, [])

  async function loadEquipments() {

    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    if (data) {
      setEquipments(data)
    }

    setLoading(false)
  }

  async function handleAddEquipment(e: React.FormEvent) {
    e.preventDefault()

    if (!name) return

    const { data, error } = await supabase
      .from('equipments')
      .insert([
        {
          name,
          location
        }
      ])
      .select()

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setEquipments(prev => [...data, ...prev])
    }

    setName('')
    setLocation('')
  }

  if (loading) {
    return <div className="container">Carregando...</div>
  }

  return (
    <div className="container">

      <h1 className="page-title">Equipamentos</h1>

      <p style={{ marginBottom: 24, opacity: 0.7 }}>
        Cadastre e acompanhe os equipamentos que precisam de manutenção.
      </p>

      {/* FORM */}

      <form
        onSubmit={handleAddEquipment}
        style={{
          marginBottom: 30,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap'
        }}
      >

        <input
          placeholder="Nome do equipamento"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8 }}
        />

        <input
          placeholder="Localização"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ padding: 8 }}
        />

        <button className="btn btn-primary">
          Adicionar
        </button>

      </form>

      {/* LISTA */}

      <ul className="client-list">

        {equipments.map(equipment => (

          <li key={equipment.id} className="client-card">

            <div>
              <strong>{equipment.name}</strong>

              {equipment.location && (
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {equipment.location}
                </div>
              )}
            </div>

          </li>

        ))}

      </ul>

    </div>
  )
}