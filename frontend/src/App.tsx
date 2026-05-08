import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import EditPatientPage from './pages/EditPatientPage'
import EditSamplePage from './pages/EditSamplePage'
import NewPatientPage from './pages/NewPatientPage'
import NewSamplePage from './pages/NewSamplePage'
import PatientListPage from './pages/PatientListPage'
import ReportByPatientPage from './pages/ReportByPatientPage'
import SampleListPage from './pages/SampleListPage'
import ViewSamplePage from './pages/ViewSamplePage'
import './App.css'

function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Muestras médicas</h1>
        <p className="muted">
          React (Vite) → proxy <code>/api</code> → Express · CouchDB: muestras + perfiles de paciente
        </p>
      </header>

      <nav className="main-nav" aria-label="Principal">
        <NavLink to="/pacientes" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Pacientes
        </NavLink>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Muestras
        </NavLink>
        <NavLink to="/nueva" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Nueva muestra
        </NavLink>
        <NavLink
          to="/reporte/por-paciente"
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          Reporte (vista)
        </NavLink>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<SampleListPage />} />
        <Route path="nueva" element={<NewSamplePage />} />
        <Route path="muestra/:id" element={<ViewSamplePage />} />
        <Route path="editar/:id" element={<EditSamplePage />} />
        <Route path="pacientes" element={<PatientListPage />} />
        <Route path="pacientes/nueva" element={<NewPatientPage />} />
        <Route path="pacientes/editar/:id" element={<EditPatientPage />} />
        <Route path="reporte/por-paciente" element={<ReportByPatientPage />} />
      </Route>
    </Routes>
  )
}
