import React, { useEffect } from 'react'
import { Routes,Route, Navigate } from 'react-router-dom'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import Navbar from './components/Navbar'
import { useAuthStore } from './store/useAuthStore'
import { Toaster } from "react-hot-toast";
import { Loader } from 'lucide-react'

const App = () => {
  const {authUser,isCheckingAuth,checkAuth} = useAuthStore();

  useEffect(()=>{
    checkAuth();
  },[checkAuth])

  if(isCheckingAuth && !authUser) return (
    <div className='flex items-center justify-center h-screen'>
      <Loader className='size-10 animate-spin'/>

    </div>

  )
  return (
    <div >
      <Navbar/>
      <Routes>
        <Route path='/' element={authUser?<HomePage/>:<Navigate to={"/login"}/>}/>
        <Route path='/signup' element={!authUser?<SignupPage/>:<Navigate to={"/"}/>}/>
        <Route path='/login' element={!authUser? <LoginPage/>:<Navigate to={"/"}/>}/>
        <Route path='/setting' element={<SettingsPage/>}/>
        <Route path='/profile' element={authUser?<ProfilePage/>:<Navigate to={"/login"}/>}/>
      </Routes>
      <Toaster />

    </div>
  )
}

export default App