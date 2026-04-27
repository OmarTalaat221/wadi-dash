import React, { useState, useRef } from "react";
import Tabs from "../../../components/Tabs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import { FaEye, FaCheck } from "react-icons/fa";
import { MdDelete, MdWallpaper } from "react-icons/md";
import JoditEditor from "jodit-react";
import editorConfig from "../../../data/joditConfig";
import { useNavigate } from "react-router-dom";
import { message, Select, Spin } from "antd";
import axios from "axios";
import { base_url } from "../../../utils/base_url";
import { uploadImageToServer } from "./../../../hooks/uploadImage";
import useCountries from "../../../hooks/useCountries"; // 👈 Import hook
import TransferImages from "../../../components/Transfer/transferImages";
import TransferFeatures from "../../../components/Transfer/transferFeatures";

const { Option } = Select;

function CreateCarLayout() {
  const navigate = useNavigate();
  const imageRefs = useRef([]);

  // 👇 استخدام الـ hook
  const { countries, loading: countriesLoading } = useCountries();

  /*Test Data
    const [formData, setFormData] = useState({
    country_id: "1",
    title: "Mercedes-Benz S-Class 2024",
    subtitle: "Luxury Sedan with Premium Features",
    description:
      "<p>Experience ultimate luxury with the Mercedes-Benz S-Class. This flagship sedan offers exceptional comfort, cutting-edge technology, and powerful performance. Perfect for business trips or special occasions.</p><ul><li>Premium leather interior</li><li>Advanced driver assistance systems</li><li>Panoramic sunroof</li><li>Burmester surround sound system</li></ul>",
    background_image: "",
    cta_button_text: "Rent Now",
    cta_button_url: "",
    category: "car",
    duration: "1 DAY",
    location: "Cairo, Egypt",
    price_current: "250",
    price_original: "300",
    price_currency: "$",
    price_note: "PER DAY",
    max_people: "4",
    car_type: "Luxury",
    featuresArray: [],
    featuresString: "",
    images: [],
  }); */
  const [formData, setFormData] = useState({
    country_id: "",
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
    max_people: "",
    driver_price: "",
    car_type: "",
    featuresArray: [], // ✅ Changed from features: []
    featuresString: "", // ✅ Add this
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.country_id) {
      message.error("Please select a country");
      return;
    }

    if (!formData.title.trim()) {
      message.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Use featuresArray for formatting
      let featuresFormatted = "";

      if (formData.featuresArray && formData.featuresArray.length > 0) {
        featuresFormatted = formData.featuresArray
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
      else if (formData.featuresString) {
        featuresFormatted = formData.featuresString;
      }

      console.log("Features formatted:", featuresFormatted);

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
        max_people: formData.max_people,
        driver_price: formData.driver_price,
        features: featuresFormatted, // ✅ Use formatted string
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        `${base_url}/admin/cars/add_cars.php`,
        payload
      );

      if (response.data.status == "success") {
        message.success("Car created successfully!");
        navigate("/transfer");
      } else {
        message.error("Failed to create car");
      }
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
          {/* 👇 Country Select - First Field */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block !mb-1 font-medium">Country *</label>
              <Select
                value={formData.country_id || undefined}
                onChange={(value) => handleSelectChange("country_id", value)}
                placeholder="Select Country"
                className="w-full"
                size="large"
                loading={countriesLoading}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={
                  countriesLoading ? (
                    <Spin size="small" />
                  ) : (
                    "No countries found"
                  )
                }
              >
                {countries.map((country) => (
                  <Option key={country.country_id} value={country.country_id}>
                    {country.country_name}
                  </Option>
                ))}
              </Select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block mb-1 font-medium">Driver Price *</label>
              <input
                type="number"
                name="driver_price"
                value={formData.driver_price || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                onWheel={(e) => e.target.blur()}
              />
            </div>
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
      return <TransferFeatures rowData={formData} setRowData={setFormData} />;
    }

    if (activeTab === "Images") {
      return <TransferImages rowData={formData} setRowData={setFormData} />;
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
