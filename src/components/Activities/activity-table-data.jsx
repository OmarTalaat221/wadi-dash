import React from "react";
import Table from "../table";
import { useNavigate } from "react-router-dom";
import { Switch, Tag } from "antd";

function ActivityTableData({ setOpenDelete, activities, loading, onToggle }) {
  const navigate = useNavigate();
  const goToUpdate = (id) => navigate(`update/${id}`);

  const headers = [
    {
      label: "ID",
      dataIndex: "id",
    },
    {
      label: "Main Image",
      render: ({ row }) => {
        const imageUrl = row?.image?.split("//CAMP//")[0] || "";
        return (
          <div className="flex gap-2">
            <img
              className="w-[120px] h-[120px] object-cover !rounded-md"
              src={imageUrl}
              alt={row?.title || "Activity"}
              // onError={(e) => {
              //   e.target.src = "https://via.placeholder.com/120";
              // }}
            />
          </div>
        );
      },
    },
    {
      label: "Title",
      dataIndex: "title",
      sort: true,
      search: true,
    },
    {
      label: "Activity Type",
      dataIndex: "activity_type",
      sort: true,
      search: true,
    },
    {
      label: "Duration",
      dataIndex: "duration",
    },
    {
      label: "Price",
      render: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="font-bold text-green-600">
              {row.price_currency}
              {row.price_current}
            </span>
            {row.price_original && (
              <span className="text-sm text-gray-400 line-through">
                {row.price_currency}
                {row.price_original}
              </span>
            )}
            <span className="text-xs text-gray-500">{row.price_note}</span>
          </div>
        );
      },
    },
    {
      label: "Visibility",
      render: ({ row }) => {
        return (
          <Switch
            checked={row.hidden === "0"}
            onChange={() => onToggle(row.id)}
            checkedChildren="Visible"
            unCheckedChildren="Hidden"
          />
        );
      },
    },
    {
      label: "Actions",
      render: ({ row }) => {
        return (
          <div className="row flex gap-2">
            <button
              onClick={() => goToUpdate(row.id)}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => setOpenDelete(row)}
              className="outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            >
              Delete
            </button>
          </div>
        );
      },
      sort: false,
      search: false,
    },
  ];

  return (
    <div className="TableData">
      <Table
        title={"Activities Data"}
        headers={headers}
        body={activities}
        loading={loading}
      />
    </div>
  );
}

export default ActivityTableData;
