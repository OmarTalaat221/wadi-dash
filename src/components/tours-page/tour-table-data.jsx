// components/tours/ToursTableData.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Table from "../table";
import { message, Switch } from "antd";
import { CircularProgress } from "@mui/material";
import { base_url } from "./../../utils/base_url";

function ToursTableData({ setOpenDelete, refreshTrigger }) {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const goToUpdate = (id) => navigate(`update/${id}`);
  const goToReviews = (id) => navigate(`reviews/${id}`);
  const goToOrders = (id) => navigate(`orders/${id}`);

  useEffect(() => {
    loadTours();
  }, [refreshTrigger]);

  const loadTours = async (loading = true) => {
    try {
      if (loading) setLoading(true);
      const response = await axios.get(
        `${base_url}/admin/tours/select_tour.php`
      );
      if (response.data.status === "success") {
        setTours(response.data.message);
      }
    } catch (error) {
      console.error("Error loading tours:", error);
      message.error("Failed to load tours");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (tourId, currentStatus) => {
    try {
      const res = await axios.post(`${base_url}/admin/tours/toggle_tour.php`, {
        id: tourId,
      });

      if (res.data.status === "success") {
        message.success(res.data.message);

        loadTours(false);
      }
    } catch (error) {
      console.error("Error toggling tour:", error);
      message.error("Failed to update tour visibility");
    }
  };

  const headers = [
    {
      label: "ID",
      dataIndex: "id",
    },
    {
      label: "Image",
      render: ({ row }) => (
        <div className="flex gap-2">
          <img
            className="w-[100px] h-[60px] object-cover rounded-md"
            src={row?.image || ""}
            alt={row?.title || ""}
          />
        </div>
      ),
    },
    {
      label: "Title",
      dataIndex: "title",
      sort: true,
      search: true,
    },
    {
      label: "Country",
      dataIndex: "country_name",
      sort: true,
      search: true,
    },
    {
      label: "Duration",
      dataIndex: "duration",
      sort: true,
    },
    {
      label: "Price",
      render: ({ row }) => (
        <div className="text-center">
          <div className="font-bold text-green-600">
            {row.price_currency || "$"}
            {row.price_current}
          </div>
          {row.price_original && row.price_original !== row.price_current && (
            <div className="text-sm text-gray-500 line-through">
              {row.price_currency || "$"}
              {row.price_original}
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Category",
      dataIndex: "category",
      sort: true,
      search: true,
    },
    {
      label: "Status",
      render: ({ row }) => (
        <Switch
          checked={row.hidden === "0"}
          onChange={() => handleToggleVisibility(row.id, row.hidden)}
          checkedChildren="Visible"
          unCheckedChildren="Hidden"
        />
      ),
    },
    {
      label: "Created",
      render: ({ row }) => (
        <div className="text-sm">
          {new Date(row.created_at).toLocaleDateString()}
        </div>
      ),
      sort: true,
    },
    {
      label: "Actions",
      render: ({ row }) => (
        <div className="flex gap-1 flex-row">
          <button
            onClick={() => goToUpdate(row.id)}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium transition-all duration-200 rounded-lg text-sm px-3 py-1.5"
          >
            Edit
          </button>
          <button
            onClick={() => goToReviews(row.id)}
            className="text-white bg-amber-400 hover:bg-amber-500 focus:ring-4 focus:ring-amber-300 font-medium transition-all duration-200 rounded-lg text-sm px-3 py-1.5"
          >
            Reviews
          </button>
          <button
            onClick={() => goToOrders(row.id)}
            className="text-white bg-slate-400 hover:bg-slate-500 focus:ring-4 focus:ring-slate-300 font-medium transition-all duration-200 rounded-lg text-sm px-3 py-1.5"
          >
            Orders
          </button>
          <button
            onClick={() => setOpenDelete(row)}
            className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium transition-all duration-200 rounded-lg text-sm px-3 py-1.5"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="TableData">
      <Table title="Tours Data" headers={headers} body={tours} />
    </div>
  );
}

export default ToursTableData;
