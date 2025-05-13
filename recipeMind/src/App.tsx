import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Button from "./components/Button";
import Nav from './components/nav/Nav';
import Home from './pages/Home';
import Map from './pages/Map';
import SignIn from './pages/SignIn';
import {Link} from "react-router-dom";


const App = () => {
  return (
    <BrowserRouter>
    <div>
      <Nav />
    </div>
    <Routes>
      <Route path="/Home" element={<Home />} />
      <Route path="/Map" element={<Map />} />
      <Route path="/SignIn" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;