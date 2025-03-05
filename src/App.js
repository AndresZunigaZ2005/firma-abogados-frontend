import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopBar from './components/topBar/TopBar';
import Login from './components/logInView/Login';
import SignupClientForm from './components/registerClientView/SignupClientForm';
import Home from './components/info/Home';
import About from './components/info/About';
import './App.css'; // Importa el archivo CSS

function App() {
  return (
    <Router>
      <div className="App">
        <TopBar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aboutus" element={<About />} />
            <Route path="/signup" element={<SignupClientForm />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;