// components/tours-page/TourImages.jsx
import React, { useRef } from "react";
import { FaEye, FaImage } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { message } from "antd";
import { uploadImageToServer } from "./../../hooks/uploadImage";

const TourImages = ({ rowData, setRowData }) => {
  const imageInputRef = useRef(null);
  const imageRefs = useRef([]);

  const handleImageFilesChange = async (files) => {
    const loading = message.loading("Uploading images...", 0);

    try {
      const fileArray = [];

      for (let file of files) {
        // Upload each image to server
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

        // Add zoomIn to new refs
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

  const removeImage = (index) => {
    const imgRef = imageRefs.current[index];
    const imageToRemove = rowData.images[index];

    if (imgRef) {
      imgRef.classList.remove("zoomIn");
      imgRef.classList.add("zoomOut");

      setTimeout(() => {
        setRowData((prev) => {
          const newImages = prev.images.filter((_, i) => i !== index);

          // Reset cover and background if they were the removed image
          let updates = { images: newImages };
          if (prev.image === imageToRemove.value) {
            updates.image = "";
          }
          if (prev.background_image === imageToRemove.value) {
            updates.background_image = "";
          }

          return { ...prev, ...updates };
        });

        imgRef.classList.remove("zoomOut");
      }, 300);
    }
  };

  const setCoverImage = (imageUrl) => {
    setRowData((prev) => ({ ...prev, image: imageUrl }));
    message.success("Cover image set!");
  };

  const setBackgroundImage = (imageUrl) => {
    setRowData((prev) => ({ ...prev, background_image: imageUrl }));
    message.success("Background image set!");
  };

  return (
    <div className="space-y-4">
      <fieldset className="border p-4 rounded">
        <legend className="font-medium mb-2">Tour Images</legend>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-3 m-auto">
            <label
              htmlFor="tour-image-upload"
              className="cursor-pointer px-0 py-2 bg-[rgba(0,0,0,0.02)] border border-dashed border-[#d9d9d9] rounded-lg flex text-center text-[#555] w-[102px] h-[102px] text-xs flex-col gap-2 items-center justify-center hover:border-[#1677ff] transition duration-300 ease-in-out"
            >
              <FiPlus className="text-[15px]" />
              Add Image
            </label>
            <input
              id="tour-image-upload"
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
            {(rowData.images || []).map((img, index) => (
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

                  {/* Cover image indicator */}
                  {rowData.image === img.value && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1">
                      <FaImage className="text-xs" />
                    </div>
                  )}

                  {/* Background image indicator */}
                  {rowData.background_image === img.value && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                      <FaImage className="text-xs" />
                    </div>
                  )}

                  <div className="absolute top-0 left-0 w-full h-full bg-black/45 opacity-0 transition-all duration-300 group-hover:opacity-100 z-10" />
                  <div className="absolute inset-0 flex justify-center items-center gap-2 text-white opacity-0 group-hover:opacity-100 z-20">
                    <FaEye />
                    <FaImage
                      title="Set as Cover"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverImage(img.value);
                      }}
                      className="cursor-pointer hover:text-blue-300"
                    />
                    <FaImage
                      title="Set as Background"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBackgroundImage(img.value);
                      }}
                      className="cursor-pointer hover:text-green-300"
                    />
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="cursor-pointer hover:text-red-300"
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

      {/* Current selections display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-3 rounded">
          <label className="block text-sm font-medium mb-2">Cover Image</label>
          {rowData.image ? (
            <div className="w-20 h-20 border rounded overflow-hidden">
              <img
                src={rowData.image}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 border border-dashed rounded flex items-center justify-center text-gray-400">
              <FaImage />
            </div>
          )}
        </div>

        <div className="border p-3 rounded">
          <label className="block text-sm font-medium mb-2">
            Background Image
          </label>
          {rowData.background_image ? (
            <div className="w-20 h-20 border rounded overflow-hidden">
              <img
                src={rowData.background_image}
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 border border-dashed rounded flex items-center justify-center text-gray-400">
              <FaImage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourImages;
