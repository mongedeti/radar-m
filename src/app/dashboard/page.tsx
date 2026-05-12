'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Equipment = {
  id: string
  name: string
  location: string | null
  maintenance_interval_months: number
  last_maintenance_at: string | null
  created_at: string
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Nenhuma manutenção registrada'

  const date = new Date(dateString)

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getNextMaintenanceDate(
  lastMaintenance: string | null,
  intervalMonths: number
) {
  if (!lastMaintenance) return null

  const date = new Date(lastMaintenance)

  date.setMonth(date.getMonth() + intervalMonths)

  return date
}

function getMaintenanceStatus(
  lastMaintenance: string | null,
  intervalMonths: number
) {
  if (!lastMaintenance) return 'risco'

  const nextMaintenance = getNextMaintenanceDate(
    lastMaintenance,
    intervalMonths
  )

  if (!nextMaintenance) return 'risco'

  const today = new Date()

  const diff =
    (nextMaintenance.getTime() - today.getTime()) /
    (1000 * 60 * 60 * 24)

  if (diff < 0) return 'risco'

  if (diff <= 7) return 'atenção'

  return 'saudável'
}

function getPriorityScore(
  lastMaintenance: string | null,
  intervalMonths: number
) {
  const status = getMaintenanceStatus(
    lastMaintenance,
    intervalMonths
  )

  if (status === 'risco') return 0
  if (status === 'atenção') return 1

  return 2
}

export default function Dashboard() {

  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnlyRisk, setShowOnlyRisk] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) return

    setUserEmail(userData.user.email ?? null)

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

  async function handleRegisterMaintenance(
    equipmentId: string
  ) {

    const now = new Date().toISOString()

    const { error } = await supabase
      .from('equipments')
      .update({
        last_maintenance_at: now
      })
      .eq('id', equipmentId)

    if (!error) {

      setEquipments(prev =>
        prev.map(eq =>
          eq.id === equipmentId
            ? {
                ...eq,
                last_maintenance_at: now
              }
            : eq
        )
      )
    }
  }

  if (loading) {
    return (
      <div className="container">
        Carregando...
      </div>
    )
  }

  const risco = equipments.filter(
    e =>
      getMaintenanceStatus(
        e.last_maintenance_at,
        e.maintenance_interval_months
      ) === 'risco'
  ).length

  const atencao = equipments.filter(
    e =>
      getMaintenanceStatus(
        e.last_maintenance_at,
        e.maintenance_interval_months
      ) === 'atenção'
  ).length

  const saudavel = equipments.filter(
    e =>
      getMaintenanceStatus(
        e.last_maintenance_at,
        e.maintenance_interval_months
      ) === 'saudável'
  ).length

  const sortedEquipments = [...equipments].sort(
    (a, b) => {

      const priorityDiff =
        getPriorityScore(
          a.last_maintenance_at,
          a.maintenance_interval_months
        ) -
        getPriorityScore(
          b.last_maintenance_at,
          b.maintenance_interval_months
        )

      if (priorityDiff !== 0) {
        return priorityDiff
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      )
    }
  )

  const filteredEquipments = showOnlyRisk
    ? sortedEquipments.filter(
        e =>
          getMaintenanceStatus(
            e.last_maintenance_at,
            e.maintenance_interval_months
          ) === 'risco'
      )
    : sortedEquipments

  return (
    <div className="container">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1 className="page-title">
            Radar M
          </h1>

          <div className="user-info">
            Painel de manutenção
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>

          <div
            style={{
              fontSize: 12,
              marginBottom: 6
            }}
          >
            {userEmail}
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleLogout}
          >
            Sair
          </button>

        </div>

      </div>

      {/* FRASE */}

      <div style={{ marginBottom: 24 }}>

        <h2 style={{ marginBottom: 6 }}>
          Equipamentos bem mantidos evitam prejuízos.
        </h2>

        <p style={{ opacity: 0.7 }}>
          O Radar M mostra quais equipamentos
          precisam de manutenção antes do problema acontecer.
        </p>

      </div>

      {/* ALERTA */}

      {risco > 0 && (

        <div
          style={{
            background: '#ffe5e5',
            border: '1px solid #ffb3b3',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            fontWeight: 500,
          }}
        >
          ⚠️ Você possui {risco} equipamento(s)
          em risco de manutenção atrasada.
        </div>

      )}

      {/* BOTÃO */}

      <div style={{ marginBottom: 24 }}>

        <a href="/equipments">

          <button className="btn btn-primary">
            + Adicionar Equipamento
          </button>

        </a>

      </div>

      {/* MÉTRICAS */}

      <div className="metrics-grid">

        <div className="metric-card metric-risk">

          <div className="metric-title">

            <span className="metric-dot dot-risk"></span>

            Em Risco

          </div>

          <div className="metric-value">
            {risco}
          </div>

        </div>

        <div className="metric-card metric-warning">

          <div className="metric-title">

            <span className="metric-dot dot-warning"></span>

            Atenção

          </div>

          <div className="metric-value">
            {atencao}
          </div>

        </div>

        <div className="metric-card metric-healthy">

          <div className="metric-title">

            <span className="metric-dot dot-healthy"></span>

            Saudáveis

          </div>

          <div className="metric-value">
            {saudavel}
          </div>

        </div>

        <div className="metric-card metric-info">

          <div className="metric-title">

            <span className="metric-dot dot-info"></span>

            Equipamentos

          </div>

          <div className="metric-value">
            {equipments.length}
          </div>

        </div>

      </div>

      {/* FILTRO */}

      <div style={{ marginBottom: 20 }}>

        <button
          onClick={() =>
            setShowOnlyRisk(!showOnlyRisk)
          }
          className={`btn ${
            showOnlyRisk
              ? 'btn-danger'
              : 'btn-secondary'
          }`}
        >
          {showOnlyRisk
            ? 'Mostrando apenas equipamentos em risco'
            : 'Mostrar apenas equipamentos em risco'}
        </button>

      </div>

      {/* LISTA */}

      <ul className="client-list">

        {filteredEquipments.map(equipment => {

          const status = getMaintenanceStatus(
            equipment.last_maintenance_at,
            equipment.maintenance_interval_months
          )

          const badgeClass =
            status === 'risco'
              ? 'badge badge-risk'
              : status === 'atenção'
              ? 'badge badge-warning'
              : 'badge badge-healthy'

          const nextMaintenance =
            getNextMaintenanceDate(
              equipment.last_maintenance_at,
              equipment.maintenance_interval_months
            )

          return (

            <li
              key={equipment.id}
              className="client-card"
            >

              <div>

                <strong>
                  {equipment.name}
                </strong>

                {equipment.location && (

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      opacity: 0.7,
                    }}
                  >
                    {equipment.location}
                  </div>

                )}

                <div style={{ marginTop: 6 }}>

                  <span className={badgeClass}>
                    {status.toUpperCase()}
                  </span>

                </div>

              </div>

              <div style={{ textAlign: 'right' }}>

                <button
                  onClick={() =>
                    handleRegisterMaintenance(
                      equipment.id
                    )
                  }
                  className="btn btn-primary"
                >
                  Registrar manutenção
                </button>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    opacity: 0.7,
                  }}
                >
                  Última manutenção:
                  {' '}
                  {formatDate(
                    equipment.last_maintenance_at
                  )}
                </div>

                {nextMaintenance && (

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      opacity: 0.7,
                    }}
                  >
                    Próxima revisão:
                    {' '}
                    {formatDate(
                      nextMaintenance.toISOString()
                    )}
                  </div>

                )}

              </div>

            </li>

          )
        })}

      </ul>

    </div>
  )
}
