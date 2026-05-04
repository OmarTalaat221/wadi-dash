import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tabs from "../../../components/Tabs";
import { RiDeleteBin6Line } from "react-icons/ri";
import JoditEditor from "jodit-react";
import editorConfig from "../../../data/joditConfig";
import { message, Select } from "antd";
import axios from "axios";
import { base_url } from "../../../utils/base_url";
import { uploadImageToServer } from "./../../../hooks/uploadImage";
import TransferImages from "../../../components/Transfer/transferImages";
import TransferFeatures from "../../../components/Transfer/transferFeatures";

const { Option } = Select;

function UpdateCarLayout() {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const imageRefs = useRef([]);

  const [rowData, setRowData] = useState(null);
  const [activeTab, setActiveTab] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  useEffect(() => {
    fetchCarData();
    fetchCountries();
  }, [product_id]);

  const fetchCountries = async () => {
    setCountriesLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/user/countries/select_countries.php`
      );

      if (response.data.status === "success") {
        setCountries(response.data.message || []);
      } else {
        console.error("Failed to fetch countries");
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setCountriesLoading(false);
    }
  };

  const fetchCarData = async () => {
    try {
      const response = await axios.post(
        `${base_url}/admin/cars/select_car_by_id.php`,
        {
          car_id: product_id,
        }
      );

      if (response.data.status === "success") {
        const car = response.data.message[0];

        if (car) {
          const imagesArray = car.image
            ? car.image.split("//CAMP//").map((url, index) => ({
                type: "url",
                value: url.trim(),
                preview: url.trim(),
              }))
            : [];

          // ✅ FIXED: Parse features to featuresArray format
          let featuresArray = [];

          if (car.features) {
            // If features is an array from API
            if (Array.isArray(car.features)) {
              featuresArray = car.features.map((f, index) => ({
                id: f.feature_id || index + 1,
                label: f.label || f.name || f.feature || "",
                name: f.name || f.feature || "",
                icon: f.icon || "",
              }));
            }
            // If features is a string
            else if (typeof car.features === "string") {
              featuresArray = car.features
                .split("**CAMP**")
                .map((item, index) => {
                  const parts = item.split("**");
                  return {
                    id: index + 1,
                    label: parts[0] || "",
                    name: parts[1] || parts[0] || "",
                    icon: parts[2] || "",
                  };
                });
            }
          }

          setRowData({
            ...car,
            images: imagesArray,
            featuresArray: featuresArray, // ✅ Use featuresArray
            featuresString: convertFeaturesToString(featuresArray), // ✅ Pre-compute string
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

  const cleanIcon = (icon) => {
    if (!icon) return "";

    let result = icon;
    let prevResult = "";
    while (prevResult !== result) {
      prevResult = result;
      result = result
        .replace(/\\\\/g, "TEMP_BACKSLASH")
        .replace(/\\"/g, '"')
        .replace(/TEMP_BACKSLASH/g, "")
        .replace(/\\n/g, "")
        .replace(/\\r/g, "")
        .replace(/\\t/g, "");
    }
    result = result.replace(/\\/g, "");
    return result.trim();
  };

  // ✅ Add this helper function
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
      .join("**CAMP**");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ✅ Use featuresArray for formatting
      let featuresFormatted = "";

      if (rowData.featuresArray && rowData.featuresArray.length > 0) {
        featuresFormatted = rowData.featuresArray
          .filter((f) => f.name || f.label)
          .map((f) => {
            const label = (f.label || f.name || "").trim();
            const value = (f.name || f.label || "").trim();
            const icon = cleanIcon(f.icon);
            return `${label}**${value}**${icon}`;
          })
          .join("**CAMP**");
      }
      // Fallback to featuresString if available
      else if (rowData.featuresString) {
        featuresFormatted = rowData.featuresString;
      }

      console.log("Features formatted:", featuresFormatted);

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
        price_currency: rowData.price_currency || "$",
        price_note: rowData.price_note,
        car_type: rowData.car_type,
        max_people: rowData.max_people,
        driver_price: rowData.driver_price,
        features: featuresFormatted, // ✅ Use formatted string
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        `${base_url}/admin/cars/edit_car.php`,
        payload
      );

      if (response.data.status == "success") {
        message.success("Car updated successfully!");
        navigate("/transfer");
      } else {
        message.error("Failed to update car");
      }
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Max People *</label>
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
              <label className="block mb-1 font-medium">Country *</label>
              <Select
                value={rowData.country_id || undefined}
                onChange={(value) => handleSelectChange("country_id", value)}
                className="w-full"
                size="large"
                showSearch
                placeholder="Select Country"
                optionFilterProp="children"
                loading={countriesLoading}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {countries.map((country) => (
                  <Option key={country.country_id} value={country.country_id}>
                    {country.country_name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block mb-1 font-medium">Driver Price *</label>
              <input
                type="number"
                name="driver_price"
                value={rowData.driver_price || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                onWheel={(e) => e.target.blur()}
              />
            </div>
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
      return <TransferFeatures rowData={rowData} setRowData={setRowData} />;
    }

    if (activeTab === "Images") {
      return <TransferImages rowData={rowData} setRowData={setRowData} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
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
