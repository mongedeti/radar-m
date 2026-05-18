'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Equipment = {
  id: string
  name: string
  location: string | null
  maintenance_interval_months: number
  created_at: string
}

function sanitizeInput(value: string) {

  return value
    .replace(/[^\p{L}\p{N}\s\-.,()/]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isValidInput(value: string) {

  const forbiddenPatterns = [
    /--/,
    /;/,
    /\/\*/,
    /\*\//,
    /xp_/i,
    /drop\s+/i,
    /select\s+/i,
    /insert\s+/i,
    /delete\s+/i,
    /update\s+/i,
    /or\s+1=1/i,
    /union\s+/i
  ]

  return !forbiddenPatterns.some(pattern => pattern.test(value))
}

export default function EquipmentsPage() {

  const router = useRouter()

  const [equipments, setEquipments] = useState<Equipment[]>([])

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [interval, setInterval] = useState('3')

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

    const sanitizedName = sanitizeInput(name)
    const sanitizedLocation = sanitizeInput(location)

    if (!sanitizedName) {
      alert('Informe o nome do equipamento')
      return
    }

    if (
      !isValidInput(sanitizedName) ||
      !isValidInput(sanitizedLocation)
    ) {
      alert('Caracteres inválidos detectados.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('equipments')
      .insert([
        {
          name: sanitizedName,
          location: sanitizedLocation,
          maintenance_interval_months: Number(interval),
          user_id: userData.user?.id
        }
      ])
      .select()

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    if (data) {
      setEquipments(prev => [...data, ...prev])
    }

    setName('')
    setLocation('')
    setInterval('3')
  }

  function getIntervalLabel(months: number) {

    switch (months) {
      case 1:
        return 'Mensal'

      case 2:
        return 'Bimestral'

      case 3:
        return 'Trimestral'

      case 6:
        return 'Semestral'

      case 12:
        return 'Anual'

      default:
        return `${months} meses`
    }
  }

  if (loading) {
    return <div className="container">Carregando...</div>
  }

  return (
    <div className="container">

      {/* TOPO */}

      <div className="page-header">

        <button
          className="btn btn-secondary"
          onClick={() => router.push('/dashboard')}
        >
          ← Dashboard
        </button>

      </div>

      {/* TÍTULO */}

      <h1 className="page-title">Equipamentos</h1>

      <p style={{ marginBottom: 24, opacity: 0.7 }}>
        Cadastre e acompanhe os equipamentos que precisam de manutenção preventiva.
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
          maxLength={50}
          onChange={(e) =>
            setName(sanitizeInput(e.target.value))
          }
          style={{ padding: 8 }}
        />

        <input
          placeholder="Localização"
          value={location}
          maxLength={50}
          onChange={(e) =>
            setLocation(sanitizeInput(e.target.value))
          }
          style={{ padding: 8 }}
        />

        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          style={{ padding: 8 }}
        >

          <option value="1">Mensal</option>
          <option value="2">Bimestral</option>
          <option value="3">Trimestral</option>
          <option value="6">Semestral</option>
          <option value="12">Anual</option>

        </select>

        <button
          type="submit"
          className="btn btn-primary"
        >
          Adicionar
        </button>

      </form>

      {/* LISTA */}

      <ul className="client-list">

        {equipments.map(equipment => (

          <li
            key={equipment.id}
            className="client-card"
          >

            <div>

              <strong>{equipment.name}</strong>

              {equipment.location && (
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.7,
                    marginTop: 4
                  }}
                >
                  📍 {equipment.location}
                </div>
              )}

              <div
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginTop: 4
                }}
              >
                🔧 Revisão {getIntervalLabel(equipment.maintenance_interval_months)}
              </div>

            </div>

          </li>

        ))}

      </ul>

    </div>
  )
}
