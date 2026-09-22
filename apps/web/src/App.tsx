import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CapturePage from './pages/CapturePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/capture" element={<CapturePage />} />
    </Routes>
  );
}
