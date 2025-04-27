import React, { useState, useEffect } from "react";
import Table from "../table";
import Modal from "../modal";
import { useParams } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { tours } from "../../data/tours";

function ReviewsTableData() {
  const { product_id } = useParams();

  const toursData = tours[product_id];

  const [loading, setLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState([]);
  const [modal, setModal] = useState(false);
  const [rowData, setRowData] = useState(null);

  useEffect(() => {
    if (toursData && toursData.reviews && toursData.reviews.length > 0) {
      setReviewsData(toursData.reviews);
      setLoading(false);
    }
  }, [toursData]);

  const handleStatusChange = (id) => {
    const newReviewsData = reviewsData.map((review) => {
      if (review.id === id) {
        review.status = !review.status;
        setModal(false);
      }
      return review;
    });
    setReviewsData(newReviewsData);
  };

  const headers = [
    {
      label: "ID",
      dataIndex: "id",
    },
    {
      label: "Image",
      render: ({ row }) => {
        return (
          <div className="flex gap-2">
            <img
              className="w-[70px] h-[70px] object-contain !rounded-md"
              src={row?.image || ""}
              alt=""
            />
          </div>
        );
      },
    },
    {
      label: "Name",
      dataIndex: "name",
    },
    {
      label: "Title",
      dataIndex: "title",
      render: ({ row }) => {
        return (
          <div
            className="flex gap-2 w-full items-center text-center"
            title={row?.title?.length > 30 ? row?.title : ""}
          >
            {row?.title?.length > 30
              ? row?.title?.slice(0, 30) + "..."
              : row?.title}
          </div>
        );
      },
    },

    {
      label: "Show In Website",
      dataIndex: "status",
      render: ({ row }) => {
        return (
          <div className="flex gap-2 w-full justify-center items-center text-center">
            {row?.status == true ? "Shown" : "Hidden"}
          </div>
        );
      },
    },

    {
      label: "Rate",
      dataIndex: "rate",
      sort: true,
      search: true,
      render: ({ row }) => {
        return (
          <div className="flex gap-2 w-full justify-center items-center text-center">
            {row?.rate} / 10
          </div>
        );
      },
    },

    {
      label: "Actions",
      render: ({ row }) => {
        return (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setModal(true);
                setRowData(row);
              }}
              className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white px-4 py-2 rounded-md"
            >
              {row?.status == true ? "Hide" : "Show"}
            </button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-t-4 border-b-4 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="TableData">
        <Table title={"Reviews Data"} headers={headers} body={reviewsData} />
      </div>

      <Dialog
        open={modal}
        onClose={() => setModal(false)}
        title={"Status Change"}
        maxWidth="lg"
      >
        <DialogTitle>Status Change</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-2 py-[12px] text-[25px]">
            Are you sure you want to {rowData?.status == true ? "hide" : "show"}{" "}
            this review?
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
            color={rowData?.status == true ? "error" : "success"}
            onClick={() => handleStatusChange(rowData?.id)}
          >
            {rowData?.status == true ? "Hide" : "Show"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReviewsTableData;
