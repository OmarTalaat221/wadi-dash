import React, { useState, useEffect } from "react";
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

  // Fetch activities
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/activities/select_activities.php`
      );
      if (response.data.status === "success") {
        setActivities(response.data.message);
      } else {
        message.error("Failed to fetch activities");
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      message.error("Error fetching activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!selectedActivity) return;

    try {
      const response = await axios.post(
        `${base_url}/admin/activities/delete_activity.php`,
        {
          id: selectedActivity.id,
        }
      );

      if (response.data.status === "success") {
        message.success("Activity deleted successfully");
        fetchActivities();
        setOpenDelete(false);
        setSelectedActivity(null);
      } else {
        message.error("Failed to delete activity");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      message.error("Error deleting activity");
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
        fetchActivities();
      } else {
        message.error("Failed to toggle visibility");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      message.error("Error toggling visibility");
    }
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
      />
      <ImportActivityExcel open={openImport} setOpen={setOpenImport} />
      <ConfirmDeleteActivity
        open={openDelete}
        setOpen={setOpenDelete}
        onConfirm={handleDelete}
        activityName={selectedActivity?.title}
      />
    </div>
  );
}

export default Activities;
