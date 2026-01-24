import React, { useState, useRef, useEffect } from "react";
import Tabs from "../../../components/Tabs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import JoditEditor from "jodit-react";
import editorConfig from "../../../data/joditConfig";
import axios from "axios";
import { message, Select, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { base_url } from "../../../utils/base_url";
import { uploadImageToServer } from "../../../hooks/uploadImage";
import ActivityImages from "../../../components/Activities/activityImages";

const { Option } = Select;

function CreateActivityLayout() {
  const navigate = useNavigate();
  const imageRefs = useRef([]);
  const [countries, setCountries] = useState([]);
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
    features: [],
    images: [],
  });

  const [activeTab, setActiveTab] = useState("General");
  const imageInputRef = useRef(null);

  useEffect(() => {
    // fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
          // Upload image to server
          const response = await uploadImageToServer(file);

          // Assuming response contains the image URL
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

  const handleImageUrlAdd = (url) => {
    if (!url.trim()) return;

    const imageData = {
      type: "url",
      value: url,
      preview: url,
    };

    setFormData((prev) => {
      const updated = [...prev.images, imageData];

      setTimeout(() => {
        const refIndex = prev.images.length;
        const imgRef = imageRefs.current[refIndex];
        if (imgRef) {
          imgRef.classList.add("zoomIn");
          setTimeout(() => imgRef.classList.remove("zoomIn"), 300);
        }
      }, 10);

      return { ...prev, images: updated };
    });

    message.success("Image URL added");
  };

  const removeImage = (index) => {
    const imgRef = imageRefs.current[index];

    if (imgRef) {
      imgRef.classList.remove("zoomIn");
      imgRef.classList.add("zoomOut");

      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
        }));
        imgRef.classList.remove("zoomOut");
      }, 300);
    }
  };

  const handleFeatureFieldChange = (index, field, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setFormData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { label: "", value: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.country_id) {
      message.error("Please fill in all required fields");
      return;
    }

    if (uploadingImages) {
      message.warning("Please wait for images to finish uploading");
      return;
    }

    setLoading(true);

    try {
      const featuresString = formData.features
        .map((f) => f.value || f.label)
        .filter(Boolean)
        .join("**");

      const imagesString = formData.images
        .map((img) => img.value)
        .join("//CAMP//");

      const payload = {
        country_id: formData.country_id,
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        background_image: formData.images[0].value,
        cta_button_text: formData.cta_button_text,
        cta_button_url: formData.cta_button_url,
        duration: formData.duration,
        category: formData.category,
        image: imagesString,
        route: formData.route,
        price_current: formData.price_current,
        price_original: formData.price_original,
        price_currency: formData.price_currency,
        per_adult: formData.price_current,
        per_child: formData.per_child,
        price_note: formData.price_note,
        max_people: formData.max_people,
        video_link: formData.video_link,
        activity_type: formData.activity_type,
        features: featuresString,
      };

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
              <label className="block !mb-1 font-medium">Country*</label>
              <Select
                value={formData.country_id}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, country_id: value }))
                }
                className="w-full"
                placeholder="Select Country"
              >
                <Option value="1">Country 1</Option>
                <Option value="2">Country 2</Option>
              </Select>
            </div>

            <div>
              <label className="block !mb-1 font-medium">Category</label>
              <Select
                value={formData.category}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
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
              <label className="block !mb-1 font-medium">Title*</label>
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
              <label className="block mb-1 font-medium">Current Price*</label>
              <input
                type="number"
                step="0.01"
                name="price_current"
                value={formData.price_current || ""}
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
                value={formData.price_original || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* <div>
              <label className="block mb-1 font-medium">Price per Adult</label>
              <input
                type="number"
                name="per_adult"
                value={formData.per_adult || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div> */}

            <div>
              <label className="block mb-1 font-medium">Price per Child</label>
              <input
                type="number"
                name="per_child"
                value={formData.per_child || ""}
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
                value={formData.duration || ""}
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

          <div className="grid grid-cols-2  gap-4">
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
              <label className="block mb-1 font-medium">Max People*</label>
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
      return (
        <fieldset className="border p-4 rounded">
          <legend className="font-medium mb-2">Activity Features</legend>

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
          <div className="grid grid-cols-3 gap-[10px]">
            {formData.features.map((feature, index) => (
              <div key={index} className="mb-3 space-y-2 border p-2 rounded">
                <div className="flex items-center space-x-2">
                  <label className="w-16">Feature:</label>
                  <input
                    type="text"
                    value={feature.label || feature.value}
                    onChange={(e) =>
                      handleFeatureFieldChange(index, "value", e.target.value)
                    }
                    className="w-full border border-gray-300 p-2 rounded"
                    placeholder="e.g., Free Equipment"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="bg-red-500 text-white py-[10px] px-3 rounded hover:bg-red-600 transition-colors duration-200"
                >
                  <RiDeleteBin6Line />
                </button>
              </div>
            ))}
          </div>
        </fieldset>
      );
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
            tabs={["General", "Features", "Images"]}
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
