import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginView } from './views/LoginView'
import { CallbackView } from './views/CallbackView'
import { SetupView } from './views/SetupView'
import { StageView } from './views/StageView'
import { isLoggedIn } from './auth/spotify'

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter basename="/gignite">
      <Routes>
        <Route path="/" element={isLoggedIn() ? <Navigate to="/setup" replace /> : <LoginView />} />
        <Route path="/callback" element={<CallbackView />} />
        <Route path="/setup" element={<RequireAuth><SetupView /></RequireAuth>} />
        <Route path="/stage" element={<RequireAuth><StageView /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
