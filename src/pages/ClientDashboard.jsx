export default function ClientDashboard() {
  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Client Dashboard</h1>
      <p>Welcome {user?.name || 'Client'} 🚀</p>
    </div>
  )
}
