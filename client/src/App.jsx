import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Footer from './components/Footer'
import AllRooms from './pages/AllRooms'
import RoomDetails from './pages/RoomDetails'
import Dashboard from './pages/Dashboard'
import Pending from './components/Pending'
import Upcoming from './components/Upcoming'
import AwaitingReview from './components/AwaitingReview'
import AllBookings from './components/AllBookings'
import About from './pages/About'

const App = () => {

  const isOwnerPath = useLocation().pathname.includes("owner");

  return (
    <div>
    {!isOwnerPath && <Navbar/>}
    <div className='min-h-[70vh]'>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/rooms' element={<AllRooms/>}/>
        <Route path='/rooms/:id' element={<RoomDetails/>}/>

        <Route path='owner' element={<Dashboard/>}>
          <Route path='pending' element={<Pending />} />
          <Route path='upcoming' element={<Upcoming />} />
          <Route path='awaiting-review' element={<AwaitingReview/>} />
           <Route index element={<AllBookings/>} />

        </Route>
        <Route path='/about' element={<About/>}/>
      </Routes>
    </div>
    {/* <Footer/> */}
    <Footer/>
    </div>
  )
}

export default App