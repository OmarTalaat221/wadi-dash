// src/pages/Accommodation/index.jsx
import React, { useState, useEffect, useCallback } from "react";
import BreadCrumbs from "../../components/bread-crumbs";
import AccommodationTableData from "../../components/Accommodation/accommodation-table-data";
import ConfirmDeleteAccommodation from "../../components/Accommodation/confirm-delete";
import AccomBreadcrumbsButtons from "../../components/Accommodation/accom-breadcrumbs-buttons";
import ImportAccommodationsExcel from "../../components/Accommodation/import-excel-modal";
import axios from "axios";
import { message, Spin } from "antd";
import { base_url } from "../../utils/base_url";

function Accommodation() {
  const [openImport, setOpenImport] = useState(false);
  const [openDelete, setOpenDelete] = useState(null);
  const [accom, setAccom] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch accommodations with pagination
  const fetchAccommodations = useCallback(
    async (page = 1, pageSize = 10, showLoading = true) => {
      if (showLoading) setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${base_url}/admin/hotels/select_hotels.php`,
          {
            params: {
              page,
              limit: pageSize,
            },
          }
        );

        if (response.data.status === "success") {
          setAccom(response.data.message);

          // Update pagination from API response
          const paginationData = response.data.pagination;
          if (paginationData) {
            setPagination({
              current: paginationData.current_page || page,
              pageSize: paginationData.per_page || pageSize,
              total:
                paginationData.total_records || response.data.message.length,
            });
          }
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
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAccommodations(pagination.current, pagination.pageSize);
  }, []);

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    fetchAccommodations(page, pageSize);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!openDelete) return;

    try {
      setDeleteLoading(true);
      const response = await axios.post(
        `${base_url}/admin/hotels/delete_hotel.php`,
        {
          id: openDelete.id,
        }
      );

      if (response.data.status === "success") {
        message.success("Accommodation deleted successfully!");
        setOpenDelete(null);

        // If we deleted the last item on current page, go to previous page
        const newTotal = pagination.total - 1;
        const maxPage = Math.ceil(newTotal / pagination.pageSize);
        const targetPage =
          pagination.current > maxPage ? maxPage : pagination.current;

        fetchAccommodations(targetPage || 1, pagination.pageSize, false);
      } else {
        throw new Error(
          response.data.message || "Failed to delete accommodation"
        );
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || error.message || "Network error"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle toggle visibility
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
        fetchAccommodations(pagination.current, pagination.pageSize, false);
      } else {
        message.error("Failed to toggle visibility");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      message.error("Error toggling visibility");
    }
  };

  // Handle import success
  const handleImportSuccess = () => {
    fetchAccommodations(1, pagination.pageSize);
    setOpenImport(false);
  };

  // Handle retry
  const handleRetry = () => {
    fetchAccommodations(pagination.current, pagination.pageSize);
  };

  if (error && accom.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button
          onClick={handleRetry}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
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
        loading={loading}
        onRefresh={() =>
          fetchAccommodations(pagination.current, pagination.pageSize)
        }
        onToggle={handleToggle}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />

      <ImportAccommodationsExcel
        open={openImport}
        setOpen={setOpenImport}
        onImportSuccess={handleImportSuccess}
      />

      <ConfirmDeleteAccommodation
        open={openDelete}
        setOpen={setOpenDelete}
        onConfirm={handleDeleteConfirm}
        // loading={deleteLoading}
        accommodationName={openDelete?.title}
      />
    </div>
  );
}

export default Accommodation;
