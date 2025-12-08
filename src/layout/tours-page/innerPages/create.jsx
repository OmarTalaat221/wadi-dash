// components/tours/CreateTourLayout.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Tabs from "../../../components/Tabs";
import TourFeatures from "../../../components/tours-page/TourFeatures";
import TourImages from "../../../components/tours-page/tour-images";
import GallerySelector from "../../../components/tours-page/GallerySelector"; // Add this import
import JoditEditor from "jodit-react";
import {
  Box,
  Button,
  IconButton,
  FormControl,
  TextField,
  CircularProgress,
  Select as MuiSelect,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { Select, Space, message } from "antd";
import { MdDelete } from "react-icons/md";
import { FaEye, FaPlus } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { base_url } from "../../../utils/base_url";

function CreateTourLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cars, setCars] = useState([]);
  const [activities, setActivities] = useState([]);

  const [formData, setFormData] = useState({
    country_id: "",
    title: "",
    subtitle: "",
    description: "",
    background_image: "",
    cta_button_text: "Book Now",
    cta_button_url: "/book",
    duration: "",
    category: "",
    image: "",
    route: "",
    price_current: "",
    price_original: "",
    per_adult: "",
    per_child: "",
    price_currency: "$",
    price_note: "",
    highlights: [],
    includes: [],
    excludes: [],
    gallary: [], // This will store selected gallery image IDs
    features: [],
    images: [],
    days: [],
  });

  const [activeTab, setActiveTab] = useState("General");
  const [activeDay, setActiveDay] = useState(0);

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
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setCountries([
        { id: 1, name: "UAE" },
        { id: 2, name: "Oman" },
      ]);

      const [hotelsRes, carsRes, activitiesRes] = await Promise.all([
        axios.get(`${base_url}/admin/hotels/select_hotels.php`),
        axios.get(`${base_url}/admin/cars/select_cars.php`),
        axios.get(`${base_url}/admin/activities/select_activities.php`),
      ]);

      setHotels(hotelsRes.data.message || []);
      setCars(carsRes.data.message || []);
      setActivities(activitiesRes.data.message || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      message.error(
        "Failed to load selection data for Hotels, Cars, or Activities"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addDay = () => {
    const newDay = {
      day: formData.days.length + 1,
      title: "",
      description: "",
      hotel_id: [],
      car_id: [],
      activity_id: [],
    };
    setFormData((prev) => ({ ...prev, days: [...prev.days, newDay] }));
    setActiveDay(formData.days.length);
  };

  const removeDay = (indexToRemove) => {
    const updatedDays = formData.days.filter((_, i) => i !== indexToRemove);
    const renumbered = updatedDays.map((day, i) => ({ ...day, day: i + 1 }));

    setFormData((prev) => ({ ...prev, days: renumbered }));

    if (activeDay >= indexToRemove) {
      setActiveDay(Math.max(0, activeDay - 1));
    }
  };

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...formData.days];
    updatedDays[index] = { ...updatedDays[index], [field]: value };
    setFormData((prev) => ({ ...prev, days: updatedDays }));
  };

  // Handle gallery selection change
  const handleGallerySelectionChange = (selectedImageIds) => {
    setFormData((prev) => ({ ...prev, gallary: selectedImageIds }));
  };

  const prepareDataForAPI = (data) => {
    return {
      ...data,
      highlights: Array.isArray(data.highlights)
        ? data.highlights.join("**")
        : data.highlights,
      includes: Array.isArray(data.includes)
        ? data.includes.join("**")
        : data.includes,
      excludes: Array.isArray(data.excludes)
        ? data.excludes.join("**")
        : data.excludes,
      gallary: Array.isArray(data.gallary)
        ? data.gallary.join("**")
        : data.gallary,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Step 1: Create the main tour
      const apiData = prepareDataForAPI(formData);
      const { features, days, images, ...tourData } = apiData;

      console.log("Creating tour with data:", tourData);

      const tourResponse = await axios.post(
        `${base_url}/admin/tours/add_tour.php`,
        tourData
      );

      console.log("Tour creation response:", tourResponse.data);

      if (tourResponse.data.status === "success") {
        // Step 2: Extract tour ID from response
        let tourId = null;

        if (tourResponse.data.tour_id) {
          tourId = tourResponse.data.tour_id;
        } else if (
          tourResponse.data.message &&
          typeof tourResponse.data.message === "object" &&
          tourResponse.data.message.tour_id
        ) {
          tourId = tourResponse.data.message.tour_id;
        } else if (tourResponse.data.data && tourResponse.data.data.id) {
          tourId = tourResponse.data.data.id;
        }

        console.log("Extracted tour ID:", tourId);

        if (!tourId) {
          console.error("No tour ID found in response:", tourResponse.data);
          message.error(
            "Tour created but failed to get tour ID. Please check the backend response."
          );
          return;
        }

        // Step 3: Create days if any exist
        if (formData.days && formData.days.length > 0) {
          console.log("Creating days for tour ID:", tourId);

          for (const [index, day] of formData.days.entries()) {
            const dayData = {
              tour_id: tourId,
              day: day.day,
              title: day.title,
              description: day.description,
              hotel_id: Array.isArray(day.hotel_id)
                ? day.hotel_id.join(",")
                : day.hotel_id,
              car_id: Array.isArray(day.car_id)
                ? day.car_id.join(",")
                : day.car_id,
              activity_id: Array.isArray(day.activity_id)
                ? day.activity_id.join(",")
                : day.activity_id,
            };

            console.log(`Creating day ${index + 1} with data:`, dayData);

            try {
              const dayResponse = await axios.post(
                `${base_url}/admin/tours/days/add_tour_day.php`,
                dayData
              );

              console.log(
                `Day ${index + 1} creation response:`,
                dayResponse.data
              );

              if (dayResponse.data.status !== "success") {
                console.error(
                  `Failed to create day ${index + 1}:`,
                  dayResponse.data
                );
                message.warning(
                  `Day ${index + 1} creation failed: ${
                    dayResponse.data.message || "Unknown error"
                  }`
                );
              }
            } catch (dayError) {
              console.error(`Error creating day ${index + 1}:`, dayError);
              message.warning(
                `Failed to create day ${index + 1}: ${dayError.message}`
              );
            }
          }
        }

        message.success("Tour created successfully!");
        navigate("/tours");
      } else {
        console.error("Tour creation failed:", tourResponse.data);
        message.error(
          `Failed to create tour: ${
            tourResponse.data.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error creating tour:", error);
      message.error(
        `An error occurred while creating the tour: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralTab = () => (
    <div className="flex flex-col !gap-4">
      <FormControl fullWidth>
        <InputLabel>Country</InputLabel>
        <MuiSelect
          name="country_id"
          value={formData.country_id}
          onChange={handleChange}
          label="Country"
        >
          {countries.map((country) => (
            <MenuItem key={country.id} value={country.id}>
              {country.name}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>

      <TextField
        fullWidth
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <TextField
        fullWidth
        label="Subtitle"
        name="subtitle"
        value={formData.subtitle}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <JoditEditor
          value={formData.description}
          config={editorConfig}
          onBlur={(content) =>
            setFormData((prev) => ({ ...prev, description: content }))
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
        />
        <TextField
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        />
      </div>

      <TextField
        fullWidth
        label="Route"
        name="route"
        value={formData.route}
        onChange={handleChange}
      />
    </div>
  );

  const renderPricingTab = () => (
    <div className="!space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Current Price"
          name="price_current"
          type="number"
          value={formData.price_current}
          onChange={handleChange}
          onWheel={(e) => e.target.blur()}
        />
        <TextField
          label="Original Price"
          name="price_original"
          type="number"
          value={formData.price_original}
          onChange={handleChange}
          onWheel={(e) => e.target.blur()}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Per Child"
          name="per_child"
          type="number"
          value={formData.per_child}
          onChange={handleChange}
          onWheel={(e) => e.target.blur()}
        />
        <TextField
          fullWidth
          label="Price Note"
          name="price_note"
          value={formData.price_note}
          onChange={handleChange}
          multiline
          rows={2}
        />
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="!space-y-4">
      {/* Highlights */}
      <div>
        <label className="block mb-2 font-medium">Highlights</label>
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Add highlights (press Enter to add each one)"
          value={formData.highlights}
          onChange={(values) =>
            setFormData((prev) => ({ ...prev, highlights: values }))
          }
          tokenSeparators={[","]}
        />
        <div className="text-sm text-gray-500 mt-1">
          Type and press Enter to add each highlight
        </div>
      </div>

      {/* Includes */}
      <div>
        <label className="block mb-2 font-medium">Includes</label>
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Add what's included (press Enter to add each one)"
          value={formData.includes}
          onChange={(values) =>
            setFormData((prev) => ({ ...prev, includes: values }))
          }
          tokenSeparators={[","]}
        />
        <div className="text-sm text-gray-500 mt-1">
          Type and press Enter to add each item
        </div>
      </div>

      {/* Excludes */}
      <div>
        <label className="block mb-2 font-medium">Excludes</label>
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Add what's excluded (press Enter to add each one)"
          value={formData.excludes}
          onChange={(values) =>
            setFormData((prev) => ({ ...prev, excludes: values }))
          }
          tokenSeparators={[","]}
        />
        <div className="text-sm text-gray-500 mt-1">
          Type and press Enter to add each item
        </div>
      </div>

      {/* Gallery Selector - Updated */}
      <GallerySelector
        selectedImages={formData.gallary}
        onSelectionChange={handleGallerySelectionChange}
      />
    </div>
  );

  const renderImagesTab = () => (
    <TourImages rowData={formData} setRowData={setFormData} />
  );

  const renderDaysTab = () => (
    <div className="border p-4 rounded">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Days & Itinerary</h3>
        <Button variant="contained" startIcon={<FaPlus />} onClick={addDay}>
          Add Day
        </Button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {formData.days.map((day, index) => (
          <Button
            key={index}
            variant={activeDay === index ? "contained" : "outlined"}
            onClick={() => setActiveDay(index)}
            className="min-w-[120px]"
          >
            Day {day.day}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                removeDay(index);
              }}
              className="ml-1"
            >
              <MdDelete className="text-red-600" />
            </IconButton>
          </Button>
        ))}
      </div>

      {formData.days.length > 0 && formData.days[activeDay] && (
        <div className="!space-y-4">
          <TextField
            fullWidth
            label="Day Title"
            value={formData.days[activeDay]?.title || ""}
            onChange={(e) =>
              handleDayChange(activeDay, "title", e.target.value)
            }
          />

          <div>
            <label className="block mb-1 font-medium">Day Description</label>
            <JoditEditor
              value={formData.days[activeDay]?.description || ""}
              config={editorConfig}
              onBlur={(content) =>
                handleDayChange(activeDay, "description", content)
              }
            />
          </div>

          <FormControl fullWidth>
            <label className="block mb-1 font-medium">Select Hotels</label>
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select hotels for this day"
              value={formData.days[activeDay]?.hotel_id || []}
              onChange={(value) =>
                handleDayChange(activeDay, "hotel_id", value)
              }
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={hotels.map((hotel) => ({
                value: hotel.id,
                label: hotel.title,
              }))}
            />
          </FormControl>

          <FormControl fullWidth>
            <label className="block mb-1 font-medium">Select Cars</label>
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select cars for this day"
              value={formData.days[activeDay]?.car_id || []}
              onChange={(value) => handleDayChange(activeDay, "car_id", value)}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={cars.map((car) => ({ value: car.id, label: car.title }))}
            />
          </FormControl>

          <FormControl fullWidth>
            <label className="block mb-1 font-medium">Select Activities</label>
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select activities for this day"
              value={formData.days[activeDay]?.activity_id || []}
              onChange={(value) =>
                handleDayChange(activeDay, "activity_id", value)
              }
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={activities.map((activity) => ({
                value: activity.id,
                label: activity.title,
              }))}
            />
          </FormControl>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "General":
        return renderGeneralTab();
      case "Pricing":
        return renderPricingTab();
      case "Features":
        return renderFeaturesTab();
      case "Images":
        return renderImagesTab();
      case "Days":
        return renderDaysTab();
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Tour</h1>

      <div className="mb-4">
        <Tabs
          tabs={["General", "Pricing", "Features", "Images", "Days"]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-5 rounded-lg"
      >
        {renderTabContent()}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Creating..." : "Create Tour"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateTourLayout;
