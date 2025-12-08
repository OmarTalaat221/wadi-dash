// src/components/Accommodation/accommodation-table-data.jsx
import React from "react";
import Table from "../table";
import { useNavigate } from "react-router-dom";
import { Switch } from "antd";

function AccommodationTableData({ setOpenDelete, accom, onRefresh, onToggle }) {
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
        const images = row.image ? row.image.split("//CAMP//") : [];
        const firstImage = images[0] || "https://via.placeholder.com/200x120";

        return (
          <div className="flex gap-2">
            <img
              className="w-[200px] h-[120px] object-cover !rounded-md"
              src={firstImage}
              alt={row?.title || "Accommodation"}
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
      label: "Category",
      dataIndex: "category",
      sort: true,
    },
    {
      label: "Price",
      render: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="font-bold text-green-600">
              {row.price_current}
            </span>
            {row.price_original &&
              parseFloat(row.price_original) >
                parseFloat(row.price_current) && (
                <span className="text-sm text-gray-500 line-through">
                  {row.price_original}
                </span>
              )}
          </div>
        );
      },
    },
    {
      label: "Location",
      dataIndex: "location",
      search: true,
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
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            >
              Edit
            </button>
            <button
              onClick={() => setOpenDelete(row)}
              className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
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
      <Table title={"Accommodation Data"} headers={headers} body={accom} />
    </div>
  );
}

export default AccommodationTableData;
