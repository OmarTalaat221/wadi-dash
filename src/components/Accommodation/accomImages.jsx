// src/components/Accommodation/accomImages.jsx
import React, { useRef, useState } from "react";
import { FaEye, FaSpinner } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { uploadImageToServer } from "../../hooks/uploadImage";
import { message } from "antd";

const AccomImages = ({ rowData, setRowData }) => {
  const imageInputRef = useRef(null);
  const imageRefs = useRef([]);
  const [uploading, setUploading] = useState({});

  // Parse image string to array
  const imagesArray = rowData.image
    ? rowData.image.split("//CAMP//").filter((img) => img)
    : [];

  const handleImageFilesChange = async (files) => {
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const uploadId = Date.now() + i; // Unique ID for tracking upload

      // Set uploading state
      setUploading((prev) => ({ ...prev, [uploadId]: true }));

      try {
        message.loading(
          `Uploading image ${i + 1} of ${fileArray.length}...`,
          0
        );

        // Upload to server
        const uploadResult = await uploadImageToServer(file);

        if (uploadResult) {
          // Add uploaded image URL to the array
          const updatedImages = [...imagesArray, uploadResult];
          setRowData((prev) => ({
            ...prev,
            image: updatedImages.join("//CAMP//"),
          }));

          console.log(updatedImages, "updated");

          // Add animation effect
          setTimeout(() => {
            const imgRef = imageRefs.current[updatedImages.length - 1];
            if (imgRef) {
              imgRef.classList.add("zoomIn");
              setTimeout(() => imgRef.classList.remove("zoomIn"), 300);
            }
          }, 100);

          message.destroy(); // Remove loading message
          message.success(`Image ${i + 1} uploaded successfully!`);
        } else {
          throw new Error(uploadResult.error || "Upload failed");
        }
      } catch (error) {
        message.destroy(); // Remove loading message
        message.error(`Failed to upload image ${i + 1}: ${error.message}`);
        console.error("Upload error:", error);
      } finally {
        // Remove uploading state
        setUploading((prev) => {
          const newState = { ...prev };
          delete newState[uploadId];
          return newState;
        });
      }
    }

    // Reset file input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
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

  const handleImageUrlAdd = () => {
    const url = prompt("Enter image URL:");
    if (url && url.trim()) {
      const updatedImages = [...imagesArray, url.trim()];
      setRowData((prev) => ({
        ...prev,
        image: updatedImages.join("//CAMP//"),
      }));
      message.success("Image URL added successfully!");
    }
  };

  const isUploading = Object.keys(uploading).length > 0;

  return (
    <fieldset className="border p-4 rounded">
      <legend className="font-medium mb-2">Images</legend>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-3 m-auto">
          {/* File Upload Button */}
          <label
            htmlFor="image-upload" // ✅ Added this - connects label to input
            className={`cursor-pointer px-0 py-2 bg-[rgba(0,0,0,0.02)] border border-dashed border-[#d9d9d9] rounded-lg flex text-center text-[#555] w-[102px] h-[102px] text-xs flex-col gap-2 items-center justify-center hover:border-[#1677ff] transition duration-300 ease-in-out ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <>
                <FaSpinner className="text-[15px] animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FiPlus className="text-[15px]" />
                Upload Image
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

          {/* URL Input Button */}
          {/* <div
            onClick={handleImageUrlAdd}
            className="cursor-pointer px-0 py-2 bg-[rgba(0,0,0,0.02)] border border-dashed border-[#f59e0b] rounded-lg flex text-center text-[#f59e0b] w-[102px] h-[102px] text-xs flex-col gap-2 items-center justify-center hover:border-[#d97706] transition duration-300 ease-in-out"
          >
            <FiPlus className="text-[15px]" />
            Add URL
          </div> */}

          {imagesArray.length === 0 && !isUploading && (
            <div className="w-full text-center text-gray-500 py-8">
              No images uploaded yet. Click to upload files or add image URLs.
            </div>
          )}

          {imagesArray.map((img, index) => (
            <div
              ref={(el) => {
                imageRefs.current[index] = el;
              }}
              key={index}
              className="w-[102px] h-[102px] overflow-hidden relative cursor-pointer rounded-lg p-2 border border-[#d9d9d9] zoomIn"
            >
              <div className="w-full h-full relative group">
                <img
                  src={img}
                  alt={`uploaded-${index}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/102?text=Error";
                  }}
                />
                <div className="absolute top-0 left-0 w-full h-full bg-black/45 opacity-0 transition-all duration-300 group-hover:opacity-100 z-10" />
                <div className="absolute inset-0 flex justify-center items-center gap-2 text-white opacity-0 group-hover:opacity-100 z-20">
                  <FaEye
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(img, "_blank");
                    }}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  />
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    <MdDelete />
                  </div>
                </div>
              </div>

              {/* Image info tooltip */}
              <div className="absolute -bottom-6 left-0 right-0 text-xs text-center text-gray-600 truncate">
                {index === 0 && (
                  <span className="text-green-600 font-bold">Main</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {imagesArray.length > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Total Images:</span>{" "}
            {imagesArray.length}
            {imagesArray.length > 0 && (
              <span className="ml-2 text-green-600">
                • First image will be used as background image
              </span>
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
};

export default AccomImages;
