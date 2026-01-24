import React, { useRef } from "react";
import { FaEye, FaImage, FaCheck } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdDelete, MdWallpaper, MdLink } from "react-icons/md";
import { message } from "antd";
import { uploadImageToServer } from "./../../hooks/uploadImage";

const TourImages = ({ rowData, setRowData }) => {
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
    const imageToRemove = rowData.images[index];

    if (imgRef) {
      imgRef.classList.remove("zoomIn");
      imgRef.classList.add("zoomOut");

      setTimeout(() => {
        setRowData((prev) => {
          const newImages = prev.images.filter((_, i) => i !== index);

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

  const isBackgroundImage = (imageUrl) => rowData.background_image === imageUrl;
  const isCoverImage = (imageUrl) => rowData.image === imageUrl;

  return (
    <div className="space-y-4">
      <fieldset className="border p-4 rounded">
        <legend className="font-medium mb-2">Tour Images</legend>

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
              htmlFor="tour-image-upload"
              className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
            >
              <FiPlus />
              Upload Files
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
              const isBackground = isBackgroundImage(img.value);
              const isCover = isCoverImage(img.value);

              return (
                <div
                  ref={(el) => {
                    imageRefs.current[index] = el;
                  }}
                  key={index}
                  className={`w-[102px] h-[102px] overflow-hidden relative rounded-lg p-1 border-2 zoomIn transition-all duration-200 ${
                    isBackground
                      ? "border-green-500"
                      : isCover
                        ? "border-blue-500"
                        : "border-[#d9d9d9]"
                  }`}
                >
                  <img
                    src={img.preview || img.value}
                    alt={`uploaded-${index}`}
                    className="w-full h-full object-cover rounded"
                  />

                  <button
                    type="button"
                    onClick={() => setCoverImage(img.value)}
                    className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-md transition-all ${
                      isCover ? "bg-blue-500" : "bg-black/50 hover:bg-blue-500"
                    }`}
                    title="Set as Cover"
                  >
                    {isCover ? (
                      <FaCheck className="text-[10px]" />
                    ) : (
                      <FaImage className="text-[10px]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setBackgroundImage(img.value)}
                    className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-md transition-all ${
                      isBackground
                        ? "bg-green-500"
                        : "bg-black/50 hover:bg-green-500"
                    }`}
                    title="Set as Background"
                  >
                    {isBackground ? (
                      <FaCheck className="text-[10px]" />
                    ) : (
                      <MdWallpaper className="text-[10px]" />
                    )}
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
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-3 rounded">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
            Cover Image
          </label>
          {rowData.image ? (
            <div className="w-20 h-20 border-2 border-blue-500 rounded overflow-hidden">
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
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
            Background Image
          </label>
          {rowData.background_image ? (
            <div className="w-20 h-20 border-2 border-green-500 rounded overflow-hidden">
              <img
                src={rowData.background_image}
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 border border-dashed rounded flex items-center justify-center text-gray-400">
              <MdWallpaper />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourImages;
