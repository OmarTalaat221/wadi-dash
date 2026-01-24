import React, { useState, useRef } from "react";
import Tabs from "../../../components/Tabs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import { FaEye, FaCheck, FaImage } from "react-icons/fa";
import { MdDelete, MdWallpaper } from "react-icons/md";
import JoditEditor from "jodit-react";
import editorConfig from "../../../data/joditConfig";
import { useNavigate } from "react-router-dom";
import { message, Select } from "antd";
import axios from "axios";
import { base_url } from "../../../utils/base_url";
import { uploadImageToServer } from "./../../../hooks/uploadImage";

const { Option } = Select;

function CreateCarLayout() {
  const navigate = useNavigate();
  const imageRefs = useRef([]);

  const [formData, setFormData] = useState({
    country_id: "1",
    title: "",
    subtitle: "",
    description: "",
    background_image: "",
    cta_button_text: "Rent Now",
    cta_button_url: "",
    category: "car",
    duration: "1 DAY",
    location: "",
    price_current: "",
    price_original: "",
    price_currency: "$",
    price_note: "PER DAY",
    max_people: "PER DAY",
    car_type: "",
    features: [],
    images: [],
  });

  const [activeTab, setActiveTab] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFilesChange = async (files) => {
    setIsUploading(true);

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

      setFormData((prev) => {
        const updated = [...prev.images, ...fileArray];

        const newFormData = {
          ...prev,
          images: updated,
          background_image: prev.background_image || updated[0]?.preview || "",
        };

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

        return newFormData;
      });

      message.success(`${fileArray.length} image(s) uploaded successfully!`);
    } catch (error) {
      message.error("Failed to upload images");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    const imgRef = imageRefs.current[index];

    if (imgRef) {
      imgRef.classList.remove("zoomIn");
      imgRef.classList.add("zoomOut");

      setTimeout(() => {
        setFormData((prev) => {
          const updatedImages = prev.images.filter((_, i) => i !== index);
          const removedImageUrl =
            prev.images[index]?.preview || prev.images[index]?.value;

          return {
            ...prev,
            images: updatedImages,
            background_image:
              prev.background_image === removedImageUrl
                ? updatedImages[0]?.preview || ""
                : prev.background_image,
          };
        });
        imgRef.classList.remove("zoomOut");
      }, 300);
    }
  };

  const setBackgroundImage = (imageUrl) => {
    setFormData((prev) => ({ ...prev, background_image: imageUrl }));
    message.success("Background image set!");
  };

  const handleFeatureFieldChange = (index, field, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setFormData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { feature: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const featuresString = formData.features
        .map((f) => f.feature || f.label || f.value || "")
        .filter((f) => f.trim() !== "")
        .join("**");

      const imagesString = formData.images
        .map((img) => img.preview || img.value || "")
        .filter((img) => img.trim() !== "")
        .join("//CAMP//");

      const payload = {
        country_id: formData.country_id,
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        background_image: formData.background_image,
        cta_button_text: formData.cta_button_text,
        cta_button_url: formData.cta_button_url,
        category: formData.category,
        duration: formData.duration,
        image: imagesString,
        location: formData.location,
        price_current: formData.price_current,
        price_original: formData.price_original,
        price_currency: formData.price_currency,
        price_note: formData.price_note,
        car_type: formData.car_type,
        features: featuresString,
      };

      const response = await axios.post(
        `${base_url}/admin/cars/add_cars.php`,
        payload
      );

      message.success("Car created successfully!");
      navigate("/transfer");
    } catch (error) {
      message.error("Failed to create car");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTabContent = () => {
    if (activeTab === "General") {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block !mb-1 font-medium">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                required
                className="w-full !border border-gray-300 !p-2 rounded"
              />
            </div>

            <div>
              <label className="block !mb-1 font-medium">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle || ""}
                onChange={handleChange}
                className="w-full !border border-gray-300 !p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Car Type *</label>
              <Select
                value={formData.car_type || undefined}
                onChange={(value) => handleSelectChange("car_type", value)}
                placeholder="Select Car Type"
                className="w-full"
                size="large"
              >
                <Option value="SUV">SUV</Option>
                <Option value="Sedan">Sedan</Option>
                <Option value="Sports Car">Sports Car</Option>
                <Option value="Compact">Compact</Option>
                <Option value="Luxury">Luxury</Option>
                <Option value="Electric">Electric</Option>
              </Select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Current Price *</label>
              <input
                type="number"
                name="price_current"
                value={formData.price_current || ""}
                onChange={handleChange}
                required
                step="0.01"
                onWheel={(e) => e.target.blur()}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Original Price</label>
              <input
                type="number"
                name="price_original"
                value={formData.price_original || ""}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                step="0.01"
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration || ""}
                onChange={handleChange}
                placeholder="e.g., 1 DAY"
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Price Note</label>
              <input
                type="text"
                name="price_note"
                value={formData.price_note || ""}
                onChange={handleChange}
                placeholder="e.g., PER DAY"
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Max People *</label>
            <input
              type="number"
              name="max_people"
              value={formData.max_people || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              onWheel={(e) => e.target.blur()}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <JoditEditor
              value={formData.description || ""}
              config={editorConfig}
              onBlur={(content) =>
                setFormData((prev) => ({ ...prev, description: content }))
              }
            />
          </div>
        </>
      );
    }

    if (activeTab === "Features") {
      return (
        <fieldset className="border p-4 rounded">
          <legend className="font-medium mb-2">Features</legend>

          <button
            type="button"
            title="Add New Feature"
            className="group cursor-pointer outline-none hover:rotate-90 duration-300 mb-4"
            onClick={addFeature}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50px"
              height="50px"
              viewBox="0 0 24 24"
              className="stroke-slate-400 fill-none group-active:stroke-slate-200 group-active:fill-slate-600 group-active:duration-0 duration-300"
            >
              <path
                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                strokeWidth="1.5"
              ></path>
              <path d="M8 12H16" strokeWidth="1.5"></path>
              <path d="M12 16V8" strokeWidth="1.5"></path>
            </svg>
          </button>

          <div className="grid grid-cols-3 gap-[10px]">
            {formData.features.map((feature, index) => (
              <div key={index} className="mb-3 space-y-2 border p-2 rounded">
                <div className="flex items-center space-x-2">
                  <label className="w-24">Feature:</label>
                  <input
                    type="text"
                    value={feature.feature || ""}
                    onChange={(e) =>
                      handleFeatureFieldChange(index, "feature", e.target.value)
                    }
                    className="w-full border border-gray-300 p-2 rounded"
                    placeholder="e.g., GPS, Bluetooth"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="bg-red-500 text-white py-[10px] px-3 rounded hover:bg-red-600 transition-colors duration-200"
                >
                  <RiDeleteBin6Line />
                </button>
              </div>
            ))}
          </div>
        </fieldset>
      );
    }

    if (activeTab === "Images") {
      return (
        <fieldset className="border p-4 rounded">
          <legend className="font-medium mb-2">Images</legend>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-3 m-auto">
              <label
                htmlFor="image-upload"
                className={`cursor-pointer px-0 py-2 bg-[rgba(0,0,0,0.02)] border border-dashed border-[#d9d9d9] rounded-lg flex text-center text-[#555] w-[102px] h-[102px] text-xs flex-col gap-2 items-center justify-center hover:border-[#1677ff] transition duration-300 ease-in-out ${
                  isUploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <FiPlus className="text-[15px]" />
                    Add Image
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
                  if (e.target.files) {
                    handleImageFilesChange(e.target.files);
                  }
                }}
                className="hidden"
                disabled={isUploading}
              />

              {formData.images.map((img, index) => {
                const imageUrl = img.preview || img.value;
                const isBackgroundImage =
                  formData.background_image === imageUrl;

                return (
                  <div
                    ref={(el) => {
                      imageRefs.current[index] = el;
                    }}
                    key={index}
                    className={`w-[102px] h-[102px] overflow-hidden relative rounded-lg p-1 border-2 zoomIn transition-all duration-200 ${
                      isBackgroundImage
                        ? "border-green-500"
                        : "border-[#d9d9d9]"
                    }`}
                  >
                    {/* Image */}
                    <img
                      src={imageUrl}
                      alt={`uploaded-${index}`}
                      className="w-full h-full object-cover rounded"
                    />

                    {/* Top-Left: Set as Background Button */}
                    {!isBackgroundImage ? (
                      <button
                        type="button"
                        onClick={() => setBackgroundImage(imageUrl)}
                        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/50 hover:bg-green-500 flex items-center justify-center text-white text-xs shadow-md transition-all"
                        title="Set as Background"
                      >
                        <MdWallpaper className="text-[10px]" />
                      </button>
                    ) : (
                      <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full px-2 py-0.5 text-[10px] shadow-md flex items-center gap-1">
                        <FaCheck className="text-[8px]" />
                        BG
                      </div>
                    )}

                    {/* Top-Right: Preview Button */}
                    <button
                      type="button"
                      onClick={() => window.open(imageUrl, "_blank")}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-blue-500 flex items-center justify-center text-white text-xs shadow-md transition-all"
                      title="Preview"
                    >
                      <FaEye className="text-[10px]" />
                    </button>

                    {/* Bottom-Right: Delete Button */}
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

            {formData.images.length > 0 && (
              <div className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Total Images:</span>{" "}
                {formData.images.length}
                {formData.background_image && (
                  <span className="ml-2 text-green-600">
                    • Background image selected
                  </span>
                )}
              </div>
            )}
          </div>
        </fieldset>
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Car Rental</h1>
      <div className="mb-4">
        <nav className="flex justify-between items-center gap-0.5 w-[100%]">
          <Tabs
            tabs={["General", "Features", "Images"]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            classNameDecoration=""
            className=""
          />
          <button
            type="submit"
            form="car-form"
            disabled={isSubmitting || isUploading}
            className="bg-blue-500 text-white !py-2 !px-4 rounded hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
          >
            {isSubmitting ? "Creating..." : "Create Car"}
          </button>
        </nav>
      </div>
      <form
        id="car-form"
        onSubmit={handleSubmit}
        className="space-y-6 bg-white !p-5 rounded-[10px]"
      >
        {renderTabContent()}
      </form>
    </div>
  );
}

export default CreateCarLayout;
