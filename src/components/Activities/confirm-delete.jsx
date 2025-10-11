import React from "react";
import Modal from "../modal";

function ConfirmDeleteActivity({ open, setOpen, onConfirm, activityName }) {
  return open ? (
    <Modal title={"Delete Activity Confirmation"} setOpen={setOpen} open={open}>
      <div
        className={`flex flex-col gap-2.5 p-2.5 justify-center items-center`}
      >
        <img
          className="w-[100px] h-[100px] mb-[20px]"
          src="/delete-confirm.gif"
          alt="Delete Confirmation"
        />
        <p className="text-[20px] text-[red] space-x-1 text-center">
          Are you sure you want to delete "{activityName}"?
        </p>
        <div className="row flex gap-2">
          <button
            onClick={() => setOpen(false)}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  ) : null;
}

export default ConfirmDeleteActivity;
