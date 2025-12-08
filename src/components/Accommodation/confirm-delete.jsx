// src/components/Accommodation/confirm-delete.jsx
import React, { useState } from "react";
import Modal from "../modal";

function ConfirmDeleteAccommodation({ open, setOpen, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return open ? (
    <Modal title={"Delete Accommodation Confirm"} setOpen={setOpen} open={open}>
      <div
        className={`flex flex-col gap-2.5 p-2.5 justify-center items-center`}
      >
        <img
          className="w-[100px] h-[100px] mb-[20px]"
          src="/delete-confirm.gif"
          alt="Delete Confirmation"
        />
        <p className="text-[20px] text-[red] space-x-1 text-center">
          Are you sure you want to delete <br />
          <strong className="text-gray-800">{open.title}</strong>?
        </p>
        <p className="text-sm text-gray-600 text-center">
          This action cannot be undone.
        </p>
        <div className="row flex gap-2 mt-4">
          <button
            onClick={() => setOpen(null)}
            disabled={deleting}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  ) : null;
}

export default ConfirmDeleteAccommodation;
