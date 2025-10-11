import React, { useRef, useState } from "react";
import { FaEye } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { message, Spin } from "antd";
import { uploadImageToServer } from "../../hooks/uploadImage";

const ActivityImages = ({ rowData, setRowData }) => {
  const imageInputRef = useRef(null);
  const imageRefs = useRef([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleImageFilesChange = async (files) => {
    setUploadingImages(true);
    const fileArray = Array.from(files);
    const uploadedImages = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        try {
          // Upload image to server
          const response = await uploadImageToServer(file);

          // Assuming response contains the image URL
          const imageUrl =
            response.url ||
            response.image_url ||
            response.data?.url ||
            response;

          uploadedImages.push({
            type: "uploaded",
            value: imageUrl,
            preview: imageUrl,
            file: file,
          });
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          message.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedImages.length > 0) {
        message.success(
          `Successfully uploaded ${uploadedImages.length} image(s)`
        );

        setRowData((prev) => {
          const updated = [...prev.images, ...uploadedImages];

          setTimeout(() => {
            uploadedImages.forEach((_, idx) => {
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
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      message.error("Error uploading images");
    } finally {
      setUploadingImages(false);
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
          images: prev.images.filter((_, i) => i !== index),
        }));
        imgRef.classList.remove("zoomOut");
      }, 300);
    }
  };

  return (
    <fieldset className="border p-4 rounded">
      <legend className="font-medium mb-2">Activity Images</legend>

      {uploadingImages && (
        <div className="mb-4 flex items-center gap-2">
          <Spin />
          <span>Uploading images to server...</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex flex-wrap gap-3 m-auto">
          <label
            htmlFor="image-upload"
            className={`cursor-pointer px-0 py-2 bg-[rgba(0,0,0,0.02)] border border-dashed border-[#d9d9d9] rounded-lg flex text-center text-[#555] w-[102px] h-[102px] text-xs flex-col gap-2 items-center justify-center hover:border-[#1677ff] transition duration-300 ease-in-out ${
              uploadingImages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FiPlus className="text-[15px]" />
            {uploadingImages ? "Uploading..." : "Add Image"}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            ref={imageInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleImageFilesChange(e.target.files);
                e.target.value = "";
              }
            }}
            className="hidden"
            disabled={uploadingImages}
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

export default ActivityImages;
