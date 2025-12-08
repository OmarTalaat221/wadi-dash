// src/components/Accommodation/accomFeatures.jsx
import React from "react";
import { RiDeleteBin6Line } from "react-icons/ri";

const AccommodationFeatures = ({ rowData, setRowData }) => {
  // Get amenities array, default to empty array if not exists
  const amenitiesArray = rowData.amenities || [];

  const handleFeatureChange = (index, field, value) => {
    const updatedAmenities = [...amenitiesArray];
    updatedAmenities[index] = {
      ...updatedAmenities[index],
      [field]: value,
    };
    setRowData((prev) => ({
      ...prev,
      amenities: updatedAmenities,
      // Also update features string for API submission
      features: updatedAmenities
        .map((a) => a.name || "")
        .filter((n) => n)
        .join("**"),
    }));
  };

  const removeFeature = (index) => {
    const updatedAmenities = amenitiesArray.filter((_, i) => i !== index);
    setRowData((prev) => ({
      ...prev,
      amenities: updatedAmenities,
      // Also update features string for API submission
      features: updatedAmenities
        .map((a) => a.name || "")
        .filter((n) => n)
        .join("**"),
    }));
  };

  const addFeature = () => {
    const updatedAmenities = [
      ...amenitiesArray,
      {
        amenity_id: "",
        hotel_id: rowData.id || "",
        amenity_id_ref: "",
        name: "",
        icon: "",
      },
    ];
    setRowData((prev) => ({
      ...prev,
      amenities: updatedAmenities,
    }));
  };

  return (
    <fieldset className="border p-4 rounded">
      <legend className="font-medium mb-2">Features / Amenities</legend>

      <button
        type="button"
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

      {amenitiesArray.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No features added yet. Click the + button to add features.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        {amenitiesArray.map((amenity, index) => (
          <div
            key={index}
            className="mb-3 space-y-2 border p-3 rounded shadow-sm bg-white"
          >
            <div className="flex items-center space-x-2">
              <label className="w-20 text-sm font-medium">Name:</label>
              <input
                type="text"
                value={amenity.name || ""}
                onChange={(e) =>
                  handleFeatureChange(index, "name", e.target.value)
                }
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="e.g., Wi-Fi Access"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="w-20 text-sm font-medium">Icon:</label>
              <input
                type="text"
                value={amenity.icon || ""}
                onChange={(e) =>
                  handleFeatureChange(index, "icon", e.target.value)
                }
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="Icon name or URL"
              />
            </div>

            {/* <div className="flex items-center space-x-2">
              <label className="w-20 text-sm font-medium">Reference:</label>
              <input
                type="text"
                value={amenity.amenity_id_ref || ""}
                onChange={(e) =>
                  handleFeatureChange(index, "amenity_id_ref", e.target.value)
                }
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="Amenity reference ID"
              />
            </div> */}

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-500">
                Feature {index + 1}
                {amenity.amenity_id && (
                  <span className="ml-2 text-blue-600">
                    (ID: {amenity.amenity_id})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="bg-red-500 text-white py-[10px] px-3 rounded hover:bg-red-600 transition-colors duration-200"
                title="Delete Feature"
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
