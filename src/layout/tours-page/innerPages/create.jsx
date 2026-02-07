// components/tours/CreateTourLayout.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Tabs from "../../../components/Tabs";
import TourFeatures from "../../../components/tours-page/TourFeatures";
import TourImages from "../../../components/tours-page/tour-images";
import GallerySelector from "../../../components/tours-page/GallerySelector";
import MapLocationPicker from "../../../components/tours-page/MapLocationPicker"; // إضافة الـ import
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
import editorConfig from "../../../data/joditConfig";

function CreateTourLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cars, setCars] = useState([]);
  const [activities, setActivities] = useState([]);

  // Map Picker State
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [editingLocationIndex, setEditingLocationIndex] = useState(null);
  const [editingDayIndex, setEditingDayIndex] = useState(null);

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
    max_persons: "",
    video_link: "",
    per_adult: "",
    per_child: "",
    price_currency: "$",
    price_note: "",
    highlights: [],
    includes: [],
    excludes: [],
    gallary: [],
    extra_images: [],
    features: [],
    images: [],
    days: [],
  });

  const [activeTab, setActiveTab] = useState("General");
  const [activeDay, setActiveDay] = useState(0);

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

  const handleTourguideToggle = (index, checked) => {
    handleDayChange(index, "isTourguide", checked ? 1 : 0);
  };

  // ============ Location Functions with Map Picker ============

  // فتح الـ Map Picker لإضافة موقع جديد
  const openMapPickerForNewLocation = (dayIndex) => {
    setEditingDayIndex(dayIndex);
    setEditingLocationIndex(null); // null يعني إضافة جديد
    setMapPickerOpen(true);
  };

  // فتح الـ Map Picker لتعديل موقع موجود
  const openMapPickerForEdit = (dayIndex, locationIndex) => {
    setEditingDayIndex(dayIndex);
    setEditingLocationIndex(locationIndex);
    setMapPickerOpen(true);
  };

  // الحصول على الموقع الحالي للتعديل
  const getCurrentLocationForEdit = () => {
    if (editingLocationIndex !== null && editingDayIndex !== null) {
      return formData.days[editingDayIndex]?.locations[editingLocationIndex];
    }
    return null;
  };

  // تأكيد اختيار الموقع من الخريطة
  const handleMapConfirm = (locationData) => {
    const updatedDays = [...formData.days];

    if (!updatedDays[editingDayIndex].locations) {
      updatedDays[editingDayIndex].locations = [];
    }

    if (editingLocationIndex !== null) {
      // تعديل موقع موجود
      updatedDays[editingDayIndex].locations[editingLocationIndex] =
        locationData;
      message.success("Location updated successfully!");
    } else {
      // إضافة موقع جديد
      updatedDays[editingDayIndex].locations.push(locationData);
      message.success("Location added successfully!");
    }

    setFormData((prev) => ({ ...prev, days: updatedDays }));
    setMapPickerOpen(false);
    setEditingLocationIndex(null);
    setEditingDayIndex(null);
  };

  // حذف موقع
  const removeLocation = (dayIndex, locationIndex) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].locations = updatedDays[dayIndex].locations.filter(
      (_, i) => i !== locationIndex
    );
    setFormData((prev) => ({ ...prev, days: updatedDays }));
    message.success("Location removed!");
  };

  // ============ Gallery Functions ============
  const handleGallerySelectionChange = (selectedImageIds) => {
    setFormData((prev) => ({ ...prev, gallary: selectedImageIds }));
  };

  const handleExtraImagesChange = (imageUrls) => {
    setFormData((prev) => ({ ...prev, extra_images: imageUrls }));
  };

  // ============ API Preparation ============
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
      extra_images: Array.isArray(data.extra_images)
        ? data.extra_images.join("**")
        : data.extra_images,
    };
  };

  // ============ Submit Handler ============
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const apiData = prepareDataForAPI(formData);
      const { features, days, images, ...tourData } = apiData;

      console.log("Step 1: Creating tour with data:", tourData);

      // ========== Step 1: Create Tour ==========
      const tourResponse = await axios.post(
        `${base_url}/admin/tours/add_tour.php`,
        tourData
      );

      console.log("Tour creation response:", tourResponse.data);

      if (tourResponse.data.status !== "success") {
        console.error("Tour creation failed:", tourResponse.data);
        message.error(
          `Failed to create tour: ${tourResponse.data.message || "Unknown error"}`
        );
        return;
      }

      // Extract tour ID
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

      message.success("Tour created successfully!");

      // ========== Step 2: Create Days ==========
      if (formData.days && formData.days.length > 0) {
        console.log("Step 2: Creating days for tour ID:", tourId);

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
            isTourguide: day.isTourguide || 0,
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
                `Day ${index + 1} creation failed: ${dayResponse.data.message || "Unknown error"}`
              );
              continue;
            }

            message.success(`Day ${index + 1} created successfully!`);

            // Extract itinerary_id
            let itineraryId = null;
            if (dayResponse.data.itinerary_id) {
              itineraryId = dayResponse.data.itinerary_id;
            } else if (dayResponse.data.day_id) {
              itineraryId = dayResponse.data.day_id;
            } else if (dayResponse.data.id) {
              itineraryId = dayResponse.data.id;
            } else if (
              dayResponse.data.message &&
              typeof dayResponse.data.message === "object"
            ) {
              itineraryId =
                dayResponse.data.message.itinerary_id ||
                dayResponse.data.message.day_id ||
                dayResponse.data.message.id;
            } else if (dayResponse.data.data) {
              itineraryId =
                dayResponse.data.data.itinerary_id ||
                dayResponse.data.data.day_id ||
                dayResponse.data.data.id;
            }

            console.log(
              `Extracted itinerary ID for day ${index + 1}:`,
              itineraryId
            );

            // ========== Step 3: Create Locations ==========
            if (itineraryId && day.locations && day.locations.length > 0) {
              console.log(
                `Step 3: Creating ${day.locations.length} locations for day ${index + 1}`
              );

              for (const [locIndex, location] of day.locations.entries()) {
                if (!location.latitude || !location.longitude) {
                  continue;
                }

                const locationData = {
                  tour_id: tourId,
                  itinerary_id: itineraryId,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  description: location.description || "",
                };

                console.log(
                  `Creating location ${locIndex + 1} for day ${index + 1}:`,
                  locationData
                );

                try {
                  const locationResponse = await axios.post(
                    `${base_url}/admin/tours/map/add_map_locations.php`,
                    locationData
                  );

                  console.log(
                    `Location ${locIndex + 1} creation response:`,
                    locationResponse.data
                  );

                  if (locationResponse.data.status === "success") {
                    message.success(
                      `Location ${locIndex + 1} for Day ${index + 1} created!`
                    );
                  } else {
                    message.warning(
                      `Location ${locIndex + 1} for Day ${index + 1} failed`
                    );
                  }
                } catch (locationError) {
                  console.error(
                    `Error creating location ${locIndex + 1}:`,
                    locationError
                  );
                  message.warning(
                    `Failed to create location ${locIndex + 1} for Day ${index + 1}`
                  );
                }
              }
            }
          } catch (dayError) {
            console.error(`Error creating day ${index + 1}:`, dayError);
            message.warning(
              `Failed to create day ${index + 1}: ${dayError.message}`
            );
          }
        }
      }

      message.success("Tour with all days and locations created successfully!");
      navigate("/tours");
    } catch (error) {
      console.error("Error creating tour:", error);
      message.error(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============ Render Functions ============
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
          placeholder="Add highlights (press Enter to add each one)"
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
        selectedImages={formData.gallary}
        onSelectionChange={handleGallerySelectionChange}
        extraImages={formData.extra_images}
        onExtraImagesChange={handleExtraImagesChange}
      />
    </div>
  );

  const renderImagesTab = () => (
    <TourImages rowData={formData} setRowData={setFormData} />
  );

  // ============ Render Days Tab with Map Picker ============
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
            {day.locations && day.locations.length > 0 && (
              <Chip
                size="small"
                label={day.locations.length}
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

          {/* ============ Map Locations Section with Map Picker ============ */}
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
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">
                                Location {locIndex + 1}
                              </span>
                              <Chip
                                size="small"
                                label={`${parseFloat(location.latitude).toFixed(4)}, ${parseFloat(location.longitude).toFixed(4)}`}
                                variant="outlined"
                                sx={{ fontSize: 10 }}
                              />
                            </div>
                            {location.description && (
                              <p className="text-gray-600 text-sm">
                                {location.description}
                              </p>
                            )}
                            <a
                              href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
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
                  Click "Add from Map" to select locations on the map
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

      {formData.days.length === 0 && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
          <FaPlus className="text-4xl mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No days added yet</p>
          <p className="text-sm mb-4">
            Click "Add Day" to start building your tour itinerary
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
            {loading ? "Creating..." : "Create Tour"}
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

export default CreateTourLayout;
