import React from 'react'
import { BrowserRouter , Routes , Route} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute  from './components/ProtectedRoute';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <BrowserRouter> 
      <AuthProvider>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>

          <Route element={<ProtectedRoute/>}>
            <Route path='/dashboard' element={<Dashboard/>}/>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
