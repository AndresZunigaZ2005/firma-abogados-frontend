import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Login from './components/logInView/Login'
import SignupClientForm from './components/registerClientView/SignupClientForm';

function App() {
  return (
    <Router>
      <div>
        {/* Barra de navegación con enlaces */}
        <nav>
          <ul>
            <li>
              <Link to="/signup">Registro de Cliente</Link>
            </li>
          </ul>
        </nav>

        {/* Configuración de las rutas */}
        <Routes>
          <Route path="/signup" element={<SignupClientForm />} />
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
