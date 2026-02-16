import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tabs from "../../../components/Tabs";
import AccommodationFeatures from "../../../components/Accommodation/accomFeatures";
import AccomImages from "../../../components/Accommodation/accomImages";
import JoditEditor from "jodit-react";
import axios from "axios";
import { message, Select, Spin } from "antd";
import { base_url } from "../../../utils/base_url";
import editorConfig from "../../../data/joditConfig";
import useCountries from "../../../hooks/useCountries"; // 👈 Import hook

const { Option } = Select;

function CreateAccomLayout() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // 👇 استخدام الـ hook
  const { countries, loading: countriesLoading } = useCountries();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    price_current: "",
    price_original: "",
    price_currency: "USD",
    price_note: "",
    country_id: "", // 👈 خليها فاضية
    category: "hotel",
    duration: "",
    route: "",
    location: "",
    adults_num: "1",
    adult_price: "0",
    child_price: "0",
    background_image: "",
    cta_button_text: "Book Now",
    cta_button_url: "",
    image: "",
    video_link: "",
    features: "",
    amenities: [],
  });

  const [activeTab, setActiveTab] = useState("General");

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 👇 Validation
    if (!formData.country_id) {
      message.error("Please select a country");
      return;
    }

    if (!formData.title.trim()) {
      message.error("Title is required!");
      return;
    }

    if (!formData.price_current || parseFloat(formData.price_current) <= 0) {
      message.error("Valid price is required!");
      return;
    }

    if (!formData.image || formData.image.trim() === "") {
      message.error("At least one image is required!");
      return;
    }

    setSubmitting(true);

    try {
      const backgroundImage = formData.image.split("//CAMP//")[0] || "";

      const payload = {
        ...formData,
        background_image: backgroundImage,
        adult_price: formData.price_current,
        features: formData.amenities
          ? formData.amenities
              .map((a) => a.name)
              .filter((n) => n)
              .join("**")
          : "",
      };

      delete payload.amenities;

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        `${base_url}/admin/hotels/add_hotel.php`,
        payload
      );

      if (response.data.status === "success") {
        message.success("Accommodation created successfully!");
        setTimeout(() => {
          navigate("/accommodation");
        }, 1500);
      } else {
        throw new Error(
          response.data.message || "Failed to create accommodation"
        );
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || error.message || "Network error"
      );
    }

    setSubmitting(false);
  };

  const renderTabContent = () => {
    if (activeTab === "General") {
      return (
        <>
          {/* 👇 First Row - Country & Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Country *</label>
              <Select
                value={formData.country_id || undefined}
                onChange={(value) => handleSelectChange("country_id", value)}
                className="w-full"
                size="large"
                placeholder="Select Country"
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
              <label className="block mb-1 font-medium">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Category</label>
              <Select
                value={formData.category || "hotel"}
                onChange={(value) => handleSelectChange("category", value)}
                className="w-full"
                size="large"
              >
                <Option value="hotel">Hotel</Option>
                <Option value="Luxury Resort">Luxury Resort</Option>
                <Option value="trip_package">Trip Package</Option>
                {/* <Option value="activity">Activity</Option> */}
                {/* <Option value="car">Car Rental</Option> */}
              </Select>
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
                className="w-full border border-gray-300 p-2 rounded"
                required
                min="0"
                step="0.01"
                onWheel={(e) => e.target.blur()}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Original Price</label>
              <input
                type="number"
                name="price_original"
                value={formData.price_original || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                min="0"
                step="0.01"
                onWheel={(e) => e.target.blur()}
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
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="e.g., Per Night, Taxes Included"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="e.g., 3 Nights, 5 Days"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Route</label>
              <input
                type="text"
                name="route"
                value={formData.route || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="e.g., Cairo - Hurghada - Cairo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Max People</label>
              <input
                type="number"
                name="adults_num"
                value={formData.adults_num || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                min="1"
                onWheel={(e) => e.target.blur()}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Child Price</label>
              <input
                type="number"
                name="child_price"
                value={formData.child_price || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                min="0"
                step="0.01"
                onWheel={(e) => e.target.blur()}
              />
            </div>
          </div>

          <div className="col-span-2 mt-4">
            <label className="block mb-1 font-medium">Video Link</label>
            <input
              name="video_link"
              value={formData.video_link || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="col-span-2 mt-4">
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
        <AccommodationFeatures rowData={formData} setRowData={setFormData} />
      );
    }

    if (activeTab === "Images") {
      return <AccomImages rowData={formData} setRowData={setFormData} />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Accommodation</h1>

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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/accommodation")}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Accommodation"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAccomLayout;
