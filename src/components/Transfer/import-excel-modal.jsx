import React, { useState } from "react";
import Modal from "../modal";
import { readExcelFile } from "../../utils/xlsx-reader";

function FooterButtons({}) {
  return (
    <div className="flex gap-2 items-center w-full justify-end">
      <button className="inline-block bg-[#295557] text-white text-[15px] py-2 px-6 text-lg font-bold rounded transition-colors duration-300 ease-in-out hover:bg-[#563218] justify-self-end">
        Next Step
      </button>
    </div>
  );
}

function ImportTransferExcel({ open, setOpen }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const data = await readExcelFile(e.dataTransfer.files[0]);
      console.log("data", data);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  return open ? (
    <Modal
      title={"Import Transfer Excel"}
      setOpen={setOpen}
      open={open}
      footer={<FooterButtons />}
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`import-tour-accommodation min-h-[270px] py-3 flex justify-center items-center border-dashed border-3 w-[96%] m-auto flex-col gap-2 ${
          dragging ? "border-amber-700" : "border-amber-900"
        }`}
      >
        <img
          className="w-[80px] h-[80px] mb-[20px]"
          src="https://res.cloudinary.com/duovxefh6/image/upload/v1744214018/images_up6yzs.png"
          alt="Upload File"
        />
        <p className="text-[20px] text-[#64401acb] space-x-1">
          Drag Your File Here Or{" "}
        </p>
        <label
          htmlFor="import-transfer-excel"
          className="inline-block bg-[#295557] text-white text-[15px] py-2 px-6 text-lg font-bold rounded transition-colors ease-in-out duration-300 hover:bg-[#64401acb] cursor-pointer "
        >
          Click To Browse
        </label>
        <input
          onChange={async (e) => {
            const data = await readExcelFile(e.target.files[0]);
            console.log("data", data);
          }}
          type="file"
          name="import-transfer-excel"
          id="import-transfer-excel"
          className="hidden"
        />
      </div>
    </Modal>
  ) : null;
}

export default ImportTransferExcel;
