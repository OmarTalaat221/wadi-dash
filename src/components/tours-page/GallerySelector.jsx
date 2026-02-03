// components/tours-page/GallerySelector.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  Box,
  IconButton,
  CircularProgress,
  Chip,
  LinearProgress,
} from "@mui/material";
import { message } from "antd";
import {
  FaEye,
  FaImages,
  FaTimes,
  FaCheck,
  FaCloudUploadAlt,
  FaTrash,
} from "react-icons/fa";
import { MdClose, MdCheckCircle, MdAddPhotoAlternate } from "react-icons/md";
import axios from "axios";
import { base_url } from "../../utils/base_url";
import { uploadImageToServer } from "../../hooks/uploadImage";

const GallerySelector = ({
  selectedImages,
  onSelectionChange,
  extraImages = [],
  onExtraImagesChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Extra images state
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Sync selectedIds with selectedImages prop
  useEffect(() => {
    console.log("GallerySelector - selectedImages prop:", selectedImages);

    if (Array.isArray(selectedImages)) {
      const normalizedIds = selectedImages.map((item) => {
        if (typeof item === "object" && item !== null && item.id) {
          return String(item.id);
        }
        return String(item);
      });

      console.log("GallerySelector - normalized IDs:", normalizedIds);
      setSelectedIds(normalizedIds);
    } else {
      setSelectedIds([]);
    }
  }, [selectedImages]);

  // Sync uploadedImages with extraImages prop
  useEffect(() => {
    console.log("GallerySelector - extraImages prop:", extraImages);

    if (Array.isArray(extraImages) && extraImages.length > 0) {
      // Handle both string array and already parsed array
      const images = extraImages.map((img, index) => {
        if (typeof img === "object" && img.url) {
          return img;
        }
        return {
          id: `extra-${index}-${Date.now()}`,
          url: img,
          name: `Extra Image ${index + 1}`,
        };
      });
      setUploadedImages(images);
    } else {
      setUploadedImages([]);
    }
  }, [extraImages]);

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/gallary/select_gallary.php`
      );

      console.log("Gallery API response:", response.data);

      if (response.data && response.data.status === "success") {
        const visibleImages = response.data.message.filter(
          (img) => img.hidden === "0"
        );

        console.log("Visible gallery images:", visibleImages);
        setGalleryImages(visibleImages);
      } else {
        message.error("Failed to fetch gallery images");
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      message.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (Array.isArray(selectedImages)) {
      const normalizedIds = selectedImages.map((item) => {
        if (typeof item === "object" && item !== null && item.id) {
          return String(item.id);
        }
        return String(item);
      });
      setSelectedIds(normalizedIds);
    }
  };

  const handleImageSelect = (imageId, checked) => {
    const imageIdStr = String(imageId);
    let newSelection;

    if (checked) {
      newSelection = [...selectedIds, imageIdStr];
    } else {
      newSelection = selectedIds.filter((id) => id !== imageIdStr);
    }

    console.log("Image selection changed:", {
      imageId: imageIdStr,
      checked,
      newSelection,
    });
    setSelectedIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === galleryImages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(galleryImages.map((img) => String(img.id)));
    }
  };

  const handleSaveSelection = () => {
    console.log("Saving selection:", selectedIds);
    onSelectionChange(selectedIds);
    setModalOpen(false);
    message.success(
      `Selected ${selectedIds.length} image${
        selectedIds.length !== 1 ? "s" : ""
      }`
    );
  };

  const handlePreview = (image) => {
    setCurrentPreview(image);
    setPreviewModalOpen(true);
  };

  const handleRemoveImage = (imageIdToRemove) => {
    const imageIdStr = String(imageIdToRemove);
    const newSelection = selectedIds.filter((id) => id !== imageIdStr);

    console.log("Removing image:", imageIdStr, "New selection:", newSelection);

    setSelectedIds(newSelection);
    onSelectionChange(newSelection);
    message.success("Image removed from selection");
  };

  // ============ Extra Images Upload Functions ============

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      message.error("Only image files (JPEG, PNG, GIF, WebP) are allowed");
      return;
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      message.error("Each image must be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const newUploadedImages = [...uploadedImages];
    const totalFiles = files.length;
    let uploadedCount = 0;

    for (const file of files) {
      try {
        console.log("Uploading file:", file.name);

        const imageUrl = await uploadImageToServer(file);

        console.log("Upload successful:", imageUrl);

        const newImage = {
          id: `extra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: imageUrl,
          name: file.name,
        };

        newUploadedImages.push(newImage);
        uploadedCount++;
        setUploadProgress((uploadedCount / totalFiles) * 100);
      } catch (error) {
        console.error("Error uploading file:", file.name, error);
        message.error(`Failed to upload ${file.name}`);
      }
    }

    setUploadedImages(newUploadedImages);

    // Notify parent component
    const imageUrls = newUploadedImages.map((img) => img.url);
    onExtraImagesChange?.(imageUrls);

    setUploading(false);
    setUploadProgress(0);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (uploadedCount > 0) {
      message.success(`Successfully uploaded ${uploadedCount} image(s)`);
    }
  };

  const handleRemoveUploadedImage = (imageId) => {
    const newImages = uploadedImages.filter((img) => img.id !== imageId);
    setUploadedImages(newImages);

    // Notify parent component
    const imageUrls = newImages.map((img) => img.url);
    onExtraImagesChange?.(imageUrls);

    message.success("Image removed");
  };

  const handlePreviewUploadedImage = (image) => {
    setCurrentPreview({
      id: image.id,
      image: image.url,
      title: image.name,
      created_at: new Date().toISOString(),
    });
    setPreviewModalOpen(true);
  };

  const getSelectedImagesInfo = () => {
    console.log("Getting selected images info...");
    console.log("selectedIds:", selectedIds);
    console.log("galleryImages:", galleryImages);

    if (!selectedIds || selectedIds.length === 0) {
      return { count: 0, previews: [] };
    }

    const previews = galleryImages
      .filter((img) => {
        const imgIdStr = String(img.id);
        const isSelected = selectedIds.includes(imgIdStr);
        return isSelected;
      })
      .slice(0, 4);

    console.log("Selected previews:", previews);

    return {
      count: selectedIds.length,
      previews: previews,
    };
  };

  const selectedInfo = getSelectedImagesInfo();

  return (
    <div className="w-full space-y-6">
      {/* ============ Gallery Selection Section ============ */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          <FaImages className="inline mr-2" />
          Gallery Images
        </label>

        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedInfo.count} image{selectedInfo.count !== 1 ? "s" : ""}{" "}
                selected from gallery
              </span>
              {selectedInfo.count > 0 && (
                <Chip
                  label={selectedInfo.count}
                  size="small"
                  color="primary"
                  sx={{ height: "20px", fontSize: "11px" }}
                />
              )}
            </div>
            <Button
              variant="outlined"
              startIcon={<FaImages />}
              onClick={handleOpenModal}
              size="small"
              sx={{
                textTransform: "none",
                borderColor: "#d1d5db",
                color: "#374151",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              Browse Gallery
            </Button>
          </div>

          {selectedInfo.count > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedInfo.previews.map((img) => (
                <div key={img.id} className="relative group">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={img.image}
                      alt={img.title || "Gallery image"}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handlePreview(img)}
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(String(img.id));
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                    >
                      <FaTimes size={10} />
                    </button>

                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheck size={8} className="text-white" />
                    </div>
                  </div>
                </div>
              ))}

              {selectedInfo.count > 4 && (
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex flex-col items-center justify-center text-sm font-medium text-gray-700 border border-gray-300 shadow-sm">
                  <span className="text-lg font-bold">
                    +{selectedInfo.count - 4}
                  </span>
                  <span className="text-xs">more</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
              <FaImages className="mx-auto text-gray-300 mb-2" size={28} />
              <Typography variant="body2" className="text-gray-500">
                No gallery images selected
              </Typography>
              <Typography
                variant="caption"
                className="text-gray-400 block mt-1"
              >
                Click "Browse Gallery" to select images
              </Typography>
            </div>
          )}
        </div>
      </div>

      {/* ============ Extra Images Upload Section ============ */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          <MdAddPhotoAlternate className="inline mr-2" />
          Extra Images (Upload)
        </label>

        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
              uploading
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
            onClick={!uploading ? handleUploadClick : undefined}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
            />

            {uploading ? (
              <div className="space-y-3">
                <CircularProgress size={40} />
                <Typography variant="body2" className="text-blue-600">
                  Uploading images...
                </Typography>
                <Box sx={{ width: "100%", maxWidth: 300, mx: "auto" }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                  />
                </Box>
                <Typography variant="caption" className="text-gray-500">
                  {Math.round(uploadProgress)}% complete
                </Typography>
              </div>
            ) : (
              <>
                <FaCloudUploadAlt
                  className="mx-auto text-gray-400 mb-3"
                  size={40}
                />
                <Typography
                  variant="body1"
                  className="text-gray-700 font-medium mb-1"
                >
                  Click to upload images
                </Typography>
                <Typography variant="caption" className="text-gray-500 block">
                  JPEG, PNG, GIF, WebP up to 5MB each
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<FaCloudUploadAlt />}
                  size="small"
                  sx={{
                    mt: 2,
                    textTransform: "none",
                    borderColor: "#3b82f6",
                    color: "#3b82f6",
                    "&:hover": {
                      borderColor: "#2563eb",
                      backgroundColor: "#eff6ff",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadClick();
                  }}
                >
                  Select Files
                </Button>
              </>
            )}
          </div>

          {/* Uploaded Images Preview */}
          {uploadedImages.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <Typography variant="body2" className="text-gray-600">
                  {uploadedImages.length} extra image
                  {uploadedImages.length !== 1 ? "s" : ""} uploaded
                </Typography>
                <Chip
                  label={uploadedImages.length}
                  size="small"
                  color="success"
                  sx={{ height: "20px", fontSize: "11px" }}
                />
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {uploadedImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="relative aspect-square rounded-md overflow-hidden border border-gray-200 shadow-sm">
                      <img
                        src={img.url}
                        alt={img.name || "Uploaded image"}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handlePreviewUploadedImage(img)}
                      />

                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveUploadedImage(img.id);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      >
                        <FaTimes size={10} />
                      </button>

                      {/* Upload indicator */}
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <FaCloudUploadAlt size={8} className="text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ Gallery Selection Modal ============ */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #e5e7eb", py: 2 }}>
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" className="font-semibold text-gray-900">
                Select Gallery Images
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                Choose images for your tour gallery
              </Typography>
            </div>
            <IconButton onClick={handleCloseModal} size="small">
              <MdClose />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <Chip
                label={`${selectedIds.length} selected`}
                color={selectedIds.length > 0 ? "primary" : "default"}
                size="small"
              />
              <span className="text-sm text-gray-600">
                of {galleryImages.length} total
              </span>
            </div>
            <Button
              variant="text"
              onClick={handleSelectAll}
              disabled={loading}
              size="small"
              sx={{
                textTransform: "none",
                color: "#4b5563",
                fontWeight: 500,
              }}
            >
              {selectedIds.length === galleryImages.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <CircularProgress size={40} />
              <Typography variant="body2" className="mt-3 text-gray-600">
                Loading gallery images...
              </Typography>
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="text-center py-16">
              <FaImages className="mx-auto text-gray-300 mb-3" size={48} />
              <Typography variant="h6" className="text-gray-600 mb-1">
                No gallery images available
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                Add images to the gallery first
              </Typography>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              <Grid container spacing={2}>
                {galleryImages.map((image) => {
                  const imageIdStr = String(image.id);
                  const isSelected = selectedIds.includes(imageIdStr);

                  return (
                    <Grid item xs={6} sm={4} md={3} key={image.id}>
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "ring-2 ring-blue-500 shadow-lg"
                            : "hover:shadow-md"
                        }`}
                        sx={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                        }}
                        onClick={() => handleImageSelect(image.id, !isSelected)}
                      >
                        <div className="relative">
                          <CardMedia
                            component="img"
                            height="140"
                            image={image.image}
                            alt={image.title || "Gallery image"}
                            className="h-32 object-cover"
                          />

                          <div className="absolute top-2 left-2">
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleImageSelect(image.id, e.target.checked);
                              }}
                              sx={{
                                color: "white",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                padding: "4px",
                                borderRadius: "4px",
                                "&.Mui-checked": {
                                  color: "white",
                                  backgroundColor: "#3b82f6",
                                },
                              }}
                              size="small"
                            />
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <div className="bg-green-500 text-white rounded-full p-1">
                                <MdCheckCircle size={16} />
                              </div>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-2">
                          <Typography
                            variant="body2"
                            className="text-gray-700 truncate text-sm font-medium"
                            title={image.title || "Untitled"}
                          >
                            {image.title || "Untitled"}
                          </Typography>
                          <div className="flex items-center justify-between mt-1">
                            <Typography
                              variant="caption"
                              className="text-gray-400"
                            >
                              ID: {image.id}
                            </Typography>

                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(image);
                              }}
                              className="bg-white hover:bg-gray-50"
                              size="small"
                              sx={{
                                width: 28,
                                height: 28,
                              }}
                            >
                              <FaEye size={14} />
                            </IconButton>
                          </div>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid #e5e7eb", p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseModal}
            sx={{
              textTransform: "none",
              color: "#6b7280",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSelection}
            disabled={loading}
            startIcon={<FaCheck />}
            sx={{
              textTransform: "none",
              backgroundColor: "#3b82f6",
              "&:hover": {
                backgroundColor: "#2563eb",
              },
            }}
          >
            Save Selection ({selectedIds.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============ Preview Modal ============ */}
      <Dialog
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #e5e7eb", py: 2 }}>
          <div className="flex justify-between items-center">
            <Typography variant="h6" className="font-semibold text-gray-900">
              {currentPreview?.title || "Image Preview"}
            </Typography>
            <IconButton onClick={() => setPreviewModalOpen(false)} size="small">
              <MdClose />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {currentPreview && (
            <div>
              <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <img
                  src={currentPreview.image}
                  alt={currentPreview.title || "Preview"}
                  className="max-w-full max-h-[60vh] object-contain mx-auto rounded shadow-lg"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <Grid container spacing={2} className="text-sm">
                  <Grid item xs={6}>
                    <Typography
                      variant="caption"
                      className="text-gray-500 block mb-1"
                    >
                      Image ID
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-900 font-medium"
                    >
                      #{currentPreview.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="caption"
                      className="text-gray-500 block mb-1"
                    >
                      Created Date
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-900 font-medium"
                    >
                      {new Date(currentPreview.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      className="text-gray-500 block mb-1"
                    >
                      Title
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-900 font-medium"
                    >
                      {currentPreview.title || "No title provided"}
                    </Typography>
                  </Grid>
                </Grid>
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setPreviewModalOpen(false)}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#3b82f6",
              "&:hover": {
                backgroundColor: "#2563eb",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GallerySelector;
