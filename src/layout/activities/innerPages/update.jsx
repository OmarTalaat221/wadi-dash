import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tabs from "../../../components/Tabs";
import ActivityImages from "../../../components/Activities/activityImages";
import JoditEditor from "jodit-react";
import axios from "axios";
import { message, Select } from "antd";
import { base_url } from "../../../utils/base_url";
import ActivityFeatures from "../../../components/Activities/activityFeatures";
import ActivityFAQs from "../../../components/Activities/ActivityFAQs";
import editorConfig from "../../../data/joditConfig";
import MapPicker from "../../../components/MapPicker/MapPicker";

const { Option } = Select;

function UpdateActivityLayout() {
  const { product_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

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
    max_people: "",
    video_link: "",
    activity_type: "",
    for_children: "1",
    lat: "",
    long: "",
    featuresArray: [],
    featuresString: "",
    faqsArray: [],
    faqsString: "",
    images: [],
  });

  const [activeTab, setActiveTab] = useState("General");

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

  useEffect(() => {
    fetchActivity();
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
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setCountriesLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await axios.post(
        `${base_url}/admin/activities/select_activity_by_id.php`,
        { activity_id: product_id }
      );

      if (response.data.status === "success") {
        const activity = response.data.message[0];

        if (activity) {
          const featuresArray = parseFeaturesToArray(activity.features);
          const faqsArray = parseFAQsToArray(activity.faqs);

          const imagesArray = activity.image
            ? activity.image.split("//CAMP//").map((img) => ({
                type: "url",
                value: img,
              }))
            : [];

          setRowData({
            ...activity,
            for_children: activity.for_children ?? "1",
            lat: activity.lat || "",
            long: activity.long || "",
            featuresArray,
            featuresString: convertFeaturesToString(featuresArray),
            faqsArray,
            faqsString: convertFAQsToString(faqsArray),
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapChange = (lat, long) => {
    setRowData((prev) => ({ ...prev, lat, long }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rowData.title || !rowData.country_id) {
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

      const payload = {
        id: rowData.id,
        country_id: rowData.country_id,
        title: rowData.title,
        subtitle: rowData.subtitle,
        description: rowData.description,
        background_image: rowData.images[0]?.value || rowData.background_image,
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
        for_children: rowData.for_children,
        max_people: rowData.max_people,
        video_link: rowData.video_link,
        activity_type: rowData.activity_type,
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
              <label className="block mb-1 font-medium">Country *</label>
              <Select
                value={rowData.country_id || undefined}
                onChange={(value) =>
                  setRowData((prev) => ({ ...prev, country_id: value }))
                }
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

            <div>
              <label className="block mb-1 font-medium">Category</label>
              <Select
                value={rowData.category}
                onChange={(value) =>
                  setRowData((prev) => ({ ...prev, category: value }))
                }
                className="w-full"
                size="large"
              >
                <Option value="activity">Activity</Option>
                <Option value="adventure">Adventure</Option>
                <Option value="outdoor">Outdoor</Option>
              </Select>
            </div>
          </div>

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
                onWheel={(e) => e.target.blur()}
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
              <label className="block mb-1 font-medium">Activity Type *</label>
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

          <div>
            <label className="block mb-1 font-medium">Video Link</label>
            <input
              type="text"
              name="video_link"
              value={rowData.video_link || ""}
              onChange={handleChange}
              placeholder="e.g., https://youtube.com/..."
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
        <nav className="flex space-x-4 border-b">
          <Tabs
            tabs={["General", "Features", "FAQs", "Images"]}
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
