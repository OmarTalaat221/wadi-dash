import React, { useState, useRef } from "react";
import Tabs from "../../../components/Tabs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import JoditEditor from "jodit-react";
import editorConfig from "../../../data/joditConfig";

function CreateTransferLayout() {

  const imageRefs = useRef([]);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    features: [],
    images: [],
    floorPlans: [],
    propertyInfo: {
      Type: "",
      Purpose: "",
      "Reference no.": "",
      Completion: "",
      Furnishing: "",
      "Handover date": "",
    },
  });

  const [activeTab, setActiveTab] = useState("General");
  const imageInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFilesChange = (files) => {
    const fileArray = Array.from(files).map((file) => ({
      type: "file",
      file,
      value: file.name,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prev) => {
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

      // Remove from state *after* animation
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
        }));

        // No need to manually remove class; image is removed from DOM
        // But if you're reusing DOM nodes, do it here instead:
        imgRef.classList.remove("zoomOut");
      }, 300); // Match this with animation duration
    }
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
      features: [...prev.features, { icon: null, label: "", value: "" }],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Created tour:", formData);
  };
  const renderTabContent = () => {
    if (activeTab === "General") {
      return (
        <>
          <div>
            <label className="block !mb-1 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              className="w-full !border border-gray-300 !p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Price</label>
            <input
              type="text"
              name="price"
              value={formData.price || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
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
            title="Add New Feature"
            className="group cursor-pointer outline-none hover:rotate-90 duration-300"
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
              <div key={index} className="mb-3 space-y-2  border p-2 rounded">
                <div className="flex items-center space-x-2">
                  <label className="w-16">Label:</label>
                  <input
                    type="text"
                    value={feature.label}
                    onChange={(e) =>
                      handleFeatureFieldChange(index, "label", e.target.value)
                    }
                    className="w-full border border-gray-300 p-2 rounded"
                    placeholder="Feature Label"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="w-16">Value:</label>
                  <input
                    type="text"
                    value={feature.value}
                    onChange={(e) =>
                      handleFeatureFieldChange(index, "value", e.target.value)
                    }
                    className="w-full border border-gray-300 p-2 rounded"
                    placeholder="Feature Value"
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
              {formData.images.map((img, index) => (
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
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Transfer</h1>
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
            className="bg-blue-500 text-white !py-2 !px-4 rounded hover:bg-blue-600 transition-colors duration-200"
          >
            Create Transfer
          </button>
        </nav>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white !p-5 rounded-[10px]"
      >
        {renderTabContent()}
      </form>
    </div>
  );
}

export default CreateTransferLayout;
