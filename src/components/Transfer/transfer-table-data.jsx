import React from "react";
import Table from "../table";
import { useNavigate } from "react-router-dom";
import { Switch } from "antd";

function CarTableData({ setOpenDelete, cars, onToggle, isLoading }) {
  const navigate = useNavigate();
  const goToUpdate = (id) => navigate(`update/${id}`);

  const headers = [
    {
      label: "ID",
      dataIndex: "id",
      sort: true,
    },
    {
      label: "Main Image",
      render: ({ row }) => {
        const imageUrl = row?.image?.split("//CAMP//")[0] || "";
        return (
          <div className="flex gap-2">
            <img
              className="!w-[120px] h-[120px] object-cover !rounded-md"
              src={imageUrl}
              alt={row.title}
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
      label: "Subtitle",
      dataIndex: "subtitle",
      search: true,
    },
    // {
    //   label: "Location",
    //   dataIndex: "location",
    //   sort: true,
    //   search: true,
    // },
    {
      label: "Car Type",
      dataIndex: "car_type",
      sort: true,
      search: true,
    },
    {
      label: "Price",
      render: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-green-600">{row.price_current}</span>
          {row.price_original && (
            <span className="text-sm line-through text-gray-500">
              {row.price_original}
            </span>
          )}
          {row.price_note && (
            <span className="text-xs text-gray-600">{row.price_note}</span>
          )}
        </div>
      ),
    },
    {
      label: "Status",
      render: ({ row }) => {
        const isHidden = row.hidden === "1" || row.hidden === 1;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={!isHidden}
              onChange={() => onToggle(row.id)}
              loading={isLoading}
              checkedChildren="Visible"
              unCheckedChildren="Hidden"
            />
          </div>
        );
      },
      sort: false,
      search: false,
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
              className="danger focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
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
      <Table title={"Car Rental Data"} headers={headers} body={cars} />
    </div>
  );
}

export default CarTableData;
