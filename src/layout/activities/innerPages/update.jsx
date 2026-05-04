// pages/activities/innerPages/update.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tabs from "../../../components/Tabs";
import ActivityImages from "../../../components/Activities/activityImages";
import JoditEditor from "jodit-react";
import axios from "axios";
import { message, Select, Spin } from "antd";
import { base_url } from "../../../utils/base_url";
import ActivityFeatures from "../../../components/Activities/activityFeatures";
import ActivityFAQs from "../../../components/Activities/ActivityFAQs";
import editorConfig from "../../../data/joditConfig";
import MapPicker from "../../../components/MapPicker/MapPicker";
import useCountries from "../../../hooks/useCountries";
import useActivityCategories from "../../../hooks/useActivityCategories";

const { Option } = Select;

function UpdateActivityLayout() {
  const { product_id } = useParams();
  const navigate = useNavigate();

  const { countries, loading: countriesLoading } = useCountries();
  const { visibleCategories, loading: categoriesLoading } =
    useActivityCategories();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("General");

  const [rowData, setRowData] = useState({
    id: "",
    country_id: "",
    title: "",
    subtitle: "",
    description: "",
    background_image: "",
    cta_button_text: "Book Now",
    cta_button_url: "",
    category_id: "",
    duration: "",
    route: "",
    price_current: "",
    price_original: "",
    price_currency: "$",
    per_adult: "",
    per_child: "",
    max_people: "",
    video_link: "",
    price_note: "PER PERSON",
    for_children: "1",
    lat: "",
    long: "",
    featuresArray: [],
    featuresString: "",
    faqsArray: [],
    faqsString: "",
    images: [],
  });

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

  const parseFeaturesToArray = (features) => {
    if (!features) return [];

    if (Array.isArray(features)) {
      return features.map((f, index) => ({
        id: f.feature_id || f.id || index + 1,
        label: f.label || f.name || f.value || "",
        name: f.name || f.value || f.label || "",
        icon: f.icon || "",
      }));
    }

    if (typeof features === "string" && features.trim()) {
      return features.split("**CAMP**").map((item, index) => {
        const parts = item.split("**");

        return {
          id: index + 1,
          label: parts[0] || "",
          name: parts[1] || parts[0] || "",
          icon: parts[2] || "",
        };
      });
    }

    return [];
  };

  const parseFAQsToArray = (faqs) => {
    if (!faqs) return [];

    if (Array.isArray(faqs)) {
      return faqs
        .filter((f) => f.question || f.answer)
        .map((f, index) => ({
          id: f.id || f.faq_id || Date.now() + index,
          question: f.question || "",
          answer: f.answer || "",
        }));
    }

    if (typeof faqs === "string" && faqs.trim()) {
      return faqs.split("**CAMP**").map((item, index) => {
        const parts = item.split("**");

        return {
          id: Date.now() + index,
          question: parts[0] || "",
          answer: parts[1] || "",
        };
      });
    }

    return [];
  };

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

  const convertFAQsToString = (faqsList) => {
    if (!faqsList || faqsList.length === 0) return "";

    return faqsList
      .filter((f) => f.question || f.answer)
      .map((f) => {
        const question = (f.question || "").trim();
        const answer = (f.answer || "").trim();

        return `${question}**${answer}`;
      })
      .join("**CAMP**");
  };

  const fetchActivity = async () => {
    setFetchLoading(true);

    try {
      const response = await axios.post(
        `${base_url}/admin/activities/select_activity_by_id.php`,
        { activity_id: product_id }
      );

      if (response.data.status === "success") {
        const activity = response.data.message?.[0];

        if (!activity) {
          message.error("Activity not found");
          return;
        }

        const featuresArray = parseFeaturesToArray(activity.features);
        const faqsArray = parseFAQsToArray(activity.faqs);

        const imagesArray = activity.image
          ? activity.image
              .split("//CAMP//")
              .filter((img) => img)
              .map((img) => ({
                type: "url",
                value: img,
              }))
          : [];

        setRowData({
          ...activity,

          id: activity.id || activity.activity_id || product_id,

          country_id: activity.country_id || "",

          title: activity.title || "",
          subtitle: activity.subtitle || "",
          description: activity.description || "",

          background_image: activity.background_image || "",

          cta_button_text: activity.cta_button_text || "Book Now",
          cta_button_url: activity.cta_button_url || "",

          category_id: activity.category_id || "",

          duration: activity.duration || "",
          route: activity.route || "",

          price_current: activity.price_current || "",
          price_original: activity.price_original || "",
          price_currency: activity.price_currency || "$",
          per_adult: activity.per_adult || activity.price_current || "",
          per_child: activity.per_child || "",

          price_note: activity.price_note || "PER PERSON",

          max_people: activity.max_people || "",
          video_link: activity.video_link || "",

          for_children:
            activity.for_children !== undefined &&
            activity.for_children !== null
              ? String(activity.for_children)
              : "1",

          lat: activity.lat || activity.latitude || "",
          long: activity.long || activity.longitude || "",

          featuresArray,
          featuresString: convertFeaturesToString(featuresArray),

          faqsArray,
          faqsString: convertFAQsToString(faqsArray),

          images: imagesArray,
        });
      } else {
        message.error(response.data.message || "Failed to load activity");
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
      message.error("Error loading activity");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [product_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setRowData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setRowData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMapChange = (lat, long) => {
    setRowData((prev) => ({
      ...prev,
      lat,
      long,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rowData.country_id) {
      message.error("Please select a country");
      return;
    }

    if (!rowData.category_id) {
      message.error("Please select a category");
      return;
    }

    if (!rowData.title) {
      message.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
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
      } else if (rowData.featuresString) {
        featuresFormatted = rowData.featuresString;
      }

      let faqsFormatted = "";

      if (rowData.faqsArray && rowData.faqsArray.length > 0) {
        faqsFormatted = rowData.faqsArray
          .filter((f) => f.question || f.answer)
          .map((f) => {
            const question = (f.question || "").trim();
            const answer = (f.answer || "").trim();

            return `${question}**${answer}`;
          })
          .join("**CAMP**");
      } else if (rowData.faqsString) {
        faqsFormatted = rowData.faqsString;
      }

      const imagesString = rowData.images
        .map((img) => img.value || img.preview)
        .filter((img) => img)
        .join("//CAMP//");

      const firstImage =
        rowData.images?.[0]?.value ||
        rowData.images?.[0]?.preview ||
        rowData.background_image ||
        "";

      const payload = {
        id: rowData.id || product_id,

        country_id: rowData.country_id,

        title: rowData.title,
        subtitle: rowData.subtitle,
        description: rowData.description,

        background_image: firstImage,

        cta_button_text: rowData.cta_button_text,
        cta_button_url: rowData.cta_button_url,

        duration: rowData.duration,

        category_id: rowData.category_id,

        image: imagesString,

        route: rowData.route,

        for_children: rowData.for_children,

        price_current: rowData.price_current,
        price_original: rowData.price_original,
        price_currency: rowData.price_currency || "$",

        per_adult: rowData.price_current,
        per_child: rowData.per_child,

        price_note: rowData.price_note,

        max_people: rowData.max_people,
        video_link: rowData.video_link,

        features: featuresFormatted,
        faqs: faqsFormatted,

        latitude: rowData.lat || "",
        longitude: rowData.long || "",
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
              <label className="block !mb-1 font-medium">Country *</label>
              <Select
                value={rowData.country_id || undefined}
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
              <label className="block !mb-1 font-medium">Category *</label>
              <Select
                value={rowData.category_id || undefined}
                onChange={(value) => handleSelectChange("category_id", value)}
                className="w-full"
                size="large"
                placeholder="Select Category"
                loading={categoriesLoading}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={
                  categoriesLoading ? (
                    <Spin size="small" />
                  ) : (
                    "No categories found"
                  )
                }
              >
                {visibleCategories.map((cat) => (
                  <Option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block !mb-1 font-medium">Title *</label>
              <input
                type="text"
                name="title"
                value={rowData.title || ""}
                onChange={handleChange}
                className="w-full !border border-gray-300 !p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block !mb-1 font-medium">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={rowData.subtitle || ""}
                onChange={handleChange}
                className="w-full !border border-gray-300 !p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Current Price *</label>
              <input
                type="number"
                step="0.01"
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
                step="0.01"
                name="price_original"
                value={rowData.price_original || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                onWheel={(e) => e.target.blur()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-gray-800">
                  Suitable for Children
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  If disabled, children cannot be booked for this activity
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setRowData((prev) => ({
                    ...prev,
                    for_children: prev.for_children === "1" ? "0" : "1",
                  }))
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rowData.for_children === "1" ? "bg-[#295557]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                    rowData.for_children === "1"
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block mb-1 font-medium">Price per Child</label>
              <input
                type="number"
                name="per_child"
                value={rowData.per_child || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                onWheel={(e) => e.target.blur()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Duration *</label>
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

          <div>
            <label className="block mb-1 font-medium">Video Link</label>
            <input
              type="text"
              name="video_link"
              value={rowData.video_link || ""}
              onChange={handleChange}
              placeholder="Enter Video Link"
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

          <div>
            <label className="block mb-2 font-medium">Location on Map</label>
            <MapPicker
              lat={rowData.lat}
              long={rowData.long}
              onChange={handleMapChange}
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

    if (activeTab === "FAQs") {
      return <ActivityFAQs rowData={rowData} setRowData={setRowData} />;
    }

    if (activeTab === "Images") {
      return <ActivityImages rowData={rowData} setRowData={setRowData} />;
    }

    return null;
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Activity</h1>

      <div className="mb-4">
        <nav className="flex justify-between items-center gap-0.5 w-[100%]">
          <Tabs
            tabs={["General", "Features", "FAQs", "Images"]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            classNameDecoration=""
            className=""
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white !py-2 !px-4 rounded hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Save Changes"}
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

export default UpdateActivityLayout;
