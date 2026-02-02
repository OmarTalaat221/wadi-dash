// components/tours/UpdateTourLayout.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Tabs from "../../../components/Tabs";
import TourFeatures from "../../../components/tours-page/TourFeatures";
import GallerySelector from "../../../components/tours-page/GallerySelector";

import JoditEditor from "jodit-react";
import {
  Box,
  Button,
  IconButton,
  FormControl,
  TextField,
  Dialog,
  DialogContent,
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
import TourImages from "../../../components/tours-page/tour-images";
import editorConfig from "../../../data/joditConfig";

function UpdateTourLayout() {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cars, setCars] = useState([]);
  const [activities, setActivities] = useState([]);

  const [formData, setFormData] = useState({
    id: product_id,
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
    max_persons: "",
    per_adult: "",
    per_child: "",
    video_link: "",

    price_currency: "$",
    price_note: "",
    highlights: [],
    includes: [],
    excludes: [],
    gallery: [],
    features: [],
    images: [],
    days: [],
  });

  const [activeTab, setActiveTab] = useState("General");
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    loadInitialData();
    loadTourData();
  }, [product_id]);

  const loadInitialData = async () => {
    try {
      setCountries([
        { id: 1, name: "UAE" },
        { id: 2, name: "Oman" },
      ]);

      const [hotelsRes, carsRes, activitiesRes] = await Promise.all([
        axios.get(`${base_url}/admin/hotels/select_hotels.php`),
        axios.get(`${base_url}/admin/cars/select_cars.php`),
        axios.get(`${base_url}/admin/activities/select_activities.php`),
      ]);

      setHotels(
        (hotelsRes.data.message || []).map((hotel) => ({
          ...hotel,
          id: Number(hotel.id),
        }))
      );
      setCars(
        (carsRes.data.message || []).map((car) => ({
          ...car,
          id: Number(car.id),
        }))
      );
      setActivities(
        (activitiesRes.data.message || []).map((activity) => ({
          ...activity,
          id: Number(activity.id),
        }))
      );
    } catch (error) {
      console.error("Error loading initial data:", error);
      message.error("Failed to load selection data");
    }
  };

  const loadTourData = async () => {
    try {
      setInitialLoading(true);

      const response = await axios.post(
        `${base_url}/admin/tours/tour_details.php`,
        {
          id: product_id,
        }
      );

      console.log("Tour details response:", response.data);

      if (
        response.data.status === "success" &&
        response.data.message.length > 0
      ) {
        const tourData = response.data.message[0];

        console.log("Tour data received:", tourData);
        console.log("Raw gallery data:", tourData.gallery);

        // Convert itinerary to days format for form
        const days =
          tourData.itinerary?.map((item) => ({
            day: item.day,
            title: item.title,
            description: item.description,
            hotel_id: item.hotel_options?.map((h) => Number(h.hotel_id)) || [],
            car_id: item.cars_options?.map((c) => Number(c.car_id)) || [],
            activity_id:
              item.activities_options?.map((a) => Number(a.activity_id)) || [],
            isExisting: true,
          })) || [];

        console.log("Converted days:", days);

        // UPDATED: Parse gallery data - handle array of objects
        let galleryData = [];

        if (tourData.gallery) {
          if (Array.isArray(tourData.gallery)) {
            // Check if it's an array of objects with id property
            if (
              tourData.gallery.length > 0 &&
              typeof tourData.gallery[0] === "object" &&
              tourData.gallery[0].id
            ) {
              // Extract IDs from objects: [{id: "1", image: "..."}, ...] -> ["1", ...]
              galleryData = tourData.gallery.map((item) => String(item.id));
              console.log("Parsed gallery from array of objects:", galleryData);
            } else {
              // Simple array of IDs
              galleryData = tourData.gallery.map((id) => String(id));
              console.log("Parsed gallery from simple array:", galleryData);
            }
          } else if (typeof tourData.gallery === "string") {
            // String separated by **
            galleryData = tourData.gallery
              .split("**")
              .filter((id) => id.trim())
              .map((id) => String(id.trim()));
            console.log("Parsed gallery from string:", galleryData);
          }
        }

        console.log("Final parsed gallery data:", galleryData);

        const features = tourData.features || [];

        setFormData({
          id: tourData.id,
          country_id: tourData.country_id,
          title: tourData.title,
          subtitle: tourData.subtitle,
          description: tourData.description,
          background_image: tourData.background_image,
          cta_button_text: tourData.cta_button_text,
          cta_button_url: tourData.cta_button_url,
          duration: tourData.duration,
          category: tourData.category,
          image: tourData.image,
          route: tourData.route,
          price_current: tourData.price_current,
          price_original: tourData.price_original,
          per_adult: tourData.per_adult,
          per_child: tourData.per_child,
          price_currency: tourData.price_currency,
          price_note: tourData.price_note,
          max_persons: tourData.max_persons || "", // ✅ أضف هذا
          video_link: tourData.video_link || "", // ✅ أضف هذا

          highlights: Array.isArray(tourData.highlights)
            ? tourData.highlights
            : typeof tourData.highlights === "string"
              ? tourData.highlights.split("**").filter((h) => h.trim())
              : [],
          includes: Array.isArray(tourData.includes)
            ? tourData.includes
            : typeof tourData.includes === "string"
              ? tourData.includes.split("**").filter((i) => i.trim())
              : [],
          excludes: Array.isArray(tourData.excludes)
            ? tourData.excludes
            : typeof tourData.excludes === "string"
              ? tourData.excludes.split("**").filter((e) => e.trim())
              : [],
          gallery: galleryData,
          features: features,
          images: [],
          days: days,
        });

        console.log("Form data set successfully");
        console.log("Gallery in formData:", galleryData);
      }
    } catch (error) {
      console.error("Error loading tour data:", error);
      message.error("Failed to load tour data");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for gallery selection
  const handleGallerySelection = (selectedIds) => {
    console.log("Gallery selection changed:", selectedIds);
    setFormData((prev) => ({ ...prev, gallery: selectedIds }));
  };

  const addDay = () => {
    const newDay = {
      day: formData.days.length + 1,
      title: "",
      description: "",
      hotel_id: [],
      car_id: [],
      activity_id: [],
      isExisting: false,
    };
    setFormData((prev) => ({ ...prev, days: [...prev.days, newDay] }));
    setActiveDay(formData.days.length);
  };

  const removeDay = async (indexToRemove) => {
    try {
      const dayToRemove = formData.days[indexToRemove];

      if (dayToRemove.isExisting) {
        setLoading(true);
        const deleteResponse = await axios.post(
          `${base_url}/admin/tours/days/delete_tour_day.php`,
          {
            id: product_id,
            day: dayToRemove.day,
          }
        );

        console.log("Delete day response:", deleteResponse.data);

        if (deleteResponse.data.status !== "success") {
          message.warning(
            `Failed to delete day from server: ${deleteResponse.data.message}`
          );
          setLoading(false);
          return;
        }
      }

      const updatedDays = formData.days.filter((_, i) => i !== indexToRemove);
      const renumbered = updatedDays.map((day, i) => ({ ...day, day: i + 1 }));

      setFormData((prev) => ({ ...prev, days: renumbered }));

      if (activeDay >= indexToRemove) {
        setActiveDay(Math.max(0, activeDay - 1));
      }

      message.success("Day removed successfully");
    } catch (error) {
      console.error("Error removing day:", error);
      message.error("Failed to remove day");
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...formData.days];
    updatedDays[index] = { ...updatedDays[index], [field]: value };
    setFormData((prev) => ({ ...prev, days: updatedDays }));
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
      gallery: Array.isArray(data.gallery)
        ? data.gallery.join("**")
        : data.gallery,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const apiData = prepareDataForAPI(formData);
      const { features, days, images, ...tourData } = apiData;

      console.log("Updating tour with data:", tourData);
      console.log("Gallery being sent:", tourData.gallery);

      const tourResponse = await axios.post(
        `${base_url}/admin/tours/edit_tour.php`,
        tourData
      );

      console.log("Tour update response:", tourResponse.data);

      if (tourResponse.data.status === "success") {
        if (formData.days && formData.days.length > 0) {
          console.log("Processing days...");

          for (const [index, day] of formData.days.entries()) {
            const dayData = {
              tour_id: product_id,
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

            try {
              let dayResponse;

              if (day.isExisting) {
                console.log(
                  `Updating existing day ${index + 1} with data:`,
                  dayData
                );
                dayResponse = await axios.post(
                  `${base_url}/admin/tours/days/edit_tour_day.php`,
                  dayData
                );
              } else {
                console.log(`Adding new day ${index + 1} with data:`, dayData);
                dayResponse = await axios.post(
                  `${base_url}/admin/tours/days/add_tour_day.php`,
                  dayData
                );
              }

              console.log(
                `Day ${index + 1} ${
                  day.isExisting ? "update" : "add"
                } response:`,
                dayResponse.data
              );

              if (dayResponse.data.status !== "success") {
                console.error(
                  `Failed to ${day.isExisting ? "update" : "add"} day ${
                    index + 1
                  }:`,
                  dayResponse.data
                );
                message.warning(
                  `Day ${index + 1} ${
                    day.isExisting ? "update" : "add"
                  } failed: ${dayResponse.data.message || "Unknown error"}`
                );
              }
            } catch (dayError) {
              console.error(`Error processing day ${index + 1}:`, dayError);
              message.warning(
                `Failed to process day ${index + 1}: ${dayError.message}`
              );
            }
          }
        }

        message.success("Tour updated successfully!");
        navigate("/tours");
      } else {
        console.error("Tour update failed:", tourResponse.data);
        message.error(
          `Failed to update tour: ${
            tourResponse.data.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error updating tour:", error);
      message.error(
        `An error occurred while updating the tour: ${error.message}`
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

        <TextField
          fullWidth
          label="Max Persons"
          name="max_persons"
          type="number"
          value={formData.max_persons}
          onChange={handleChange}
          placeholder="Enter maximum number of persons"
          onWheel={(e) => e.target.blur()}
        />

        <TextField
          fullWidth
          label="Video Link"
          name="video_link"
          value={formData.video_link}
          onChange={handleChange}
          placeholder="Enter video link"
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

      <div>
        <GallerySelector
          selectedImages={formData.gallery}
          onSelectionChange={handleGallerySelection}
        />
      </div>
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
            Day {day.day}{" "}
            {!day.isExisting && <span className="ml-1 text-xs">(New)</span>}
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
                value: Number(hotel.id),
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
              options={cars.map((car) => ({
                value: Number(car.id),
                label: car.title,
              }))}
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
                value: Number(activity.id),
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

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <span className="ml-2">Loading tour data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Update Tour</h1>

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
            {loading ? "Updating..." : "Update Tour"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default UpdateTourLayout;
