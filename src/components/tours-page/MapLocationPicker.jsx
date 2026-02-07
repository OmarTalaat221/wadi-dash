// components/tours-page/MapLocationPicker.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { MdClose, MdMyLocation, MdSearch, MdLocationOn } from "react-icons/md";
import { message } from "antd";

// Leaflet imports
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapLocationPicker = ({ open, onClose, onConfirm, initialLocation }) => {
  const [position, setPosition] = useState(null);
  const [description, setDescription] = useState("");
  const [mapCenter] = useState([25.276987, 55.296249]); // Dubai
  const [geoLocationError, setGeoLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  // استخدام useRef للاحتفاظ بـ marker reference
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Initialize map when dialog opens
  useEffect(() => {
    if (!open) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (mapContainerRef.current && !mapInstance) {
        // Initialize map
        const map = L.map(mapContainerRef.current).setView(
          initialLocation
            ? [
                parseFloat(initialLocation.latitude),
                parseFloat(initialLocation.longitude),
              ]
            : mapCenter,
          13
        );

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Handle map click - SINGLE MARKER ONLY
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          updateMarker(map, [lat, lng]);
          setPosition([lat, lng]);
        });

        setMapInstance(map);

        // Set initial marker if editing
        if (initialLocation) {
          const lat = parseFloat(initialLocation.latitude);
          const lng = parseFloat(initialLocation.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            updateMarker(map, [lat, lng]);
            setPosition([lat, lng]);
            setDescription(initialLocation.description || "");
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [open]);

  // Cleanup map on close
  useEffect(() => {
    if (!open && mapInstance) {
      // Remove marker before removing map
      if (markerRef.current) {
        mapInstance.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      mapInstance.remove();
      setMapInstance(null);
    }
  }, [open, mapInstance]);

  // Update marker position - SINGLE MARKER ONLY (FIXED)
  const updateMarker = (map, pos) => {
    // Remove existing marker if any
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    // Add new marker and store reference
    const newMarker = L.marker(pos).addTo(map);
    markerRef.current = newMarker;

    // Center map on new marker with smooth animation
    map.flyTo(pos, map.getZoom());
  };

  // Search location
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning("Please enter a location to search");
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setSearchResults(data);
        setShowResults(true);
      } else {
        message.warning("No results found");
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      message.error("Failed to search location");
    } finally {
      setSearching(false);
    }
  };

  // Select search result
  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (mapInstance) {
      updateMarker(mapInstance, [lat, lng]);
      mapInstance.setView([lat, lng], 15);
    }

    setPosition([lat, lng]);
    setShowResults(false);
    setSearchQuery("");

    if (!description) {
      setDescription(result.display_name.substring(0, 100));
    }

    message.success("Location selected");
  };

  // Get current location
  const getCurrentLocation = () => {
    setGeoLocationError(null);

    if (!("geolocation" in navigator)) {
      setGeoLocationError("Geolocation is not supported");
      message.error("Geolocation is not supported");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (mapInstance) {
          updateMarker(mapInstance, [lat, lng]);
          mapInstance.setView([lat, lng], 15);
        }

        setPosition([lat, lng]);
        message.success("Current location detected");
        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        let errorMessage = "Unable to get location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable it in browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        setGeoLocationError(errorMessage);
        message.error(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Confirm selection
  const handleConfirm = () => {
    if (!position) {
      message.warning("Please select a location on the map");
      return;
    }

    onConfirm({
      latitude: position[0].toString(),
      longitude: position[1].toString(),
      description: description.trim(),
    });

    handleClose();
  };

  // Close dialog
  const handleClose = () => {
    setPosition(null);
    setDescription("");
    setGeoLocationError(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);

    // Clean up marker
    if (mapInstance && markerRef.current) {
      mapInstance.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    if (mapInstance) {
      mapInstance.remove();
      setMapInstance(null);
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: "90vh" } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {initialLocation ? "Edit Location" : "Select Location"}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <MdClose />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, position: "relative" }}>
        {/* Instructions Alert */}
        <Alert
          severity="info"
          sx={{
            borderRadius: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <div className="flex items-center gap-2">
            <MdLocationOn />
            Click anywhere on the map to place a single location marker
          </div>
        </Alert>

        <Box
          sx={{
            height: "calc(100% - 48px)",
            width: "100%",
            position: "relative",
          }}
        >
          {/* Map Container */}
          <div
            ref={mapContainerRef}
            style={{ height: "100%", width: "100%" }}
          />

          {/* Search Box - BOTTOM LEFT */}
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              bottom: position ? 140 : 20, // Adjust position if location info is shown
              left: 10,
              zIndex: 1000,
              p: 1,
              backgroundColor: "white",
              maxWidth: "400px",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(false);
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                sx={{ minWidth: "250px" }}
                disabled={searching}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleSearch}
                disabled={searching}
                startIcon={
                  searching ? <CircularProgress size={16} /> : <MdSearch />
                }
              >
                Search
              </Button>
            </Box>
          </Paper>

          {/* Search Results - ABOVE SEARCH BOX */}
          {showResults && searchResults.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                bottom: position ? 190 : 70, // Above search box
                left: 10,
                zIndex: 999,
                maxWidth: "400px",
                maxHeight: "200px",
                overflow: "auto",
                backgroundColor: "white",
              }}
            >
              {searchResults.map((result, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.5,
                    cursor: "pointer",
                    borderBottom:
                      index < searchResults.length - 1
                        ? "1px solid #e0e0e0"
                        : "none",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                  onClick={() => handleSelectResult(result)}
                >
                  <MdLocationOn
                    style={{ flexShrink: 0, marginTop: "2px", color: "#666" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                    {result.display_name}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}

          {/* Current Location Button - TOP RIGHT */}
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1000,
              p: 0.5,
            }}
          >
            <IconButton
              onClick={getCurrentLocation}
              color="primary"
              title="Get My Current Location"
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <CircularProgress size={24} />
              ) : (
                <MdMyLocation />
              )}
            </IconButton>
          </Paper>

          {/* Geolocation Error */}
          {geoLocationError && (
            <Alert
              severity="warning"
              onClose={() => setGeoLocationError(null)}
              sx={{
                position: "absolute",
                top: 60,
                right: 10,
                zIndex: 1000,
                maxWidth: "300px",
              }}
            >
              {geoLocationError}
            </Alert>
          )}

          {/* Selected Location Info - BOTTOM */}
          {position && (
            <Paper
              elevation={4}
              sx={{
                position: "absolute",
                bottom: 10,
                left: 10,
                right: 10,
                zIndex: 998,
                p: 2,
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                border: "2px solid #1976d2",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <MdLocationOn style={{ color: "#1976d2", fontSize: "20px" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Selected Location:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Location Description *"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Hotel pickup point, Meeting location..."
                  multiline
                  rows={2}
                  inputProps={{ maxLength: 200 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  href={`https://www.google.com/maps?q=${position[0]},${position[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ minWidth: "80px", height: "40px" }}
                >
                  View
                </Button>
              </Box>
            </Paper>
          )}

          {/* Visual Indicator for Single Location Mode */}
          {/* <Paper
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 1000,
              px: 2,
              py: 1,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: position ? "#4caf50" : "#ff9800",
                animation: position ? "pulse 2s infinite" : "none",
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {position ? "1 Location Selected" : "No Location Selected"}
            </Typography>
          </Paper> */}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!position}
          startIcon={<MdLocationOn />}
        >
          {initialLocation ? "Update Location" : "Add Location"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapLocationPicker;
