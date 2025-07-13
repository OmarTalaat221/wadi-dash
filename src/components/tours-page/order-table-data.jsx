import React, { useState, useEffect } from "react";
import Table from "../table";
import { useParams } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { tours } from "../../data/tours";

function OrdersTableData() {
  const { product_id } = useParams();

  const toursData = tours[product_id];

  const [loading, setLoading] = useState(true);
  const [ordersData, setOrdersData] = useState([]);
  const [modal, setModal] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [pages, setPages] = useState({ page: 1, perPage: 5 });

  useEffect(() => {
    if (toursData && toursData.orders && toursData.orders.length > 0) {
      setOrdersData(toursData.orders);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [toursData]);

  const handleStatusChange = (id) => {
    const newOrdersData = ordersData.map((order) => {
      if (order.id === id && !order.status) {
        order.status = true;
        setModal(false);
      }
      return order;
    });
    setOrdersData(newOrdersData);
  };

  const headers = [
    {
      label: "ID",
      dataIndex: "id",
    },
    {
      label: "Customer",
      dataIndex: "customerName",
      sort: true,
      search: true,
    },
    {
      label: "Email",
      dataIndex: "email",
      search: true,
    },
    {
      label: "Phone",
      dataIndex: "phone",
      render: ({ row }) => {
        return (
          <div className="flex gap-2 whitespace-nowrap px-[10px]">
            {row?.phone}
          </div>
        );
      },
    },
    {
      label: "Date",
      dataIndex: "date",
      sort: true,
      render: ({ row }) => {
        return (
          <div className="flex gap-2 whitespace-nowrap px-[10px]">
            {row?.date}
          </div>
        );
      },
    },
    {
      label: "Adults",
      dataIndex: "adults",
    },
    {
      label: "Children",
      dataIndex: "children",
    },
    {
      label: "Total Price",
      dataIndex: "totalPrice",
      sort: true,
      render: ({ row }) => {
        return (
          <div className="flex gap-2 w-full justify-center items-center text-center">
            ${row?.totalPrice}
          </div>
        );
      },
    },
    {
      label: "Status",
      dataIndex: "status",
      render: ({ row }) => {
        return (
          <div className="flex gap-2 w-full justify-center items-center text-center">
            <span
              className={
                row?.status
                  ? "text-green-600 font-medium"
                  : "text-orange-500 font-medium"
              }
            >
              {row?.status ? "Confirmed" : "Pending"}
            </span>
          </div>
        );
      },
    },
  ];

  const renderActions = ({ row }) => {
    if (row?.status) {
      return (
        <div className="flex justify-center text-[14px] gap-2">
          <span className="text-gray-500 whitespace-nowrap">
            Already confirmed
          </span>
        </div>
      );
    }

    return (
      <div className="flex justify-center text-[14px] gap-2">
        <button
          onClick={() => {
            setModal(true);
            setRowData(row);
          }}
          className="bg-green-500 hover:bg-green-600 transition-all duration-300 text-white px-4 py-2 rounded-md"
        >
          Confirm Order
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-t-4 border-b-4 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="TableData overflow-x-auto">
        <Table
          title={"Orders Data"}
          headers={headers}
          body={ordersData.map((order) => ({
            ...order,
            actions: renderActions({ row: order }),
          }))}
          pages={pages}
          setPages={setPages}
          extraColumns={[
            {
              label: "Actions",
              render: renderActions,
            },
          ]}
        />
      </div>

      <Dialog
        open={modal}
        onClose={() => setModal(false)}
        title={"Order Status Change"}
        maxWidth="lg"
      >
        <DialogTitle>Confirm Order</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-2 py-[12px] text-[25px]">
            Are you sure you want to confirm this order?
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleStatusChange(rowData?.id)}
          >
            Confirm Order
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default OrdersTableData;
