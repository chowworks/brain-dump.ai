import { Route, Routes } from 'react-router-dom';
import CapturePage from './pages/CapturePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CapturePage />} />
    </Routes>
  );
}
