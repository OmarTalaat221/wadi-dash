// components/tours/UpdateTourLayout.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Tabs from "../../../components/Tabs";
import TourFeatures from "../../../components/tours-page/TourFeatures";
import GallerySelector from "../../../components/tours-page/GallerySelector";
import MapLocationPicker from "../../../components/tours-page/MapLocationPicker";
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
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Tooltip,
} from "@mui/material";
import { Select, Space, message } from "antd";
import { MdDelete, MdLocationOn, MdEdit } from "react-icons/md";
import { FaEye, FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import { FiPlus, FiMap } from "react-icons/fi";
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

  // Map Picker State
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [editingLocationIndex, setEditingLocationIndex] = useState(null);
  const [editingDayIndex, setEditingDayIndex] = useState(null);

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
    extra_images: [],
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
        { id: product_id }
      );

      console.log("Tour details response:", response.data);

      if (
        response.data.status === "success" &&
        response.data.message.length > 0
      ) {
        const tourData = response.data.message[0];

        console.log("Tour data received:", tourData);

        let extraImagesData = [];
        if (tourData.extra_images) {
          if (Array.isArray(tourData.extra_images)) {
            extraImagesData = tourData.extra_images;
          } else if (typeof tourData.extra_images === "string") {
            extraImagesData = tourData.extra_images
              .split("**")
              .filter((url) => url.trim());
          }
        }

        // Convert itinerary to days format - handle day_locations
        const days =
          tourData.itinerary?.map((item) => {
            console.log(`Day ${item.day} locations:`, item.day_locations);

            return {
              day: item.day,
              day_id: item.day_id,
              title: item.title,
              description: item.description,
              hotel_id:
                item.hotel_options?.map((h) => Number(h.hotel_id)) || [],
              car_id: item.cars_options?.map((c) => Number(c.car_id)) || [],
              activity_id:
                item.activities_options?.map((a) => Number(a.activity_id)) ||
                [],
              isTourguide: item.isTourguide ? Number(item.isTourguide) : 0,
              // Parse day_locations from API
              locations:
                item.day_locations?.map((loc) => ({
                  location_id: loc.location_id,
                  itinerary_id: loc.itinerary_id,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  description: loc.description || "",
                  isExisting: true,
                })) || [],
              isExisting: true,
            };
          }) || [];

        console.log("Converted days with locations:", days);

        // Parse gallery data
        let galleryData = [];
        if (tourData.gallery) {
          if (Array.isArray(tourData.gallery)) {
            if (
              tourData.gallery.length > 0 &&
              typeof tourData.gallery[0] === "object" &&
              tourData.gallery[0].id
            ) {
              galleryData = tourData.gallery.map((item) => String(item.id));
            } else {
              galleryData = tourData.gallery.map((id) => String(id));
            }
          } else if (typeof tourData.gallery === "string") {
            galleryData = tourData.gallery
              .split("**")
              .filter((id) => id.trim())
              .map((id) => String(id.trim()));
          }
        }

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
          extra_images: extraImagesData,
          price_current: tourData.price_current,
          price_original: tourData.price_original,
          per_adult: tourData.per_adult,
          per_child: tourData.per_child,
          price_currency: tourData.price_currency,
          price_note: tourData.price_note,
          max_persons: tourData.max_persons || "",
          video_link: tourData.video_link || "",
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

        console.log("Form data set successfully with days:", days);
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

  const handleGallerySelection = (selectedIds) => {
    setFormData((prev) => ({ ...prev, gallery: selectedIds }));
  };

  const handleExtraImagesChange = (imageUrls) => {
    setFormData((prev) => ({ ...prev, extra_images: imageUrls }));
  };

  // ============ Day Functions ============
  const addDay = () => {
    const newDay = {
      day: formData.days.length + 1,
      title: "",
      description: "",
      hotel_id: [],
      car_id: [],
      activity_id: [],
      isTourguide: 0,
      locations: [],
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

        if (deleteResponse.data.status !== "success") {
          message.warning(
            `Failed to delete day: ${deleteResponse.data.message}`
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

  const handleTourguideToggle = (index, checked) => {
    handleDayChange(index, "isTourguide", checked ? 1 : 0);
  };

  // ============ Location Functions ============

  const openMapPickerForNewLocation = (dayIndex) => {
    setEditingDayIndex(dayIndex);
    setEditingLocationIndex(null);
    setMapPickerOpen(true);
  };

  const openMapPickerForEdit = (dayIndex, locationIndex) => {
    setEditingDayIndex(dayIndex);
    setEditingLocationIndex(locationIndex);
    setMapPickerOpen(true);
  };

  const getCurrentLocationForEdit = () => {
    if (editingLocationIndex !== null && editingDayIndex !== null) {
      return formData.days[editingDayIndex]?.locations[editingLocationIndex];
    }
    return null;
  };

  // تأكيد اختيار الموقع من الخريطة
  const handleMapConfirm = async (locationData) => {
    const updatedDays = [...formData.days];

    if (!updatedDays[editingDayIndex].locations) {
      updatedDays[editingDayIndex].locations = [];
    }

    if (editingLocationIndex !== null) {
      // تعديل موقع موجود
      const existingLocation =
        updatedDays[editingDayIndex].locations[editingLocationIndex];

      if (existingLocation.isExisting && existingLocation.location_id) {
        // إذا كان موقع موجود في قاعدة البيانات، نحدثه عبر API
        try {
          setLoading(true);
          const response = await axios.post(
            `${base_url}/admin/tours/map/edit_map_locations.php`,
            {
              location_id: existingLocation.location_id,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              description: locationData.description,
            }
          );

          console.log("Edit location response:", response.data);

          if (response.data.status === "success") {
            updatedDays[editingDayIndex].locations[editingLocationIndex] = {
              ...existingLocation,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              description: locationData.description,
            };
            message.success("Location updated successfully!");
          } else {
            message.error(
              "Failed to update location: " + response.data.message
            );
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error updating location:", error);
          message.error("Failed to update location");
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      } else {
        // موقع جديد لم يُحفظ بعد
        updatedDays[editingDayIndex].locations[editingLocationIndex] = {
          ...locationData,
          isExisting: false,
        };
        message.success("Location updated!");
      }
    } else {
      // إضافة موقع جديد
      updatedDays[editingDayIndex].locations.push({
        ...locationData,
        isExisting: false,
      });
      message.success("Location added!");
    }

    setFormData((prev) => ({ ...prev, days: updatedDays }));
    setMapPickerOpen(false);
    setEditingLocationIndex(null);
    setEditingDayIndex(null);
  };

  // حذف موقع
  const removeLocation = async (dayIndex, locationIndex) => {
    const location = formData.days[dayIndex].locations[locationIndex];

    // إذا كان الموقع موجود في قاعدة البيانات، نحذفه عبر API
    if (location.isExisting && location.location_id) {
      try {
        setLoading(true);
        const response = await axios.post(
          `${base_url}/admin/tours/map/delete_location.php`,
          {
            location_id: location.location_id,
          }
        );

        console.log("Delete location response:", response.data);

        if (response.data.status !== "success") {
          message.error("Failed to delete location: " + response.data.message);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error deleting location:", error);
        message.error("Failed to delete location");
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    const updatedDays = [...formData.days];
    updatedDays[dayIndex].locations = updatedDays[dayIndex].locations.filter(
      (_, i) => i !== locationIndex
    );
    setFormData((prev) => ({ ...prev, days: updatedDays }));
    message.success("Location removed!");
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
      extra_images: Array.isArray(data.extra_images)
        ? data.extra_images.join("**")
        : data.extra_images,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const apiData = prepareDataForAPI(formData);
      const { features, days, images, ...tourData } = apiData;

      console.log("Updating tour with data:", tourData);

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
              day_id: day.day_id,
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
              isTourguide: day.isTourguide || 0,
            };

            try {
              let dayResponse;
              let itineraryId = day.day_id;

              if (day.isExisting) {
                console.log(`Updating existing day ${index + 1}:`, dayData);
                dayResponse = await axios.post(
                  `${base_url}/admin/tours/days/edit_tour_day.php`,
                  dayData
                );
              } else {
                console.log(`Adding new day ${index + 1}:`, dayData);
                dayResponse = await axios.post(
                  `${base_url}/admin/tours/days/add_tour_day.php`,
                  dayData
                );

                // Extract itinerary_id from new day response
                if (dayResponse.data.status === "success") {
                  itineraryId =
                    dayResponse.data.itinerary_id ||
                    dayResponse.data.day_id ||
                    dayResponse.data.id ||
                    dayResponse.data.message?.itinerary_id ||
                    dayResponse.data.data?.itinerary_id;
                }
              }

              console.log(`Day ${index + 1} response:`, dayResponse.data);

              if (dayResponse.data.status !== "success") {
                message.warning(
                  `Day ${index + 1} failed: ${dayResponse.data.message}`
                );
                continue;
              }

              // Process new locations for this day (only add new ones)
              if (day.locations && day.locations.length > 0 && itineraryId) {
                for (const [locIndex, location] of day.locations.entries()) {
                  // Only add NEW locations (not existing ones)
                  if (
                    !location.isExisting &&
                    location.latitude &&
                    location.longitude
                  ) {
                    try {
                      const locationData = {
                        tour_id: product_id,
                        itinerary_id: itineraryId,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        description: location.description || "",
                      };

                      console.log(
                        `Adding new location for day ${index + 1}:`,
                        locationData
                      );

                      const locationResponse = await axios.post(
                        `${base_url}/admin/tours/map/add_map_locations.php`,
                        locationData
                      );

                      console.log(`Location response:`, locationResponse.data);

                      if (locationResponse.data.status === "success") {
                        message.success(`Location added to Day ${index + 1}`);
                      } else {
                        message.warning(
                          `Failed to add location to Day ${index + 1}`
                        );
                      }
                    } catch (locationError) {
                      console.error(`Error adding location:`, locationError);
                    }
                  }
                }
              }
            } catch (dayError) {
              console.error(`Error processing day ${index + 1}:`, dayError);
              message.warning(`Failed to process day ${index + 1}`);
            }
          }
        }

        message.success("Tour updated successfully!");
        navigate("/tours");
      } else {
        message.error(`Failed to update tour: ${tourResponse.data.message}`);
      }
    } catch (error) {
      console.error("Error updating tour:", error);
      message.error(`An error occurred: ${error.message}`);
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
          onWheel={(e) => e.target.blur()}
        />
        <TextField
          fullWidth
          label="Video Link"
          name="video_link"
          value={formData.video_link}
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
          label="Per Adult"
          name="per_adult"
          type="number"
          value={formData.per_adult}
          onChange={handleChange}
          onWheel={(e) => e.target.blur()}
        />
        <TextField
          label="Per Child"
          name="per_child"
          type="number"
          value={formData.per_child}
          onChange={handleChange}
          onWheel={(e) => e.target.blur()}
        />
      </div>
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
  );

  const renderFeaturesTab = () => (
    <div className="!space-y-4">
      <div>
        <label className="block mb-2 font-medium">Highlights</label>
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Add highlights"
          value={formData.highlights}
          onChange={(values) =>
            setFormData((prev) => ({ ...prev, highlights: values }))
          }
          tokenSeparators={[","]}
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Includes</label>
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Add what's included"
          value={formData.includes}
          onChange={(values) =>
            setFormData((prev) => ({ ...prev, includes: values }))
          }
          tokenSeparators={[","]}
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Excludes</label>
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Add what's excluded"
          value={formData.excludes}
          onChange={(values) =>
            setFormData((prev) => ({ ...prev, excludes: values }))
          }
          tokenSeparators={[","]}
        />
      </div>

      <GallerySelector
        selectedImages={formData.gallery}
        onSelectionChange={handleGallerySelection}
        extraImages={formData.extra_images}
        onExtraImagesChange={handleExtraImagesChange}
      />
    </div>
  );

  const renderImagesTab = () => (
    <TourImages rowData={formData} setRowData={setFormData} />
  );

  // ============ Render Days Tab ============
  const renderDaysTab = () => (
    <div className="border p-4 rounded">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Days & Itinerary</h3>
        <Button variant="contained" startIcon={<FaPlus />} onClick={addDay}>
          Add Day
        </Button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {formData.days.map((day, index) => (
          <Button
            key={index}
            variant={activeDay === index ? "contained" : "outlined"}
            onClick={() => setActiveDay(index)}
            className="min-w-[120px] flex-shrink-0"
          >
            Day {day.day}
            {!day.isExisting && <span className="ml-1 text-xs">(New)</span>}
            {day.isTourguide === 1 && <span className="ml-1">🎯</span>}
            {day.locations && day.locations.length > 0 && (
              <Chip
                size="small"
                label={`📍${day.locations.length}`}
                color="secondary"
                className="ml-1"
                sx={{ height: 18, fontSize: 10 }}
              />
            )}
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

          {/* Tour Guide Toggle */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <FormControlLabel
              control={
                <Switch
                  checked={formData.days[activeDay]?.isTourguide === 1}
                  onChange={(e) =>
                    handleTourguideToggle(activeDay, e.target.checked)
                  }
                  color="primary"
                />
              }
              label={
                <div className="flex flex-col">
                  <span className="font-medium">Tour Guide Required</span>
                  <span className="text-sm text-gray-500">
                    Enable if this day requires a tour guide
                  </span>
                </div>
              }
            />
          </div>

          {/* ============ Map Locations Section ============ */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600 text-xl" />
                <h4 className="font-bold text-blue-800">Map Locations</h4>
                {formData.days[activeDay]?.locations?.length > 0 && (
                  <Chip
                    label={`${formData.days[activeDay].locations.length} location(s)`}
                    size="small"
                    color="primary"
                  />
                )}
              </div>
              {formData.days[activeDay]?.locations?.length < 1 && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<FiMap />}
                  onClick={() => openMapPickerForNewLocation(activeDay)}
                  sx={{ backgroundColor: "#2563eb" }}
                >
                  Add from Map
                </Button>
              )}
            </div>

            {formData.days[activeDay]?.locations &&
            formData.days[activeDay].locations.length > 0 ? (
              <div className="space-y-3">
                {formData.days[activeDay].locations.map(
                  (location, locIndex) => (
                    <div
                      key={locIndex}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-red-100 p-2 rounded-full">
                            <MdLocationOn className="text-red-500 text-xl" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-gray-800">
                                Location {locIndex + 1}
                              </span>
                              {location.isExisting && (
                                <Chip
                                  size="small"
                                  label="Saved"
                                  color="success"
                                  sx={{ fontSize: 10, height: 20 }}
                                />
                              )}
                              {!location.isExisting && (
                                <Chip
                                  size="small"
                                  label="New"
                                  color="warning"
                                  sx={{ fontSize: 10, height: 20 }}
                                />
                              )}
                              <Chip
                                size="small"
                                label={`${parseFloat(location.latitude).toFixed(4)}, ${parseFloat(location.longitude).toFixed(4)}`}
                                variant="outlined"
                                sx={{ fontSize: 10 }}
                              />
                            </div>
                            {location.description && (
                              <p className="text-gray-600 text-sm mb-1">
                                {location.description}
                              </p>
                            )}
                            <a
                              href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <FaEye size={10} />
                              View on Google Maps
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Tooltip title="Edit Location">
                            <IconButton
                              size="small"
                              onClick={() =>
                                openMapPickerForEdit(activeDay, locIndex)
                              }
                              color="primary"
                            >
                              <MdEdit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove Location">
                            <IconButton
                              size="small"
                              onClick={() =>
                                removeLocation(activeDay, locIndex)
                              }
                              color="error"
                              disabled={loading}
                            >
                              <MdDelete />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <FiMap className="text-4xl mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No locations added yet</p>
                <p className="text-sm mb-3">
                  Click "Add from Map" to select locations
                </p>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FiMap />}
                  onClick={() => openMapPickerForNewLocation(activeDay)}
                >
                  Open Map
                </Button>
              </div>
            )}
          </div>

          <Divider className="my-4" />

          {/* Hotels, Cars, Activities Selection */}
          <FormControl fullWidth>
            <label className="block mb-1 font-medium">Select Hotels</label>
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Select hotels for this day"
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
              placeholder="Select cars for this day"
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
              placeholder="Select activities for this day"
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

      {formData.days.length === 0 && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
          <FaPlus className="text-4xl mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No days added yet</p>
          <p className="text-sm mb-4">
            Click "Add Day" to start building your itinerary
          </p>
          <Button variant="contained" startIcon={<FaPlus />} onClick={addDay}>
            Add First Day
          </Button>
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
        className="space-y-6 bg-white p-5 rounded-lg shadow"
      >
        {renderTabContent()}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate("/tours")}
          >
            Cancel
          </Button>
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

      {/* Map Location Picker Modal */}
      <MapLocationPicker
        open={mapPickerOpen}
        onClose={() => {
          setMapPickerOpen(false);
          setEditingLocationIndex(null);
          setEditingDayIndex(null);
        }}
        onConfirm={handleMapConfirm}
        initialLocation={getCurrentLocationForEdit()}
      />
    </div>
  );
}

export default UpdateTourLayout;
