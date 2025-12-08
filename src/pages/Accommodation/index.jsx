// src/pages/Accommodation/index.jsx
import React, { useState, useEffect } from "react";
import BreadCrumbs from "../../components/bread-crumbs";
import AccommodationTableData from "../../components/Accommodation/accommodation-table-data";
import ConfirmDeleteAccommodation from "../../components/Accommodation/confirm-delete";
import AccomBreadcrumbsButtons from "../../components/Accommodation/accom-breadcrumbs-buttons";
import ImportAccommodationsExcel from "../../components/Accommodation/import-excel-modal";
import axios from "axios";
import { message } from "antd";
import { base_url } from "../../utils/base_url";

function Accommodation() {
  const [openImport, setOpenImport] = useState(false);
  const [openDelete, setOpenDelete] = useState(null);
  const [accom, setAccom] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async (loader = true) => {
    if (loader) setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${base_url}/admin/hotels/select_hotels.php`
      );

      if (response.data.status === "success") {
        setAccom(response.data.message);
        // message.success("Accommodations loaded successfully!");
      } else {
        throw new Error(
          response.data.message || "Failed to fetch accommodations"
        );
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Network error";
      setError(errorMsg);
      message.error(errorMsg);
    }

    setLoading(false);
  };

  const handleDeleteConfirm = async () => {
    if (!openDelete) return;

    try {
      const response = await axios.post(
        `${base_url}/admin/hotels/delete_hotel.php`,
        {
          id: openDelete.id,
        }
      );

      if (response.data.status === "success") {
        message.success("Accommodation deleted successfully!");
        setOpenDelete(null);
        fetchAccommodations();
      } else {
        throw new Error(
          response.data.message || "Failed to delete accommodation"
        );
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/hotels/toggle_hotel.php`,
        {
          id,
        }
      );

      if (response.data.status === "success") {
        message.success("Visibility updated successfully");
        fetchAccommodations(false);
      } else {
        message.error("Failed to toggle visibility");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      message.error("Error toggling visibility");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button
          onClick={fetchAccommodations}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <messageer position="top-right" />

      <BreadCrumbs
        title={"Dashboard / Home / Accommodation"}
        children={
          <AccomBreadcrumbsButtons
            setOpenImport={setOpenImport}
            accom={accom}
          />
        }
      />

      <AccommodationTableData
        setOpenDelete={setOpenDelete}
        accom={accom}
        onRefresh={fetchAccommodations}
        onToggle={handleToggle}
      />

      <ImportAccommodationsExcel
        open={openImport}
        setOpen={setOpenImport}
        onImportSuccess={fetchAccommodations}
      />

      <ConfirmDeleteAccommodation
        open={openDelete}
        setOpen={setOpenDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default Accommodation;
