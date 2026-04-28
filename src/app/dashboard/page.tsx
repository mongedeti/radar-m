'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Equipment = {
  id: string
  name: string
  location: string | null
  created_at: string
}

type MaintenanceItem = {
  id: string
  next_maintenance: string
  equipments: {
    name: string
    location: string | null
  }[]
}

function formatDate(dateString: string) {
  const date = new Date(dateString)

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function Dashboard() {

  const [equipmentsCount, setEquipmentsCount] = useState(0)
  const [overdue, setOverdue] = useState<MaintenanceItem[]>([])
  const [upcoming, setUpcoming] = useState<MaintenanceItem[]>([])
  const [loading, setLoading] = useState(true)
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

    const today = new Date()

    // total equipamentos
    const { count } = await supabase
      .from('equipments')
      .select('*', { count: 'exact', head: true })

    if (count) setEquipmentsCount(count)

    // manutenções
	const { data, error } = await supabase
	  .from('maintenance_plans')
	  .select(`
		id,
		next_maintenance,
		equipments (
		  name,
		  location
		)
	  `)

	if (error) {
	  console.error(error)
	  setLoading(false)
	  return
	}

    if (!data) return

    const overdueList = data.filter(item =>
      new Date(item.next_maintenance) < today
    )

    const upcomingList = data.filter(item => {

      const next = new Date(item.next_maintenance)
      const diff = (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)

      return diff >= 0 && diff <= 7
    })

    setOverdue(overdueList)
    setUpcoming(upcomingList)

    setLoading(false)
  }

  if (loading) return <div className="container">Carregando...</div>

  return (
    <div className="container">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1 className="page-title">Radar M</h1>
          <div className="user-info">Painel de Manutenção</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, marginBottom: 6 }}>
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

      {/* FRASE DE IMPACTO */}

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 6 }}>
          Equipamentos bem mantidos evitam problemas.
        </h2>
        <p style={{ opacity: 0.7 }}>
          O Radar M mostra quais manutenções precisam de atenção agora.
        </p>
      </div>

      {/* ALERTA */}

      {overdue.length > 0 && (
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
          ⚠️ Você tem {overdue.length} manutenção(ões) atrasadas.
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

        <div className="metric-card metric-info">
          <div className="metric-title">
            Equipamentos
          </div>
          <div className="metric-value">{equipmentsCount}</div>
        </div>

        <div className="metric-card metric-risk">
          <div className="metric-title">
            Atrasadas
          </div>
          <div className="metric-value">{overdue.length}</div>
        </div>

        <div className="metric-card metric-warning">
          <div className="metric-title">
            Próximas
          </div>
          <div className="metric-value">{upcoming.length}</div>
        </div>

      </div>

      {/* MANUTENÇÕES ATRASADAS */}

      {overdue.length > 0 && (
        <>
          <h3 style={{ marginTop: 40, marginBottom: 16 }}>
            🔴 Manutenções atrasadas
          </h3>

          <ul className="client-list">

            {overdue.map(item => (

              <li key={item.id} className="client-card">

                <div>
                  <strong>{item.equipments.name}</strong>

                  {item.equipments.location && (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {item.equipments.location}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-risk">
                    ATRASADO
                  </span>

                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    {formatDate(item.next_maintenance)}
                  </div>
                </div>

              </li>

            ))}

          </ul>
        </>
      )}

      {/* MANUTENÇÕES PRÓXIMAS */}

      {upcoming.length > 0 && (
        <>
          <h3 style={{ marginTop: 40, marginBottom: 16 }}>
            🟡 Próximas manutenções
          </h3>

          <ul className="client-list">

            {upcoming.map(item => (

              <li key={item.id} className="client-card">

                <div>
                  <strong>{item.equipments.name}</strong>

                  {item.equipments.location && (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {item.equipments.location}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-warning">
                    EM BREVE
                  </span>

                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    {formatDate(item.next_maintenance)}
                  </div>
                </div>

              </li>

            ))}

          </ul>
        </>
      )}

    </div>
  )
}
