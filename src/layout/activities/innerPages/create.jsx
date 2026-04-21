// src/pages/Activities/Create/CreateActivityLayout.jsx
import React, { useState, useRef } from "react";
import Tabs from "../../../components/Tabs";
import JoditEditor from "jodit-react";
import editorConfig from "../../../data/joditConfig";
import axios from "axios";
import { message, Select, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { base_url } from "../../../utils/base_url";
import { uploadImageToServer } from "../../../hooks/uploadImage";
import ActivityImages from "../../../components/Activities/activityImages";
import useCountries from "../../../hooks/useCountries";
import ActivityFeatures from "../../../components/Activities/activityFeatures";
import ActivityFAQs from "../../../components/Activities/ActivityFAQs";

const { Option } = Select;

function CreateActivityLayout() {
  const navigate = useNavigate();
  const imageRefs = useRef([]);
  const { countries, loading: countriesLoading } = useCountries();

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    country_id: "",
    title: "",
    subtitle: "",
    description: "",
    background_image: "",
    cta_button_text: "Book Now",
    cta_button_url: "",
    category: "activity",
    duration: "",
    route: "",
    price_current: "",
    price_original: "",
    price_currency: "",
    per_adult: "",
    per_child: "",
    max_people: "",
    video_link: "",
    price_note: "PER PERSON",
    activity_type: "",
    for_children: "1",
    featuresArray: [],
    featuresString: "",
    faqsArray: [], // ✅ Added
    faqsString: "", // ✅ Added
    images: [],
  });

  const [activeTab, setActiveTab] = useState("General");
  const imageInputRef = useRef(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFilesChange = async (files) => {
    setUploadingImages(true);
    const fileArray = Array.from(files);
    const uploadedImages = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        try {
          const response = await uploadImageToServer(file);
          const imageUrl =
            response.url ||
            response.image_url ||
            response.data?.url ||
            response;
          uploadedImages.push({
            type: "uploaded",
            value: imageUrl,
            preview: imageUrl,
            file: file,
          });
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          message.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedImages.length > 0) {
        message.success(
          `Successfully uploaded ${uploadedImages.length} image(s)`
        );
        setFormData((prev) => {
          const updated = [...prev.images, ...uploadedImages];
          setTimeout(() => {
            uploadedImages.forEach((_, idx) => {
              const refIndex = prev.images.length + idx;
              const imgRef = imageRefs.current[refIndex];
              if (imgRef) {
                imgRef.classList.add("zoomIn");
                setTimeout(() => imgRef.classList.remove("zoomIn"), 300);
              }
            });
          }, 10);
          return { ...prev, images: updated };
        });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      message.error("Error uploading images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country_id) {
      message.error("Please select a country");
      return;
    }
    if (!formData.title) {
      message.error("Please fill in all required fields");
      return;
    }
    if (uploadingImages) {
      message.warning("Please wait for images to finish uploading");
      return;
    }

    setLoading(true);

    try {
      // Features formatting
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
      } else if (formData.featuresString) {
        featuresFormatted = formData.featuresString;
      }

      // ✅ FAQs formatting: faq1**ans1**CAMP**faq2**ans2
      let faqsFormatted = "";
      if (formData.faqsArray && formData.faqsArray.length > 0) {
        faqsFormatted = formData.faqsArray
          .filter((f) => f.question || f.answer)
          .map((f) => {
            const question = (f.question || "").trim();
            const answer = (f.answer || "").trim();
            return `${question}**${answer}`;
          })
          .join("**CAMP**");
      } else if (formData.faqsString) {
        faqsFormatted = formData.faqsString;
      }

      const imagesString = formData.images
        .map((img) => img.value)
        .filter((img) => img)
        .join("//CAMP//");

      const payload = {
        country_id: formData.country_id,
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        background_image: formData.images[0]?.value || "",
        cta_button_text: formData.cta_button_text,
        cta_button_url: formData.cta_button_url,
        duration: formData.duration,
        category: formData.category,
        image: imagesString,
        route: formData.route,
        for_children: formData.for_children,
        price_current: formData.price_current,
        price_original: formData.price_original,
        price_currency: formData.price_currency,
        per_adult: formData.price_current,
        per_child: formData.per_child,
        price_note: formData.price_note,
        max_people: formData.max_people,
        video_link: formData.video_link,
        activity_type: formData.activity_type,
        features: featuresFormatted,
        faqs: faqsFormatted, // ✅ Added
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        `${base_url}/admin/activities/add_activity.php`,
        payload
      );

      if (response.data.status === "success") {
        message.success("Activity created successfully!");
        navigate("/activities");
      } else {
        message.error(response.data.message || "Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      message.error("Error creating activity");
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
              <label className="block !mb-1 font-medium">Category</label>
              <Select
                value={formData.category}
                onChange={(value) => handleSelectChange("category", value)}
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
              <label className="block !mb-1 font-medium">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
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
                value={formData.subtitle || ""}
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
                value={formData.price_current || ""}
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
                value={formData.price_original || ""}
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
                  setFormData((prev) => ({
                    ...prev,
                    for_children: prev.for_children === "1" ? "0" : "1",
                  }))
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.for_children === "1" ? "bg-[#295557]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                    formData.for_children === "1"
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
                value={formData.per_child || ""}
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
                value={formData.duration || ""}
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
                value={formData.activity_type || ""}
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
              value={formData.route || ""}
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
              value={formData.video_link || ""}
              onChange={handleChange}
              placeholder="Enter Video Link"
              className="w-full border border-gray-300 p-2 rounded"
            />
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
      return <ActivityFeatures rowData={formData} setRowData={setFormData} />;
    }

    if (activeTab === "FAQs") {
      return <ActivityFAQs rowData={formData} setRowData={setFormData} />;
    }

    if (activeTab === "Images") {
      return <ActivityImages rowData={formData} setRowData={setFormData} />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Activity</h1>
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
            disabled={loading || uploadingImages}
            className="bg-blue-500 text-white !py-2 !px-4 rounded hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Activity"}
          </button>
        </nav>
      </div>
      <form className="space-y-6 bg-white !p-5 rounded-[10px]">
        {renderTabContent()}
      </form>
    </div>
  );
}

export default CreateActivityLayout;
