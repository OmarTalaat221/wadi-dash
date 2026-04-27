import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Tabs from "../../../components/Tabs";
import TourImages from "../../../components/tours-page/tour-images";
import GallerySelector from "../../../components/tours-page/GallerySelector";
import MapLocationPicker from "../../../components/tours-page/MapLocationPicker";
import TourAttachments from "../../../components/tours-page/TourAttachments";
import JoditEditor from "jodit-react";
import {
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
import { Select, message } from "antd";
import { MdDelete, MdLocationOn, MdEdit } from "react-icons/md";
import { FaEye, FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import { FiMap } from "react-icons/fi";
import { base_url } from "../../../utils/base_url";
import editorConfig from "../../../data/joditConfig";

function CreateTourLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cars, setCars] = useState([]);
  const [activities, setActivities] = useState([]);

  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [editingLocationIndex, setEditingLocationIndex] = useState(null);
  const [editingDayIndex, setEditingDayIndex] = useState(null);

  const [formData, setFormData] = useState({
    country_id: "",
    title: "",
    subtitle: "",
    description: "",
    driver_price: "",
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
    attachments: [],
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
      message.error("Failed to load selection data");
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

  const handleMapConfirm = (locationData) => {
    const updatedDays = [...formData.days];
    if (!updatedDays[editingDayIndex].locations) {
      updatedDays[editingDayIndex].locations = [];
    }
    if (editingLocationIndex !== null) {
      updatedDays[editingDayIndex].locations[editingLocationIndex] =
        locationData;
      message.success("Location updated successfully!");
    } else {
      updatedDays[editingDayIndex].locations.push(locationData);
      message.success("Location added successfully!");
    }
    setFormData((prev) => ({ ...prev, days: updatedDays }));
    setMapPickerOpen(false);
    setEditingLocationIndex(null);
    setEditingDayIndex(null);
  };

  const removeLocation = (dayIndex, locationIndex) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].locations = updatedDays[dayIndex].locations.filter(
      (_, i) => i !== locationIndex
    );
    setFormData((prev) => ({ ...prev, days: updatedDays }));
    message.success("Location removed!");
  };

  // ============ Gallery ============
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
      // ✅ Changed: send as array instead of joined string
      attachments: Array.isArray(data.attachments)
        ? data.attachments
            .filter((a) => a.status === "done" && a.url)
            .map((a) => a.url)
        : [],
    };
  };

  // ============ Submit ============
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any file is still uploading
    const stillUploading = formData.attachments.some(
      (a) => a.status === "uploading"
    );
    if (stillUploading) {
      message.warning("Please wait for all files to finish uploading");
      return;
    }

    try {
      setLoading(true);

      const apiData = prepareDataForAPI(formData);
      const { features, days, images, attachments: _, ...tourData } = apiData;

      // Also send attachments field
      tourData.attachments = apiData.attachments;

      console.log("Step 1: Creating tour:", tourData);

      const tourResponse = await axios.post(
        `${base_url}/admin/tours/add_tour.php`,
        tourData
      );

      if (tourResponse.data.status !== "success") {
        message.error(
          `Failed to create tour: ${tourResponse.data.message || "Unknown error"}`
        );
        return;
      }

      let tourId =
        tourResponse.data.tour_id ||
        tourResponse.data.message?.tour_id ||
        tourResponse.data.data?.id;

      if (!tourId) {
        message.error("Tour created but failed to get tour ID.");
        return;
      }

      message.success("Tour created successfully!");

      // Step 2: Days
      if (formData.days && formData.days.length > 0) {
        for (const [index, day] of formData.days.entries()) {
          const dayData = {
            tour_id: tourId,
            day: day.day,
            title: day.title,
            guide_price: day.guide_price,
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
            const dayResponse = await axios.post(
              `${base_url}/admin/tours/days/add_tour_day.php`,
              dayData
            );

            if (dayResponse.data.status !== "success") {
              message.warning(`Day ${index + 1} failed`);
              continue;
            }

            let itineraryId =
              dayResponse.data.itinerary_id ||
              dayResponse.data.day_id ||
              dayResponse.data.id ||
              dayResponse.data.message?.itinerary_id;

            // Step 3: Locations
            if (itineraryId && day.locations && day.locations.length > 0) {
              for (const [locIndex, location] of day.locations.entries()) {
                if (!location.latitude || !location.longitude) continue;

                try {
                  await axios.post(
                    `${base_url}/admin/tours/map/add_map_locations.php`,
                    {
                      tour_id: tourId,
                      itinerary_id: itineraryId,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      description: location.description || "",
                    }
                  );
                } catch (locError) {
                  console.error(
                    `Error adding location ${locIndex + 1}:`,
                    locError
                  );
                }
              }
            }
          } catch (dayError) {
            console.error(`Error creating day ${index + 1}:`, dayError);
          }
        }
      }

      message.success("Tour with all days and locations created!");
      navigate("/tours");
    } catch (error) {
      console.error("Error:", error);
      message.error(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============ Tab Renders ============
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
        label="Driver Price"
        name="driver_price"
        type="number"
        value={formData.driver_price}
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

  const renderAttachmentsTab = () => (
    <TourAttachments formData={formData} setFormData={setFormData} />
  );

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

          <div className="grid grid-cols-2 gap-4">
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
            <TextField
              fullWidth
              label="Guide Price"
              name="guide_price"
              type="number"
              value={formData.days[activeDay]?.guide_price || ""}
              onChange={(e) =>
                handleDayChange(
                  activeDay,
                  "guide_price",
                  Number(e.target.value)
                )
              }
              onWheel={(e) => e.target.blur()}
              disabled={formData.days[activeDay]?.isTourguide == 0}
            />
          </div>

          {/* Map Locations */}
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

            {formData.days[activeDay]?.locations?.length > 0 ? (
              <div className="space-y-3">
                {formData.days[activeDay].locations.map(
                  (location, locIndex) => (
                    <div
                      key={locIndex}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-red-100 p-2 rounded-full">
                            <MdLocationOn className="text-red-500 text-xl" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">
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
                              <FaEye size={10} /> View on Google Maps
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Tooltip title="Edit">
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
                          <Tooltip title="Remove">
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
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed">
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

          <Divider />

          <FormControl fullWidth>
            <label className="block mb-1 font-medium">Select Hotels</label>
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Select hotels"
              value={formData.days[activeDay]?.hotel_id || []}
              onChange={(value) =>
                handleDayChange(activeDay, "hotel_id", value)
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
              placeholder="Select cars"
              value={formData.days[activeDay]?.car_id || []}
              onChange={(value) => handleDayChange(activeDay, "car_id", value)}
              options={cars.map((car) => ({
                value: car.id,
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
              placeholder="Select activities"
              value={formData.days[activeDay]?.activity_id || []}
              onChange={(value) =>
                handleDayChange(activeDay, "activity_id", value)
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
      case "Attachments":
        return renderAttachmentsTab();
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
          tabs={[
            "General",
            "Pricing",
            "Features",
            "Images",
            "Attachments",
            "Days",
          ]}
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
            disabled={
              loading ||
              formData.attachments.some((a) => a.status === "uploading")
            }
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Creating..." : "Create Tour"}
          </Button>
        </div>
      </form>

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
