import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Button from "./components/Button";
import Nav from './components/nav/Nav';
import Home from './pages/Home';
import Map from './pages/Map';
import SignIn from './pages/SignIn';
import {Link} from "react-router-dom";
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/dashboard';
import ProtectedRoute from './components/protected';

const App = () => {
  return (
    <BrowserRouter>
    <div>
      <Nav />
    </div>
    <Routes>
      <Route path="/SignIn" element={<SignIn />} />
      <Route path="/create" element={<CreateAccount />} />
      <Route path="/" element={<SignIn />} />
      <Route path="/Home" element={<Dashboard />} />
      <Route
        path="/Map"
        element={
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      </Routes>
    </BrowserRouter>



  )
}
export default App;