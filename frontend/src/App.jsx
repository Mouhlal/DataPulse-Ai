import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Datasets from './pages/Datasets'
import Analysis from './pages/Analysis'
import Models from './pages/Models'
import Reports from './pages/Reports'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* We will add login/register real routes later, wrapping dashboard for now */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/datasets" element={<Layout><Datasets /></Layout>} />
        <Route path="/analysis" element={<Layout><Analysis /></Layout>} />
        <Route path="/models" element={<Layout><Models /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
