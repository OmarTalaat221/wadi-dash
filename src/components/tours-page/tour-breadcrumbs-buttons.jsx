import React from "react";
import { useNavigate } from "react-router-dom";
import { exportToExcel } from "../../utils/xlsx-exporter";

function TourBreadcrumbsButtons({ setOpenImport, tours }) {
  const navigate = useNavigate();
  return (
    <div className="flex gap-1 TourBreadcrumbsButtons">
      <button
        onClick={() => navigate("create")}
        className="inline-flex items-center bg-[#295557] hover:bg-[#1e3c3d] text-white font-bold py-2 px-4 rounded focus:outline-none transition-all duration-300  focus:ring-2 focus:ring-[#295557ad4]"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        Create Tour
      </button>
      <button
        onClick={() => setOpenImport(true)}
        className="inline-flex items-center bg-[#295557] hover:bg-[#1e3c3d] text-white font-bold py-1 px-4 rounded focus:outline-none transition-all duration-300  focus:ring-2 focus:ring-[#295557ad4]"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v4h16v-4M12 12V4m0 0l-4 4m4-4l4 4"
          ></path>
        </svg>
        Import
      </button>

      <button
        onClick={() => exportToExcel(tours)}
        className="inline-flex items-center bg-[#e4642d] hover:bg-[#c9571f] text-white font-bold py-2 px-4 rounded focus:outline-none transition-all duration-300  focus:ring-2 focus:ring-[#e4642d]"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8v-4h16v4M12 12v8m0 0l-4-4m4 4l4-4"
          ></path>
        </svg>
        Export
      </button>
    </div>
  );
}

export default TourBreadcrumbsButtons;
