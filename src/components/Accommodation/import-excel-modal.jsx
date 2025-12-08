// src/components/Accommodation/import-excel-modal.jsx
import React, { useState } from "react";
import Modal from "../modal";
import { readExcelFile } from "../../utils/xlsx-reader";

function FooterButtons({ onNext, loading }) {
  return (
    <div className="flex gap-2 items-center w-full justify-end">
      <button
        onClick={onNext}
        disabled={loading}
        className="inline-block bg-[#295557] text-white text-[15px] py-2 px-6 text-lg font-bold rounded transition-colors duration-300 ease-in-out hover:bg-[#563218] justify-self-end disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Next Step"}
      </button>
    </div>
  );
}

function ImportAccommodationsExcel({ open, setOpen, onImportSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [importData, setImportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const processFile = async (file) => {
    setLoading(true);
    try {
      const data = await readExcelFile(file);
      console.log("Imported data:", data);
      setImportData(data);
      message.success(`Successfully read ${data.length} rows from Excel`);
    } catch (error) {
      message.error("Failed to read Excel file");
      console.error(error);
    }
    setLoading(false);
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleNextStep = () => {
    if (!importData || importData.length === 0) {
      message.error("Please import a file first");
      return;
    }
    message.success("Import process will be implemented");
    if (onImportSuccess) {
      onImportSuccess();
    }
    setOpen(false);
  };

  const handleClose = () => {
    setImportData(null);
    setOpen(false);
  };

  return open ? (
    <Modal
      title={"Import Accommodation Excel"}
      setOpen={handleClose}
      open={open}
      footer={<FooterButtons onNext={handleNextStep} loading={loading} />}
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`import-tour-accommodation min-h-[270px] py-3 flex justify-center items-center border-dashed border-3 w-[96%] m-auto flex-col gap-2 rounded-lg transition-colors ${
          dragging ? "border-amber-700 bg-amber-50" : "border-amber-900"
        }`}
      >
        <img
          className="w-[80px] h-[80px] mb-[20px]"
          src="https://res.cloudinary.com/duovxefh6/image/upload/v1744214018/images_up6yzs.png"
          alt="Upload File"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#295557]"></div>
            <p className="text-[16px] text-[#64401acb]">Processing file...</p>
          </div>
        ) : importData ? (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-16 h-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-[18px] text-green-600 font-bold">
              {importData.length} rows loaded
            </p>
            <button
              onClick={() => setImportData(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              Upload different file
            </button>
          </div>
        ) : (
          <>
            <p className="text-[20px] text-[#64401acb] space-x-1">
              Drag Your File Here Or{" "}
            </p>
            <label
              htmlFor="import-accommodation-excel"
              className="inline-block bg-[#295557] text-white text-[15px] py-2 px-6 text-lg font-bold rounded transition-colors ease-in-out duration-300 hover:bg-[#64401acb] cursor-pointer"
            >
              Click To Browse
            </label>
            <input
              onChange={handleFileChange}
              type="file"
              id="import-accommodation-excel"
              className="hidden"
              accept=".xlsx,.xls,.csv"
            />
          </>
        )}
      </div>
    </Modal>
  ) : null;
}

export default ImportAccommodationsExcel;
