// src/pages/Accommodation/UpdateAccomLayout.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tabs from "../../../components/Tabs";
import AccommodationFeatures from "../../../components/Accommodation/accomFeatures";
import AccomImages from "../../../components/Accommodation/accomImages";
import JoditEditor from "jodit-react";
import axios from "axios";
import { message, Select } from "antd";
import { base_url } from "../../../utils/base_url";

const { Option } = Select;

function UpdateAccomLayout() {
  const { product_id } = useParams();
  const navigate = useNavigate();

  const [rowData, setRowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("General");

  const editorConfig = {
    readonly: false,
    height: 300,
    toolbar: true,
    spellcheck: true,
    language: "en",
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "|",
      "link",
      "table",
      "|",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "copyformat",
      "|",
      "source",
    ],
  };

  useEffect(() => {
    fetchAccommodation();
  }, [product_id]);

  const fetchAccommodation = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${base_url}/admin/hotels/select_hotels.php`
      );

      if (response.data.status === "success") {
        const hotel = response.data.message.find(
          (h) => h.id === product_id.toString()
        );

        if (hotel) {
          setRowData(hotel);
        } else {
          throw new Error("Accommodation not found");
        }
      } else {
        throw new Error(
          response.data.message || "Failed to fetch accommodation"
        );
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || error.message || "Network error"
      );
      setTimeout(() => {
        navigate("/accommodation");
      }, 2000);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setRowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rowData.title.trim()) {
      message.error("Title is required!");
      return;
    }

    if (!rowData.price_current || parseFloat(rowData.price_current) <= 0) {
      message.error("Valid price is required!");
      return;
    }

    if (!rowData.image || rowData.image.trim() === "") {
      message.error("At least one image is required!");
      return;
    }

    setSubmitting(true);

    try {
      // Get background image from first uploaded image
      const backgroundImage = rowData.image.split("//CAMP//")[0] || "";

      const payload = {
        id: product_id.toString(),
        ...rowData,
        adult_price: rowData.price_current,
        background_image: backgroundImage,
        features: rowData.amenities
          ? rowData.amenities
              .map((a) => a.name)
              .filter((n) => n)
              .join("**")
          : "",
      };

      // Remove amenities from payload as API expects 'features' field
      delete payload.amenities;

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        `${base_url}/admin/hotels/edit_hotel.php`,
        payload
      );

      if (response.data.status === "success") {
        message.success("Accommodation updated successfully!");
        setTimeout(() => {
          navigate("/accommodation");
        }, 1500);
      } else {
        throw new Error(
          response.data.message || "Failed to update accommodation"
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Title *</label>
              <input
                type="text"
                name="title"
                value={rowData.title || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
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

            <div>
              <label className="block mb-1 font-medium">Current Price *</label>
              <input
                type="number"
                name="price_current"
                value={rowData.price_current || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
                onWheel={(e) => e.target.blur()}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Original Price</label>
              <input
                type="number"
                name="price_original"
                value={rowData.price_original || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                onWheel={(e) => e.target.blur()}
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

            <div>
              <label className="block mb-1 font-medium">Category</label>
              <Select
                value={rowData.category || "hotel"}
                onChange={(value) => handleSelectChange("category", value)}
                className="w-full"
                size="large"
              >
                <Option value="hotel">Hotel</Option>
                <Option value="Luxury Resort">Luxury Resort</Option>
                <Option value="trip_package">Trip Package</Option>
                <Option value="activity">Activity</Option>
                <Option value="car">Car Rental</Option>
              </Select>
            </div>

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
              <label className="block mb-1 font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={rowData.location || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Route</label>
              <input
                type="text"
                name="route"
                value={rowData.route || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Max People</label>
              <input
                type="number"
                name="adults_num"
                value={rowData.adults_num || ""}
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
                value={rowData.child_price || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                onWheel={(e) => e.target.blur()}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Country ID</label>
              <Select
                value={rowData.country_id || "1"}
                onChange={(value) => handleSelectChange("country_id", value)}
                className="w-full"
                size="large"
                showSearch
                placeholder="Select Country"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                <Option value="1">Country 1</Option>
                <Option value="2">Country 2</Option>
                <Option value="3">Country 3</Option>
              </Select>
            </div>
          </div>

          <div className="col-span-2 mt-4">
            <label className="block mb-1 font-medium">video_link</label>
            <input
              name="video_link"
              value={rowData.video_link || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="col-span-2 mt-4">
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
        <AccommodationFeatures rowData={rowData} setRowData={setRowData} />
      );
    }
    if (activeTab === "Images") {
      return <AccomImages rowData={rowData} setRowData={setRowData} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!rowData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">Accommodation not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Accommodation</h1>

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
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateAccomLayout;
