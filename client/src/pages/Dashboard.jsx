import { useUser } from "@clerk/clerk-react";
import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, NavLink, Outlet } from "react-router-dom";

const Dashboard = () => {
  const { user } = useUser();
  return (

    <div className="h-screen flex flex-col">
    <div className="p-7 pl-15 bg-sky-600 text-white">
      <div className="flex items-center gap-1">
        <Link className="text-3xl" to={"/"}>
          <IoIosArrowBack />
        </Link>{" "}
        Hello, {user?.firstName}
      </div>
      <div className="text-center p-12">
        <h1 className="text-[7rem] font-extrabold leading-[7rem]">My Bookings</h1>
        <p className="italic text-[1.5rem]">Your Bookings are shown below</p>
      </div>
    </div>
    <div className="flex flex-1 p-5 gap-5">
    <div className="w-[40%] pl-5">
        <div className="shadow w-full bg-black-500 h-full p-5 border-1">...</div>
    </div>
    
    <div>
        <div className="flex gap-8">
            <NavLink to="/owner" end className= {({isActive}) => `text-l p-5 hover:font-bold relative after:content-[''] after:absolute after:left-0 after:bottom-0  after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full  ${isActive ? "relative after:content-[''] after:absolute after:left-0 after:bottom-0  after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 after:w-full" : ''}`}>All </NavLink>
            <NavLink to="pending" className={({isActive}) => `text-l p-5 hover:font-bold relative after:content-[''] after:absolute after:left-0 after:bottom-0  after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full ${isActive ? "relative after:content-[''] after:absolute after:left-0 after:bottom-0  after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 after:w-full" : ''}`}>Pending Payment </NavLink>
            <NavLink to="upcoming" className={({isActive}) => `text-l p-5 hover:font-bold relative after:content-[''] after:absolute after:left-0 after:bottom-0  after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full ${isActive ?  "relative after:content-[''] after:absolute after:left-0 after:bottom-0  after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 after:w-full" : ''}`}>Upcoming </NavLink>
            <NavLink to="awaiting-review" className={({isActive}) => `text-l p-5 hover:font-bold relative after:content-[''] after:absolute after:left-0 after:bottom-0  after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full ${isActive ? "relative after:content-[''] after:absolute after:left-0 after:bottom-0  after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 after:w-full" : ''}`}>Awaiting Review </NavLink>
        </div>

        <Outlet />

    </div>

    </div>
        
    </div>
 
    
  );
};

export default Dashboard;
