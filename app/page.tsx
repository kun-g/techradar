import TechRadar from "@/components/tech-radar"
import { AddBlipForm } from "@/components/add-blip-form"
import { fetchRadarData } from "@/lib/data"

export default async function Home() {
  const data = await fetchRadarData()

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-6xl mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Technology Radar</h1>
        <p className="text-muted-foreground">An opinionated guide to technology frontiers</p>
      </header>


      <TechRadar initialData={data} />
      <div className="w-full max-w-6xl mb-8 flex justify-end">
        <AddBlipForm />
      </div>
    </main>
  )
}
