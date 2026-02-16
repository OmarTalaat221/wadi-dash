// pages/Unauthorized/index.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_data");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-[20px]">
      <div className="text-center bg-white p-[60px_40px] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] max-w-[500px] ">
        {/* <div className=" text-[80px] mb-[20px] ">🔒</div> */}
        <h1 className="text-[72px] font-bold text-[#ef4444] mb-[10px] ">403</h1>
        <h2 className="text-[24px] text-[#374151] mb-[15px] ">Access Denied</h2>
        <p className="text-[#6b7280] mb-[30px] leading-[1.6] ">
          Sorry, you don't have permission to access this page.
          <br />
          Please contact your administrator.
        </p>
        <div className="flex gap-[15px] justify-center">
          <button
            onClick={handleGoHome}
            className="px-[30px] py-[12px] bg-[#295557] text-white border-none rounded-[8px] cursor-pointer text-[16px] font-[500] "
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="px-[30px] py-[12px] bg-white text-[#ef4444] border-[2px] border-[#ef4444] rounded-[8px] cursor-pointer text-[16px] font-[500] "
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
