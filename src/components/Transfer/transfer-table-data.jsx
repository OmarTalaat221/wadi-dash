import React from "react";
import Table from "../table";
import { useNavigate } from "react-router-dom";

function TransferTableData({ setOpenDelete, transfer }) {
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
        return (
          <div className="flex gap-2">
            <img
              className="w-[120px] h-[120px] object-contain !rounded-md"
              src={row?.imageCover || row?.image || row?.images[0] || ""}
              alt=""
            />
          </div>
        );
      },
    },
    {
      label: "Name",
      dataIndex: "name",
      sort: true,
      search: true,
    },
    {
      label: "Description",
      dataIndex: "description",
    },
    {
      label: "Capacity",
      dataIndex: "capacity",
    },
    {
      label: "Price",
      dataIndex: "price",
    },
    {
      label: "Actions",
      render: ({ row, body_index }) => {
        return (
          <div className="row flex gap-2">
            <button
              onClick={() => goToUpdate(body_index)}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => setOpenDelete(row)}
              className="danger  focus: 'outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900'"
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
      <Table title={"Transfer Data"} headers={headers} body={transfer} />
    </div>
  );
}

export default TransferTableData;
