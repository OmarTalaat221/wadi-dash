import React, { useRef } from "react";
import { FaEye } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdDelete } from "react-icons/md";

const TransferImages = ({ rowData, setRowData }) => {
  const imageInputRef = useRef(null);
  const imageRefs = useRef([]);

  const handleImageFilesChange = (files) => {
    const fileArray = Array.from(files).map((file) => ({
      type: "file",
      file,
      value: file.name,
      preview: URL.createObjectURL(file),
    }));

    setRowData((prev) => {
      const updated = [...prev.images, ...fileArray];

      // Add zoomIn to new refs
      setTimeout(() => {
        fileArray.forEach((_, idx) => {
          const refIndex = prev.images.length + idx;
          const imgRef = imageRefs.current[refIndex];
          if (imgRef) {
            imgRef.classList.add("zoomIn");

            setTimeout(() => imgRef.classList.remove("zoomIn"), 300);
          }
        });
      }, 10);

      return { ...prev, images: updated };
    });
  };

  const removeImage = (index) => {
    const imgRef = imageRefs.current[index];

    if (imgRef) {
      imgRef.classList.remove("zoomIn");
      imgRef.classList.add("zoomOut");

      setTimeout(() => {
        setRowData((prev) => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
        }));

        // No need to manually remove class; image is removed from DOM
        // But if you're reusing DOM nodes, do it here instead:
        imgRef.classList.remove("zoomOut");
      }, 300); // Match this with animation duration
    }
  };
  return (
    <fieldset className="border p-4 rounded">
      <legend className="font-medium mb-2">Images</legend>
      <div className="space-y-2">
        {/* Upload area */}

        <div className="flex flex-wrap gap-3 m-auto">
          <label
            htmlFor="image-upload"
            className="cursor-pointer px-0 py-2 bg-[rgba(0,0,0,0.02)] border border-dashed border-[#d9d9d9] rounded-lg flex text-center text-[#555] w-[102px] h-[102px] text-xs flex-col gap-2 items-center justify-center hover:border-[#1677ff] transition duration-300 ease-in-out"
          >
            <FiPlus className="text-[15px]" />
            Add Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            ref={imageInputRef}
            onChange={(e) => {
              if (e.target.files) {
                handleImageFilesChange(e.target.files);
              }
            }}
            className="hidden"
          />
          {rowData.images.map((img, index) => (
            <div
              ref={(el) => {
                imageRefs.current[index] = el;
              }}
              key={index}
              className="w-[102px] h-[102px] overflow-hidden relative cursor-pointer rounded-lg p-2 border border-[#d9d9d9] zoomIn"
            >
              <div className="w-full h-full relative group">
                <img
                  src={img.preview || img.value}
                  alt={`uploaded-${index}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-black/45 opacity-0 transition-all duration-300 group-hover:opacity-100 z-10" />
                <div className="absolute inset-0 flex justify-center items-center gap-2 text-white opacity-0 group-hover:opacity-100 z-20">
                  <FaEye />
                  <div
                    onClick={() => removeImage(index)}
                    className="cursor-pointer"
                  >
                    <MdDelete />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  );
};

export default TransferImages;
