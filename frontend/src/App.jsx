import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import BookingForm from "./BookingForm";
function App() {
  return (
    <Router>
      <Routes>
        {/* :clientSlug — это динамическая часть URL (например, barbershop или beauty-salon) */}
        <Route path="/:clientSlug" element={<BookingForm />} />

        {/* Если кто-то зайдет просто на корень сайта, кидаем его на барбершоп по умолчанию */}
        <Route path="/" element={<Navigate to="/barbershop" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
