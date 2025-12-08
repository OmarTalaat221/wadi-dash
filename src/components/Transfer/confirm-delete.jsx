import React from "react";
import Modal from "../modal";

function ConfirmDeleteCar({ open, setOpen, onConfirm }) {
  return open ? (
    <Modal title={"Delete Car Confirm"} setOpen={setOpen} open={open}>
      <div
        className={`flex flex-col gap-2.5 p-2.5 justify-center items-center`}
      >
        <img
          className="w-[100px] h-[100px] mb-[20px]"
          src="/delete-confirm.gif"
          alt="Delete Confirmation"
        />
        <p className="text-[20px] text-[red] space-x-1">
          Are you sure you want to delete "{open.title}"?
        </p>
        <div className="row flex gap-2">
          <button
            onClick={() => setOpen(null)}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  ) : null;
}

export default ConfirmDeleteCar;
