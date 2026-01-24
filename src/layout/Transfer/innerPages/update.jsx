import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tabs from "../../../components/Tabs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import { FaEye, FaCheck } from "react-icons/fa";
import { MdDelete, MdWallpaper } from "react-icons/md";
import JoditEditor from "jodit-react";
import editorConfig from "../../../data/joditConfig";
import { message, Select } from "antd";
import axios from "axios";
import { base_url } from "../../../utils/base_url";
import { uploadImageToServer } from "./../../../hooks/uploadImage";
import TransferImages from "../../../components/Transfer/transferImages";

const { Option } = Select;

function UpdateCarLayout() {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const imageRefs = useRef([]);
  const imageInputRef = useRef(null);

  const [rowData, setRowData] = useState(null);
  const [activeTab, setActiveTab] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCarData();
  }, [product_id]);

  const fetchCarData = async () => {
    try {
      const response = await axios.get(
        `${base_url}/admin/cars/select_cars.php`
      );

      if (response.data.status === "success") {
        const car = response.data.message.find((c) => c.id === product_id);

        if (car) {
          const imagesArray = car.image
            ? car.image.split("//CAMP//").map((url, index) => ({
                type: "url",
                value: url.trim(),
                preview: url.trim(),
              }))
            : [];

          const featuresArray = car.features.map((f) => ({
            feature_id: f.feature_id,
            feature: f.feature,
            label: f.feature,
            value: f.feature,
          }));

          setRowData({
            ...car,
            images: imagesArray,
            features: featuresArray,
          });
        } else {
          message.error("Car not found");
          navigate("/transfer");
        }
      }
    } catch (error) {
      message.error("Failed to load car data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setRowData((prev) => ({ ...prev, [name]: value }));
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

      setRowData((prev) => {
        const updated = [...prev.images, ...fileArray];

        const newRowData = {
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

        return newRowData;
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
        setRowData((prev) => {
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
    setRowData((prev) => ({ ...prev, background_image: imageUrl }));
    message.success("Background image set!");
  };

  const handleFeatureFieldChange = (index, field, value) => {
    const updatedFeatures = [...rowData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setRowData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  const removeFeature = (index) => {
    setRowData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    setRowData((prev) => ({
      ...prev,
      features: [...prev.features, { feature: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const featuresString = rowData.features
        .map((f) => f.feature || f.label || f.value || "")
        .filter((f) => f.trim() !== "")
        .join("**");

      const imagesString = rowData.images
        .map((img) => img.preview || img.value || "")
        .filter((img) => img.trim() !== "")
        .join("//CAMP//");

      const payload = {
        id: rowData.id,
        country_id: rowData.country_id,
        title: rowData.title,
        subtitle: rowData.subtitle,
        description: rowData.description,
        background_image: rowData.background_image,
        cta_button_text: rowData.cta_button_text,
        cta_button_url: rowData.cta_button_url,
        category: rowData.category,
        duration: rowData.duration,
        image: imagesString,
        location: rowData.location,
        price_current: rowData.price_current,
        price_original: rowData.price_original,
        price_currency: rowData.price_currency,
        price_note: rowData.price_note,
        car_type: rowData.car_type,
        max_people: rowData.max_people,
        features: featuresString,
      };

      const response = await axios.post(
        `${base_url}/admin/cars/edit_car.php`,
        payload
      );

      message.success("Car updated successfully!");
      navigate("/transfer");
    } catch (error) {
      message.error("Failed to update car");
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
              <label className="block mb-1 font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={rowData.title || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={rowData.subtitle || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Car Type</label>
              <Select
                value={rowData.car_type || undefined}
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
              <label className="block mb-1 font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={rowData.location || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Current Price</label>
              <input
                type="number"
                name="price_current"
                value={rowData.price_current || ""}
                onChange={handleChange}
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
                value={rowData.price_original || ""}
                onChange={handleChange}
                step="0.01"
                onWheel={(e) => e.target.blur()}
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
                value={rowData.duration || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Price Note</label>
              <input
                type="text"
                name="price_note"
                value={rowData.price_note || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Max Pepole *</label>
            <input
              type="number"
              name="max_people"
              value={rowData.max_people || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              onWheel={(e) => e.target.blur()}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <JoditEditor
              value={rowData.description || ""}
              config={editorConfig}
              onBlur={(content) =>
                setRowData((prev) => ({ ...prev, description: content }))
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
            {rowData.features.map((feature, index) => (
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
      return <TransferImages rowData={rowData} setRowData={setRowData} />;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!rowData) {
    return <div className="container mx-auto p-4">Car not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Car Rental</h1>
      <div className="mb-4">
        <nav className="flex space-x-4 border-b">
          <Tabs
            tabs={["General", "Features", "Images"]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            classNameDecoration=""
            className=""
          />
        </nav>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-5 rounded-[10px]"
      >
        {renderTabContent()}
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default UpdateCarLayout;
