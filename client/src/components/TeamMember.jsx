import React from "react";

const TeamMember = ({ img, name, role }) => {
  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow w-[180px] mx-auto text-center">
      <img
        src={img}
        alt={name}
        className="w-22 h-32 rounded-full mx-auto object-cover mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  );
};

export default TeamMember;
