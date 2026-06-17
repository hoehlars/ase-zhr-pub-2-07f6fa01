import { Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import RaumBuchen from "@/pages/RaumBuchen"
import RaumDetails from "@/pages/RaumDetails"
import BuchungBestaetigen from "@/pages/BuchungBestaetigen"
import Buchungsbestaetigung from "@/pages/Buchungsbestaetigung"
import MeineBuchungen from "@/pages/MeineBuchungen"

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<RaumBuchen />} />
        <Route path="raeume/:raumId" element={<RaumDetails />} />
        <Route path="buchen/:raumId" element={<BuchungBestaetigen />} />
        <Route path="buchung/:buchungId" element={<Buchungsbestaetigung />} />
        <Route path="meine-buchungen" element={<MeineBuchungen />} />
      </Route>
    </Routes>
  )
}

export default App
