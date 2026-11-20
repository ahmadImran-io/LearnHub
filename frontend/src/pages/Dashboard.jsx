import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Sends each user to the dashboard for their role
export default function Dashboard() {
  const { user } = useAuth()
  return <Navigate to={`/dashboard/${user.role}`} replace />
}
