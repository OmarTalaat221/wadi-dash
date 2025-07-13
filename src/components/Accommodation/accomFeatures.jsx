import React from "react";
import { RiDeleteBin6Line } from "react-icons/ri";

const AccommodationFeatures = ({ rowData, setRowData }) => {
  const handleFeatureFieldChange = (index, field, value) => {
    const updatedFeatures = [...rowData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setRowData((prev) => ({ ...prev, features: updatedFeatures }));
  };
  const handleFeatureIconChange = (index, file) => {
    const updatedFeatures = [...rowData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], icon: file };
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
      features: [...prev.features, { icon: null, label: "", value: "" }],
    }));
  };
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
            stroke-width="1.5"
          ></path>
          <path d="M8 12H16" stroke-width="1.5"></path>
          <path d="M12 16V8" stroke-width="1.5"></path>
        </svg>
      </button>
      <div className="grid grid-cols-3 gap-[20px]">
        {rowData.features.map((feature, index) => (
          <div key={index} className="mb-3 space-y-2 border p-2 rounded">
            <div className="flex items-center space-x-2">
              <span className="w-16">Icon:</span>
              <input
                type="file"
                onChange={(e) =>
                  handleFeatureIconChange(
                    index,
                    e.target.files ? e.target.files[0] : null
                  )
                }
                className="w-full"
              />
              {feature.icon && (
                <span className="text-sm text-gray-600">
                  {feature.icon.name || "File selected"}
                </span>
              )}
            </div>
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

            <div className="flex items-center justify-start">
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="bg-red-500 text-white py-[10px] px-3 rounded hover:bg-red-600 transition-colors duration-200"
              >
                <RiDeleteBin6Line />
              </button>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export default AccommodationFeatures;
