// components/tours/ConfirmDeleteTour.jsx
import React, { useState } from "react";
import axios from "axios";
import { message } from "antd";
import { CircularProgress } from "@mui/material";
import Modal from "../modal";
import { base_url } from "./../../utils/base_url";

function ConfirmDeleteTour({ open, setOpen, refreshTable }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!open?.id) return;

    try {
      setLoading(true);
      await axios.post(`${base_url}/admin/tours/delete_toure.php`, {
        id: open.id,
      });
      message.success("Tour deleted successfully");
      setOpen(null);
      refreshTable();
    } catch (error) {
      console.error("Error deleting tour:", error);
      message.error("Failed to delete tour");
    } finally {
      setLoading(false);
    }
  };

  return open ? (
    <Modal title="Delete Tour Confirmation" setOpen={setOpen} open={open}>
      <div className="flex flex-col gap-4 p-4 justify-center items-center">
        <img
          className="w-[100px] h-[100px] mb-4"
          src="/delete-confirm.gif"
          alt="Delete Confirmation"
        />
        <p className="text-lg text-red-600 text-center">
          Are you sure you want to delete the tour "{open.title}"?
        </p>
        <p className="text-sm text-gray-500 text-center">
          This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(null)}
            disabled={loading}
            className="text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center gap-2"
          >
            {loading && <CircularProgress size={16} />}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  ) : null;
}

export default ConfirmDeleteTour;
