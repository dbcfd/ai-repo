import { Login } from "@/components"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <nav className="flex justify-end">
        <Login />
      </nav>
    </main>
  )
}
