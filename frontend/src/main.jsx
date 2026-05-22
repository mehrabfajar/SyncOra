import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import CreateEvent from './pages/CreateEvent'
import EventView from './pages/EventView'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/event/:id" element={<EventView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
