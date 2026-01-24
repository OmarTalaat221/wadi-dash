import React, { useRef } from "react";
import { FaEye, FaCheck, FaImage } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdDelete, MdLink } from "react-icons/md";
import { message } from "antd";
import { uploadImageToServer } from "./../../hooks/uploadImage";

const TransferImages = ({ rowData, setRowData }) => {
  const imageInputRef = useRef(null);
  const urlInputRef = useRef(null);
  const imageRefs = useRef([]);

  const handleImageFilesChange = async (files) => {
    const loading = message.loading("Uploading images...", 0);

    try {
      const fileArray = [];

      for (let file of files) {
        const uploadedImageUrl = await uploadImageToServer(file);

        if (uploadedImageUrl) {
          fileArray.push({
            type: "url",
            file,
            value: uploadedImageUrl,
            preview: uploadedImageUrl,
          });
        }
      }

      setRowData((prev) => {
        const updated = [...(prev.images || []), ...fileArray];

        setTimeout(() => {
          fileArray.forEach((_, idx) => {
            const refIndex = (prev.images || []).length + idx;
            const imgRef = imageRefs.current[refIndex];
            if (imgRef) {
              imgRef.classList.add("zoomIn");
              setTimeout(() => imgRef.classList.remove("zoomIn"), 300);
            }
          });
        }, 10);

        return { ...prev, images: updated };
      });

      loading();
      message.success(`${fileArray.length} image(s) uploaded successfully!`);
    } catch (error) {
      loading();
      message.error("Failed to upload images");
      console.error("Upload error:", error);
    }
  };

  // ✅ Updated: Add URL Button Click Handler
  const handleAddUrlClick = () => {
    const url = urlInputRef.current?.value?.trim();

    if (!url) {
      message.warning("Please enter an image URL");
      return;
    }

    const imageData = {
      type: "url",
      value: url,
      preview: url,
    };

    setRowData((prev) => {
      const updated = [...(prev.images || []), imageData];

      setTimeout(() => {
        const refIndex = (prev.images || []).length;
        const imgRef = imageRefs.current[refIndex];
        if (imgRef) {
          imgRef.classList.add("zoomIn");
          setTimeout(() => imgRef.classList.remove("zoomIn"), 300);
        }
      }, 10);

      return { ...prev, images: updated };
    });

    message.success("Image URL added");
    if (urlInputRef.current) {
      urlInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    const imgRef = imageRefs.current[index];

    if (imgRef) {
      imgRef.classList.remove("zoomIn");
      imgRef.classList.add("zoomOut");

      setTimeout(() => {
        setRowData((prev) => ({
          ...prev,
          images: (prev.images || []).filter((_, i) => i !== index),
        }));
        imgRef.classList.remove("zoomOut");
      }, 300);
    }
  };

  const setAsMainImage = (index) => {
    const images = [...(rowData.images || [])];
    const [movedImage] = images.splice(index, 1);
    images.unshift(movedImage);

    setRowData((prev) => ({
      ...prev,
      images: images,
    }));

    message.success("Image set as main image!");
  };

  return (
    <fieldset className="border p-4 rounded">
      <legend className="font-medium mb-2">Images</legend>

      {/* ✅ Updated: Two Separate Buttons */}
      <div className="space-y-2 mb-4">
        <div className="flex gap-2">
          <input
            ref={urlInputRef}
            type="text"
            placeholder="Enter image URL"
            className="border border-gray-300 p-2 rounded flex-1"
          />
          <button
            type="button"
            onClick={handleAddUrlClick}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
          >
            <MdLink />
            Add URL
          </button>
          <label
            htmlFor="transfer-image-upload"
            className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
          >
            <FiPlus />
            Upload Files
          </label>
          <input
            id="transfer-image-upload"
            type="file"
            accept="image/*"
            multiple
            ref={imageInputRef}
            onChange={(e) => {
              if (e.target.files) {
                handleImageFilesChange(e.target.files);
                e.target.value = "";
              }
            }}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-3 m-auto">
          {(rowData.images || []).map((img, index) => {
            const isMainImage = index === 0;

            return (
              <div
                ref={(el) => {
                  imageRefs.current[index] = el;
                }}
                key={index}
                className={`w-[102px] h-[102px] overflow-hidden relative rounded-lg p-1 border-2 zoomIn transition-all duration-200 ${
                  isMainImage ? "border-blue-500" : "border-[#d9d9d9]"
                }`}
              >
                <img
                  src={img.preview || img.value}
                  alt={`uploaded-${index}`}
                  className="w-full h-full object-cover rounded"
                />

                {!isMainImage ? (
                  <button
                    type="button"
                    onClick={() => setAsMainImage(index)}
                    className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/50 hover:bg-blue-500 flex items-center justify-center text-white text-xs shadow-md transition-all"
                    title="Set as Main"
                  >
                    <FaImage className="text-[10px]" />
                  </button>
                ) : (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full px-2 py-0.5 text-[10px] shadow-md flex items-center gap-1">
                    <FaCheck className="text-[8px]" />
                    Main
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    window.open(img.preview || img.value, "_blank")
                  }
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-green-500 flex items-center justify-center text-white text-xs shadow-md transition-all"
                  title="Preview"
                >
                  <FaEye className="text-[10px]" />
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center text-white text-xs shadow-md transition-all"
                  title="Delete"
                >
                  <MdDelete className="text-[10px]" />
                </button>
              </div>
            );
          })}
        </div>

        {(rowData.images || []).length > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Total Images:</span>{" "}
            {rowData.images.length}
            {rowData.images.length > 0 && (
              <span className="ml-2 text-blue-600">
                • First image will be used as main image
              </span>
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
};

export default TransferImages;
