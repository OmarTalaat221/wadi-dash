import React, { useState } from "react";
import Table from "../table";
import { useNavigate } from "react-router-dom";

function ToursTableData({ setOpenDelete, tours }) {
  const navigate = useNavigate();
  const goToUpdate = (id) => navigate(`update/${id}`);
  const goToReviews = (id) => navigate(`reviews/${id}`);
  const goToOrders = (id) => navigate(`orders/${id}`);
  const [pages, setPages] = useState(1);

  const headers = [
    {
      label: "ID",
      dataIndex: "id",
    },
    {
      label: " Image",

      render: ({ row }) => {
        return (
          <div className="flex gap-2">
            <img
              className="w-[200px] h-full object-contain !rounded-md"
              src={row?.images[0] || ""}
              alt=""
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
      label: "Actions",
      render: ({ row, body_index }) => {
        return (
          <div className="row flex gap-1">
            <button
              onClick={() => goToUpdate(body_index)}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium transition-all duration-200 rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => goToReviews(body_index)}
              className="text-white bg-amber-400 hover:bg-amber-500 focus:ring-4 focus:ring-amber-300 font-medium transition-all duration-200 rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-amber-600 dark:hover:bg-amber-700 focus:outline-none dark:focus:ring-amber-800"
            >
              Reviews
            </button>
            <button
              onClick={() => goToOrders(body_index)}
              className="text-white bg-slate-400 hover:bg-slate-500 focus:ring-4 focus:ring-slate-300 font-medium transition-all duration-200 rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-slate-600 dark:hover:bg-slate-700 focus:outline-none dark:focus:ring-slate-800"
            >
              Orders
            </button>
            <button
              onClick={() => setOpenDelete(row)}
              className="danger  focus: 'outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium transition-all duration-200 rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900'"
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
      <Table title={"Tours Data"} headers={headers} body={tours} />
    </div>
  );
}

export default ToursTableData;
