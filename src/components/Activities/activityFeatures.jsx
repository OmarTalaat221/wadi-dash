// src/components/Activities/ActivityFeatures.jsx
import React, { useEffect } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import IconSelector from "../IconFeatures/IconSelector";

const ActivityFeatures = ({ rowData, setRowData }) => {
  const featuresArray = rowData.featuresArray || [];

  const cleanIcon = (icon) => {
    if (!icon || typeof icon !== "string") return "";

    let result = icon.trim();
    let prevResult = "";
    let iterations = 0;

    while (prevResult !== result && iterations < 10) {
      prevResult = result;
      result = result
        .replace(/\\\\/g, "")
        .replace(/\\"/g, '"')
        .replace(/\\n/g, "")
        .replace(/\\r/g, "")
        .replace(/\\t/g, "")
        .replace(/\\/g, "");
      iterations++;
    }

    return result.trim();
  };

  // ✅ Helper function to convert features array to string format
  // Format: label**value**icon//CAMP//label**value**icon
  const convertFeaturesToString = (features) => {
    if (!features || features.length === 0) return "";

    return features
      .filter((f) => f.name || f.label)
      .map((f) => {
        const label = (f.label || f.name || "").trim();
        const value = (f.name || f.label || "").trim();
        const icon = cleanIcon(f.icon);
        return `${label}**${value}**${icon}`;
      })
      .join("//CAMP//");
  };

  // ✅ Helper function to parse string format back to array
  // Format: label**value**icon//CAMP//label**value**icon
  const parseStringToFeatures = (str) => {
    if (!str || typeof str !== "string" || str.trim() === "") return [];

    return str.split("//CAMP//").map((item, index) => {
      const parts = item.split("**");
      return {
        id: index + 1,
        label: parts[0] || "",
        name: parts[1] || parts[0] || "",
        icon: parts[2] || "",
      };
    });
  };

  // ✅ Helper function to convert API array format to our format
  const parseArrayToFeatures = (arr) => {
    if (!arr || !Array.isArray(arr)) return [];

    return arr.map((f, index) => ({
      id: f.feature_id || f.id || index + 1,
      label: f.label || f.name || f.value || "",
      name: f.name || f.value || f.label || "",
      icon: f.icon || "",
    }));
  };

  // ✅ Initialize featuresArray on mount
  useEffect(() => {
    // Skip if featuresArray already exists
    if (rowData.featuresArray && rowData.featuresArray.length > 0) {
      return;
    }

    let parsed = [];

    // Case 1: features is a string - parse it
    if (rowData.features && typeof rowData.features === "string") {
      parsed = parseStringToFeatures(rowData.features);
    }
    // Case 2: features is an array - convert it
    else if (rowData.features && Array.isArray(rowData.features)) {
      parsed = parseArrayToFeatures(rowData.features);
    }

    if (parsed.length > 0) {
      setRowData((prev) => ({
        ...prev,
        featuresArray: parsed,
      }));
    }
  }, []); // Only run on mount

  // ✅ Debug log
  useEffect(() => {
    console.log("Activity featuresArray:", featuresArray);
    console.log(
      "Activity features string:",
      convertFeaturesToString(featuresArray)
    );
  }, [featuresArray]);

  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...featuresArray];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [field]: value,
    };

    // ✅ Auto-update features string
    const featuresString = convertFeaturesToString(updatedFeatures);

    setRowData((prev) => ({
      ...prev,
      featuresArray: updatedFeatures,
      featuresString: featuresString,
    }));
  };

  const removeFeature = (index) => {
    const updatedFeatures = featuresArray.filter((_, i) => i !== index);

    // ✅ Update features string
    const featuresString = convertFeaturesToString(updatedFeatures);

    setRowData((prev) => ({
      ...prev,
      featuresArray: updatedFeatures,
      featuresString: featuresString,
    }));
  };

  const addFeature = () => {
    const updatedFeatures = [
      ...featuresArray,
      {
        id: featuresArray.length + 1,
        label: "",
        name: "",
        icon: "",
      },
    ];

    setRowData((prev) => ({
      ...prev,
      featuresArray: updatedFeatures,
    }));
  };

  return (
    <fieldset className="border border-gray-200 p-4 rounded-xl bg-gray-50/50">
      <legend className="font-semibold text-lg mb-2 px-2 text-[#295557]">
        Activity Features
      </legend>

      {/* Add Button */}
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
          className="fill-none group-hover:stroke-[#295557] stroke-slate-400 group-active:stroke-[#295557] group-active:fill-[#295557]/20 group-active:duration-0 duration-300"
        >
          <path
            d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
            strokeWidth="1.5"
          ></path>
          <path d="M8 12H16" strokeWidth="1.5"></path>
          <path d="M12 16V8" strokeWidth="1.5"></path>
        </svg>
      </button>

      {/* Empty State */}
      {featuresArray.length === 0 && (
        <div className="text-center text-gray-500 py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-lg font-medium text-gray-400">
            No features added yet
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Click the + button above to add features
          </p>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {featuresArray.map((feature, index) => {
          const cleanedIcon = cleanIcon(feature.icon);

          return (
            <div
              key={feature.id || index}
              className="space-y-4 border border-gray-200 p-4 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: "#295557" }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    Feature
                  </span>
                </div>
              </div>

              {/* ✅ Label Input (Display Name) */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Label (Display Name)
                </label>
                <input
                  type="text"
                  value={feature.label || ""}
                  onChange={(e) =>
                    handleFeatureChange(index, "label", e.target.value)
                  }
                  className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-[#295557]/20 focus:border-[#295557] outline-none transition-all"
                  placeholder="e.g., Free Equipment, Guide Included..."
                />
              </div>

              {/* ✅ Value/Name Input (Internal Name) */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Value (Internal Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={feature.name || ""}
                  onChange={(e) =>
                    handleFeatureChange(index, "name", e.target.value)
                  }
                  className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-[#295557]/20 focus:border-[#295557] outline-none transition-all"
                  placeholder="e.g., equipment, guide, transport..."
                />
              </div>

              {/* Icon Selector */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Feature Icon
                </label>
                <IconSelector
                  value={cleanedIcon}
                  onChange={(value) =>
                    handleFeatureChange(index, "icon", value)
                  }
                  placeholder="Select an icon for this feature"
                />
              </div>

              {/* Icon Preview (if selected) */}
              {cleanedIcon && (
                <div
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: "#295557" + "10" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm"
                    dangerouslySetInnerHTML={{ __html: cleanedIcon }}
                  />
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#295557" }}
                    >
                      {feature.label || feature.name || "Unnamed Feature"}
                    </p>
                    <p className="text-xs text-gray-500">Preview</p>
                  </div>
                </div>
              )}

              {/* Delete Button */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 py-2.5 px-4 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium"
                  title="Delete Feature"
                >
                  <RiDeleteBin6Line size={18} />
                  <span>Remove Feature</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {featuresArray.length > 0 && (
        <div
          className="mt-6 p-4 rounded-xl"
          style={{ backgroundColor: "#295557" + "10" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: "#295557" }}
              >
                {featuresArray.length}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  Total Features Added
                </p>
                <p className="text-sm text-gray-500">
                  {featuresArray.filter((f) => f.name || f.label).length} with
                  values, {featuresArray.filter((f) => f.icon).length} with
                  icons
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: "#295557" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add More
            </button>
          </div>
        </div>
      )}
    </fieldset>
  );
};

export default ActivityFeatures;
