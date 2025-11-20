import React from "react";
import Title from '../components/Title'
import teamPhoto from '../assets/teamworking-samplephoto.png'
import {team, images} from '../assets/assets'
import TeamMember from "../components/TeamMember";

const About = () => {

const teamMembers = [
  {
    img: team.Conybeare,
    name: "Jashen Loberanes",
    role: "Lead Developer",
  },
  {
    img: team.Jashen,
    name: "John Doe",
    role: "UI/UX Designer",
  },
  {
    img: "/images/member3.jpg",
    name: "Jane Dare",
    role: "Backend Engineer",
  },
  {
    img: "/images/member3.jpg",
    name: "Jane Dare",
    role: "Backend Engineer",
  },
  {
    img: "/images/member3.jpg",
    name: "Jane Dare",
    role: "Backend Engineer",
  },
  {
    img: "/images/member3.jpg",
    name: "Jane Dare",
    role: "Backend Engineer",
  },
  {
    img: "/images/member3.jpg",
    name: "Jane Dare",
    role: "Backend Engineer",
  },
  {
    img: "/images/member3.jpg",
    name: "Jane Dare",
    role: "Backend Engineer",
  },
  {
    img: "/images/member3.jpg",
    name: "Jane Dare",
    role: "Backend Engineer",
  },
  {
    img: "/images/member3.jpg",
    name: "Jane Dare",
    role: "Backend Engineer",
  },
];

  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-30">

      {/* Section 1: Why We Started */}
      <Title
        title="We make strategies and development to grow your business"
        subTitle="Empowering travelers and local businesses in Cordova, Cebu through an easier, smarter hotel and taxi booking experience."
      />

      <img
        src={teamPhoto} 
        alt="Our Team Working"
        className="rounded-2xl shadow-md w-full max-w-4xl mt-12 mb-10"
      />

      <div className="max-w-4xl text-center">
        <p className="text-gray-700 text-md leading-relaxed">
          At our agency, we’re always looking for talented individuals who are passionate about what they do.
          We believe that our success is driven by our team, and we are committed to creating an environment where
          our employees can thrive. We offer a collaborative and dynamic workspace where creativity and innovation
          are encouraged — our team members are not just employees, but partners in our success.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed mt-6">
          We started this hotel booking system to help people in <b>Cordova, Cebu</b> conveniently book rooms and taxis
          without the need for direct communication with hotels or drivers. Our goal is to make traveling smoother,
          faster, and more accessible for everyone.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-12 mt-16 text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">100+</h2>
          <p className="text-gray-500">Projects Done</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">45+</h2>
          <p className="text-gray-500">Happy Clients</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">10+</h2>
          <p className="text-gray-500">Years of Experience</p>
        </div>
      </div>

      {/* Section 2: Core Team */}
    <div className="w-full bg-white mt-24 py-20 rounded-2xl shadow-sm text-center">
    <Title
        title="Our Core Team"
        subTitle="Meet the dedicated individuals behind our hotel booking system — building solutions that connect travelers and local businesses."
    />

    <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5 mt-16 mx-10 max-w-3/4 mx-auto">
        {teamMembers.map((member, index) => (
        <TeamMember 
            key={index}
            img={member.img}
            name={member.name}
            role={member.role}
        />
        ))}
    </div>
    </div>

      {/* Section 3: Our Vision */}
      <div className="flex flex-col items-center mt-24">
        <Title
          title="We’ll assist you in reaching your travel goals effectively"
          subTitle="We evolve with the changing travel landscape, creating a reliable and accessible platform for hotels, drivers, and travelers alike."
        />
        <img
          src={images.Cordova}
          alt="Our Services"
          className="rounded-2xl shadow-md w-full max-w-4xl mt-12 mb-10"
        />
        <p className="max-w-3xl text-center text-gray-700 text-lg leading-relaxed">
          Our system adapts to the modern hospitality industry by offering verified accommodations and trustworthy
          transport services. We aim to empower local businesses while providing travelers with comfort and
          confidence in every booking. Together, we redefine convenience and accessibility in Cordova’s tourism.
        </p>

        <div className="flex flex-wrap justify-center gap-12 mt-16 text-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-800">100+</h2>
            <p className="text-gray-500">Projects Done</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-gray-800">45+</h2>
            <p className="text-gray-500">Happy Clients</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-gray-800">10+</h2>
            <p className="text-gray-500">Years of Experience</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
