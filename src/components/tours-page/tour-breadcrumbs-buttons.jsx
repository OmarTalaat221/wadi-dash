// components/tours/TourBreadcrumbsButtons.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { CircularProgress } from "@mui/material";
import { exportToExcel } from "../../utils/xlsx-exporter";
import { base_url } from "../../utils/base_url";

function TourBreadcrumbsButtons({ setOpenImport, refreshTable }) {
  const navigate = useNavigate();
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    try {
      setExportLoading(true);

      // Fetch all tours for export
      const response = await axios.get(
        `${base_url}/admin/tours/select_tour.php`
      );

      if (response.data.status === "success") {
        const tours = response.data.message;

        // Format data for export
        const exportData = tours.map((tour) => ({
          ID: tour.id,
          Country_ID: tour.country_id,
          Country_Name: tour.country_name,
          Title: tour.title,
          Subtitle: tour.subtitle,
          Description: tour.description?.replace(/<[^>]*>/g, ""), // Remove HTML tags
          Background_Image: tour.background_image,
          CTA_Button_Text: tour.cta_button_text,
          CTA_Button_URL: tour.cta_button_url,
          Category: tour.category,
          Duration: tour.duration,
          Image: tour.image,
          Route: tour.route,
          Price_Current: tour.price_current,
          Price_Original: tour.price_original,
          Per_Adult: tour.per_adult,
          Per_Child: tour.per_child,
          Price_Currency: tour.price_currency,
          Price_Note: tour.price_note,
          Highlights: Array.isArray(tour.highlights)
            ? tour.highlights.join("**")
            : tour.highlights,
          Created_At: tour.created_at,
          Status: tour.hidden === "0" ? "Visible" : "Hidden",
        }));

        // Use your existing export utility
        exportToExcel(exportData, "tours_export");
        message.success("Tours exported successfully!");
      } else {
        message.error("Failed to fetch tours for export");
      }
    } catch (error) {
      console.error("Error exporting tours:", error);
      message.error("Export failed");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="flex gap-1 TourBreadcrumbsButtons">
      <button
        onClick={() => navigate("create")}
        className="inline-flex items-center bg-[#295557] hover:bg-[#1e3c3d] text-white font-bold py-2 px-4 rounded focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-[#295557ad4]"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Create Tour
      </button>

      <button
        onClick={() => setOpenImport(true)}
        className="inline-flex items-center bg-[#295557] hover:bg-[#1e3c3d] text-white font-bold py-1 px-4 rounded focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-[#295557ad4]"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v4h16v-4M12 12V4m0 0l-4 4m4-4l4 4"
          />
        </svg>
        Import
      </button>

      <button
        onClick={handleExport}
        disabled={exportLoading}
        className="inline-flex items-center bg-[#e4642d] hover:bg-[#c9571f] text-white font-bold py-2 px-4 rounded focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-[#e4642d] disabled:opacity-50"
      >
        {exportLoading ? (
          <CircularProgress size={16} className="mr-2" />
        ) : (
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 8v-4h16v4M12 12v8m0 0l-4-4m4 4l4-4"
            />
          </svg>
        )}
        {exportLoading ? "Exporting..." : "Export"}
      </button>
    </div>
  );
}

export default TourBreadcrumbsButtons;
