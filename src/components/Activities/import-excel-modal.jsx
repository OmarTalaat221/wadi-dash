import React from "react";
import Modal from "../modal";

function ImportActivityExcel({ open, setOpen }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Importing activities from:", file.name);
      // Handle Excel import logic here
    }
  };

  return open ? (
    <Modal title={"Import Activities from Excel"} setOpen={setOpen} open={open}>
      <div
        className={`flex flex-col gap-2.5 p-2.5 justify-center items-center`}
      >
        <img
          className="w-[100px] h-[100px] mb-[20px]"
          src="/upload-excel.gif"
          alt="Upload Excel"
        />
        <p className="text-[18px] text-gray-700 mb-4">
          Upload an Excel file to import activities
        </p>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        <div className="row flex gap-2 mt-4">
          <button
            onClick={() => setOpen(false)}
            className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Cancel
          </button>
          <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
            Import
          </button>
        </div>
      </div>
    </Modal>
  ) : null;
}

export default ImportActivityExcel;
