import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tabs from "../../../components/Tabs";
import ActivityFeatures from "../../../components/Activities/ActivityFeatures";
import ActivityImages from "../../../components/Activities/activityImages";
import JoditEditor from "jodit-react";
import axios from "axios";
import { message, Select } from "antd";
import { base_url } from "../../../utils/base_url";

const { Option } = Select;

function UpdateActivityLayout() {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

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

  const [rowData, setRowData] = useState({
    id: "",
    country_id: "",
    title: "",
    subtitle: "",
    description: "",
    background_image: "",
    cta_button_text: "",
    cta_button_url: "",
    category: "",
    duration: "",
    route: "",
    price_current: "",
    price_original: "",
    price_currency: "$",
    per_adult: "",
    per_child: "",
    price_note: "",
    activity_type: "",
    features: [],
    images: [],
  });

  const [activeTab, setActiveTab] = useState("General");

  // Fetch activity data
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get(
          `${base_url}/admin/activities/select_activities.php`
        );

        if (response.data.status === "success") {
          const activity = response.data.message?.find(
            (item) => item.id === product_id
          );

          if (activity) {
            // Parse features
            const featuresArray = activity?.features;

            // Parse images
            const imagesArray = activity.image
              ? activity.image.split("//CAMP//").map((img) => ({
                  type: "url",
                  value: img,
                }))
              : [];

            setRowData({
              ...activity,
              features: featuresArray,
              images: imagesArray,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
        message.error("Error loading activity");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchActivity();
  }, [product_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rowData.title || !rowData.country_id) {
      message.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Prepare features string
      const featuresString = rowData.features
        .map((f) => f.value || f.label)
        .filter(Boolean)
        .join("**");

      // Prepare images string
      const imagesString = rowData.images
        .map((img) => img.value || img.preview)
        .join("//CAMP//");

      const payload = {
        id: rowData.id,
        country_id: rowData.country_id,
        title: rowData.title,
        subtitle: rowData.subtitle,
        description: rowData.description,
        background_image: rowData.images[0]?.value,
        cta_button_text: rowData.cta_button_text,
        cta_button_url: rowData.cta_button_url,
        duration: rowData.duration,
        category: rowData.category,
        image: imagesString,
        route: rowData.route,
        price_current: rowData.price_current,
        price_original: rowData.price_original,
        price_currency: rowData.price_currency,
        per_adult: rowData.price_current,
        per_child: rowData.per_child,
        price_note: rowData.price_note,
        activity_type: rowData.activity_type,
      };

      const response = await axios.post(
        `${base_url}/admin/activities/edit_activity.php`,
        payload
      );

      if (response.data.status === "success") {
        message.success("Activity updated successfully!");
        navigate("/activities");
      } else {
        message.error(response.data.message || "Failed to update activity");
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      message.error("Error updating activity");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (activeTab === "General") {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Country*</label>
              <Select
                name="country_id"
                value={rowData.country_id}
                onChange={(value) =>
                  setRowData((prev) => ({ ...prev, country_id: value }))
                }
                className="w-full"
                placeholder="Select Country"
              >
                <Option value="1">Country 1</Option>
                <Option value="2">Country 2</Option>
              </Select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Category</label>
              <Select
                name="category"
                value={rowData.category}
                onChange={(value) =>
                  setRowData((prev) => ({ ...prev, category: value }))
                }
                className="w-full"
              >
                <Option value="activity">Activity</Option>
                <Option value="adventure">Adventure</Option>
                <Option value="outdoor">Outdoor</Option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Title*</label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Current Price*</label>
              <input
                type="number"
                step="0.01"
                name="price_current"
                value={rowData.price_current || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Original Price</label>
              <input
                type="number"
                step="0.01"
                name="price_original"
                value={rowData.price_original || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            {/* <div>
              <label className="block mb-1 font-medium">Currency</label>
              <select
                name="price_currency"
                value={rowData.price_currency || "$"}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="OMR">OMR</option>
              </select>
            </div> */}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* <div>
              <label className="block mb-1 font-medium">Price per Adult</label>
              <input
                type="number"
                name="per_adult"
                value={rowData.per_adult || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div> */}

            <div>
              <label className="block mb-1 font-medium">Price per Child</label>
              <input
                type="number"
                name="per_child"
                value={rowData.per_child || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Duration*</label>
              <input
                type="text"
                name="duration"
                value={rowData.duration || ""}
                onChange={handleChange}
                placeholder="e.g., 3 HOURS"
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Activity Type*</label>
              <input
                type="text"
                name="activity_type"
                value={rowData.activity_type || ""}
                onChange={handleChange}
                placeholder="e.g., Scuba Diving, Hiking"
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Route</label>
            <input
              type="text"
              name="route"
              value={rowData.route || ""}
              onChange={handleChange}
              placeholder="e.g., GREAT BARRIER REEF → CAIRNS"
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          {/* <div>
            <label className="block mb-1 font-medium">
              Background Image URL
            </label>
            <input
              type="text"
              name="background_image"
              value={rowData.background_image || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div> */}

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
      return <ActivityFeatures rowData={rowData} setRowData={setRowData} />;
    }
    if (activeTab === "Images") {
      return <ActivityImages rowData={rowData} setRowData={setRowData} />;
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Activity</h1>
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
          disabled={loading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default UpdateActivityLayout;
