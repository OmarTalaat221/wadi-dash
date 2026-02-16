import React, { useState, useEffect, useCallback } from "react";
import BreadCrumbs from "../../components/bread-crumbs";
import ActivityBreadcrumbsButtons from "../../components/Activities/activity-breadcrumbs-buttons";
import ActivityTableData from "../../components/Activities/activity-table-data";
import ConfirmDeleteActivity from "../../components/Activities/confirm-delete";
import ImportActivityExcel from "../../components/Activities/import-excel-modal";
import axios from "axios";
import { message } from "antd";
import { base_url } from "../../utils/base_url";

function Activities() {
  const [openImport, setOpenImport] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch activities
  const fetchActivities = useCallback(
    async (page = 1, pageSize = 10, showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const response = await axios.get(
          `${base_url}/admin/activities/select_activities.php`,
          {
            params: {
              page,
              limit: pageSize,
            },
          }
        );
        if (response.data.status === "success") {
          setActivities(response.data.message);

          const paginationData = response.data.pagination;
          setPagination({
            current: paginationData.current_page,
            pageSize: paginationData.per_page,
            total: paginationData.total_records || response.data.message.length,
          });
        } else {
          message.error("Failed to fetch activities");
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        message.error("Error fetching activities");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchActivities(pagination.current, pagination.pageSize);
  }, []);

  // Handle pagination change - THIS IS THE KEY FIX
  const handlePaginationChange = (page, pageSize) => {
    fetchActivities(page, pageSize);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedActivity) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${base_url}/admin/activities/delete_activity.php`,
        {
          id: selectedActivity.id,
        }
      );

      if (response.data.status === "success") {
        message.success("Activity deleted successfully");

        // If we deleted the last item on current page, go to previous page
        const newTotal = pagination.total - 1;
        const maxPage = Math.ceil(newTotal / pagination.pageSize);
        const targetPage =
          pagination.current > maxPage ? maxPage : pagination.current;

        fetchActivities(targetPage || 1, pagination.pageSize, false);
        setOpenDelete(false);
        setSelectedActivity(null);
      } else {
        message.error("Failed to delete activity");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      message.error("Error deleting activity");
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle visibility
  const handleToggle = async (id) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/activities/toggle_activity.php`,
        {
          id,
        }
      );

      if (response.data.status === "success") {
        message.success("Visibility updated successfully");
        fetchActivities(pagination.current, pagination.pageSize, false);
      } else {
        message.error("Failed to toggle visibility");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      message.error("Error toggling visibility");
    }
  };

  // Handle import success - refresh data
  const handleImportSuccess = () => {
    fetchActivities(1, pagination.pageSize);
    setOpenImport(false);
  };

  return (
    <div className="flex flex-col">
      <BreadCrumbs
        title={"Dashboard / Home / Activities"}
        children={
          <>
            <ActivityBreadcrumbsButtons
              setOpenImport={setOpenImport}
              activities={activities}
            />
          </>
        }
      />
      <ActivityTableData
        setOpenDelete={(activity) => {
          setSelectedActivity(activity);
          setOpenDelete(true);
        }}
        activities={activities}
        loading={loading}
        onToggle={handleToggle}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />
      <ImportActivityExcel
        open={openImport}
        setOpen={setOpenImport}
        // onSuccess={handleImportSuccess}
      />
      <ConfirmDeleteActivity
        open={openDelete}
        setOpen={setOpenDelete}
        onConfirm={handleDelete}
        activityName={selectedActivity?.title}
        // loading={loading}
      />
    </div>
  );
}

export default Activities;
