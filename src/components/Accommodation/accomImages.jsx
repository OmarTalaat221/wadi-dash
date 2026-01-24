import React, { useRef, useState } from "react";
import { FaEye, FaSpinner, FaStar } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdDelete, MdLink } from "react-icons/md";
import { uploadImageToServer } from "../../hooks/uploadImage";
import { message } from "antd";

const AccomImages = ({ rowData, setRowData }) => {
  const imageInputRef = useRef(null);
  const urlInputRef = useRef(null);
  const imageRefs = useRef([]);
  const [uploading, setUploading] = useState({});

  const imagesArray = rowData.image
    ? rowData.image.split("//CAMP//").filter((img) => img)
    : [];

  const handleImageFilesChange = async (files) => {
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const uploadId = Date.now() + i;

      setUploading((prev) => ({ ...prev, [uploadId]: true }));

      try {
        message.loading(
          `Uploading image ${i + 1} of ${fileArray.length}...`,
          0
        );

        const uploadResult = await uploadImageToServer(file);

        if (uploadResult) {
          const updatedImages = [...imagesArray, uploadResult];
          setRowData((prev) => ({
            ...prev,
            image: updatedImages.join("//CAMP//"),
          }));

          setTimeout(() => {
            const imgRef = imageRefs.current[updatedImages.length - 1];
            if (imgRef) {
              imgRef.classList.add("zoomIn");
              setTimeout(() => imgRef.classList.remove("zoomIn"), 300);
            }
          }, 100);

          message.destroy();
          message.success(`Image ${i + 1} uploaded successfully!`);
        } else {
          throw new Error(uploadResult.error || "Upload failed");
        }
      } catch (error) {
        message.destroy();
        message.error(`Failed to upload image ${i + 1}: ${error.message}`);
        console.error("Upload error:", error);
      } finally {
        setUploading((prev) => {
          const newState = { ...prev };
          delete newState[uploadId];
          return newState;
        });
      }
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // ✅ Updated: Add URL Button Click Handler
  const handleAddUrlClick = () => {
    const url = urlInputRef.current?.value?.trim();

    if (!url) {
      message.warning("Please enter an image URL");
      return;
    }

    const updatedImages = [...imagesArray, url];
    setRowData((prev) => ({
      ...prev,
      image: updatedImages.join("//CAMP//"),
    }));

    setTimeout(() => {
      const imgRef = imageRefs.current[updatedImages.length - 1];
      if (imgRef) {
        imgRef.classList.add("zoomIn");
        setTimeout(() => imgRef.classList.remove("zoomIn"), 300);
      }
    }, 10);

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
        const updatedImages = imagesArray.filter((_, i) => i !== index);
        setRowData((prev) => ({
          ...prev,
          image: updatedImages.join("//CAMP//"),
        }));
        imgRef.classList.remove("zoomOut");
      }, 300);
    }
  };

  const moveToFirst = (index) => {
    const updatedImages = [...imagesArray];
    const [movedImage] = updatedImages.splice(index, 1);
    updatedImages.unshift(movedImage);

    setRowData((prev) => ({
      ...prev,
      image: updatedImages.join("//CAMP//"),
    }));

    message.success("Image set as main/background image!");
  };

  const isUploading = Object.keys(uploading).length > 0;

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
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={handleAddUrlClick}
            disabled={isUploading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdLink />
            Add URL
          </button>
          <label
            htmlFor="image-upload"
            className={`cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <>
                <FaSpinner className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FiPlus />
                Upload Files
              </>
            )}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            ref={imageInputRef}
            onChange={(e) => {
              if (e.target.files && !isUploading) {
                handleImageFilesChange(e.target.files);
              }
            }}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-3 m-auto">
          {imagesArray.length === 0 && !isUploading && (
            <div className="w-full text-center text-gray-500 py-8">
              No images uploaded yet. Upload files or add image URL.
            </div>
          )}

          {imagesArray.map((img, index) => {
            const isMainImage = index === 0;

            return (
              <div
                ref={(el) => {
                  imageRefs.current[index] = el;
                }}
                key={index}
                className={`w-[102px] h-[102px] overflow-hidden relative rounded-lg p-1 border-2 zoomIn transition-all duration-200 ${
                  isMainImage ? "border-green-500" : "border-[#d9d9d9]"
                }`}
              >
                <img
                  src={img}
                  alt={`uploaded-${index}`}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/102?text=Error";
                  }}
                />

                {!isMainImage && (
                  <button
                    type="button"
                    onClick={() => moveToFirst(index)}
                    className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/50 hover:bg-green-500 flex items-center justify-center text-white text-xs shadow-md transition-all"
                    title="Set as Main Image"
                  >
                    <FaStar className="text-[10px]" />
                  </button>
                )}

                {isMainImage && (
                  <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full px-2 py-0.5 text-[10px] shadow-md flex items-center gap-1">
                    <FaStar className="text-[8px]" />
                    Main
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => window.open(img, "_blank")}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-blue-500 flex items-center justify-center text-white text-xs shadow-md transition-all"
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

        {imagesArray.length > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Total Images:</span>{" "}
            {imagesArray.length}
            <span className="ml-2 text-green-600 flex items-center gap-1 mt-1">
              <FaStar className="text-xs" />
              First image will be used as main/background image
            </span>
          </div>
        )}
      </div>
    </fieldset>
  );
};

export default AccomImages;
