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
        <h1>Lab samples</h1>
      </header>

      <nav className="main-nav" aria-label="Main">
        <NavLink to="/pacientes" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Patients
        </NavLink>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Samples
        </NavLink>
        <NavLink to="/nueva" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          New sample
        </NavLink>
        <NavLink
          to="/reporte/por-paciente"
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          Report
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
