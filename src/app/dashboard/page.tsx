'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type MaintenanceItem = {
  next_maintenance: string
  equipments: {
    name: string
    location: string
  }
}

export default function Dashboard() {

  const router = useRouter()
  const [equipmentsCount, setEquipmentsCount] = useState(0)
  const [overdue, setOverdue] = useState<MaintenanceItem[]>([])
  const [upcoming, setUpcoming] = useState<MaintenanceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
  }, [])

  async function init() {

    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push('/login')
      return
    }

    setLoading(false)

    loadDashboard()
  }

  if (loading) {
    return <p>Carregando...</p>
  }

  async function loadDashboard() {

    // total de equipamentos
    const { count } = await supabase
      .from('equipments')
      .select('*', { count: 'exact', head: true })

    if (count) setEquipmentsCount(count)

    // buscar planos de manutenção
    const { data } = await supabase
      .from('maintenance_plans')
      .select(`
        next_maintenance,
        equipments (
          name,
          location
        )
      `)

    if (!data) return

    const today = new Date()

    const overdueList: MaintenanceItem[] = []
    const upcomingList: MaintenanceItem[] = []

    data.forEach((item: any) => {

      const next = new Date(item.next_maintenance)

      const diff =
        (next.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)

      if (diff < 0) {
        overdueList.push(item)
      } else if (diff <= 7) {
        upcomingList.push(item)
      }

    })

    setOverdue(overdueList)
    setUpcoming(upcomingList)
  }

  return (

    <div>

      <h1 className="text-2xl font-semibold mb-6">
        Dashboard
      </h1>

      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <div className="border p-4 rounded">
          <p className="text-sm text-gray-500">
            Equipamentos
          </p>

          <p className="text-2xl font-bold">
            {equipmentsCount}
          </p>
        </div>

        <div className="border p-4 rounded">
          <p className="text-sm text-gray-500">
            Manutenções próximas
          </p>

          <p className="text-2xl font-bold">
            {upcoming.length}
          </p>
        </div>

        <div className="border p-4 rounded">
          <p className="text-sm text-gray-500">
            Manutenções atrasadas
          </p>

          <p className="text-2xl font-bold text-red-600">
            {overdue.length}
          </p>
        </div>

      </div>

      {/* ALERTAS */}

      <div className="space-y-6">

        <div>

          <h2 className="font-semibold mb-3">
            Manutenções atrasadas
          </h2>

          {overdue.length === 0 && (
            <p className="text-sm text-gray-500">
              Nenhuma manutenção atrasada
            </p>
          )}

          {overdue.map((item, index) => (

            <div
              key={index}
              className="border p-3 rounded mb-2"
            >
              <strong>
                {item.equipments.name}
              </strong>

              <p className="text-sm text-gray-500">
                {item.equipments.location}
              </p>
            </div>

          ))}

        </div>


        <div>

          <h2 className="font-semibold mb-3">
            Manutenções próximas
          </h2>

          {upcoming.length === 0 && (
            <p className="text-sm text-gray-500">
              Nenhuma manutenção próxima
            </p>
          )}

          {upcoming.map((item, index) => (

            <div
              key={index}
              className="border p-3 rounded mb-2"
            >
              <strong>
                {item.equipments.name}
              </strong>

              <p className="text-sm text-gray-500">
                {item.equipments.location}
              </p>
            </div>

          ))}

        </div>

      </div>

    </div>
  )
}