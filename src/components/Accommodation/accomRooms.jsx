import {
  Box,
  Button,
  IconButton,
  FormControl,
  TextField,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Typography,
  Chip,
} from "@mui/material";
import {
  FaPlus,
  FaBed,
  FaChild,
  FaUser,
  FaDollarSign,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaSpinner,
} from "react-icons/fa";
import React, { useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { MdDelete, MdEdit, MdVisibilityOff, MdLink } from "react-icons/md";
import { uploadImageToServer } from "../../hooks/uploadImage";
import { message } from "antd";

const AccomRooms = ({ rowData, setRowData }) => {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    room_id: null,
    title: "",
    room_descreption: "",
    price: "",
    max_adults: "",
    max_children: "",
    hidden: 0,
    room_img: "",
  });

  // Upload states
  const [uploading, setUploading] = useState({});
  const imageInputRef = useRef(null);
  const urlInputRef = useRef(null);
  const imageRefs = useRef([]);

  // Card image slider state
  const [cardImageIndex, setCardImageIndex] = useState({});

  // ✅ Get hotel_id from rowData
  const hotelId = rowData?.id || rowData?.hotel_id || null;

  // Get images array from string or array
  const getImagesArray = (imageData) => {
    if (!imageData) return [];

    if (Array.isArray(imageData)) {
      return imageData.filter((img) => img);
    }

    if (typeof imageData === "string") {
      return imageData.split("//CAMP//").filter((img) => img);
    }

    if (typeof imageData === "object" && imageData.preview) {
      return [imageData.preview];
    }

    return [];
  };

  // Convert array to string
  const imagesToString = (imagesArray) => {
    if (!imagesArray) return "";

    if (typeof imagesArray === "string") {
      return imagesArray;
    }

    if (Array.isArray(imagesArray)) {
      const urls = imagesArray
        .map((img) => {
          if (typeof img === "string") return img;
          if (img && img.preview) return img.preview;
          if (img && img.value) return img.value;
          return "";
        })
        .filter((img) => img);

      return urls.join("//CAMP//");
    }

    return "";
  };

  // Helper function to convert hidden value to 0 or 1
  const toHiddenValue = (value) => {
    if (value === 1 || value === "1" || value === true) return 1;
    return 0;
  };

  // Form images array
  const formImagesArray = getImagesArray(formData.room_img);

  // Reset form data
  const resetForm = () => {
    setFormData({
      room_id: null,
      title: "",
      room_descreption: "",
      price: "",
      max_adults: "",
      max_children: "",
      hidden: 0,
      room_img: "",
    });
    setEditIndex(null);
  };

  // Open dialog for adding new room
  const handleOpenAdd = () => {
    resetForm();
    setOpen(true);
  };

  // Open dialog for editing existing room
  const handleOpenEdit = (index) => {
    const room = rowData.rooms[index];
    setFormData({
      room_id: room.id || room.room_id || null,
      title: room.title || "",
      room_descreption: room.room_descreption || "",
      price: room.price || "",
      max_adults: room.max_adults || "",
      max_children: room.max_children || "",
      hidden: toHiddenValue(room.hidden),
      room_img: imagesToString(room.room_img) || "",
    });
    setEditIndex(index);
    setOpen(true);
  };

  // Close dialog
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle image file upload
  const handleImageFilesChange = async (files) => {
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const uploadId = Date.now() + i;

      setUploading((prev) => ({ ...prev, [uploadId]: true }));

      try {
        message.loading(
          `Uploading image ${i + 1} of ${fileArray.length}...`,
          0
        );

        const uploadResult = await uploadImageToServer(file);

        if (uploadResult) {
          setFormData((prev) => {
            const currentImages = getImagesArray(prev.room_img);
            const updatedImages = [...currentImages, uploadResult];
            return {
              ...prev,
              room_img: imagesToString(updatedImages),
            };
          });

          message.destroy();
          message.success(`Image ${i + 1} uploaded successfully!`);
        } else {
          throw new Error(uploadResult?.error || "Upload failed");
        }
      } catch (error) {
        message.destroy();
        message.error(`Failed to upload image ${i + 1}: ${error.message}`);
        console.error("Upload error:", error);
      } finally {
        setUploading((prev) => {
          const newState = { ...prev };
          delete newState[uploadId];
          return newState;
        });
      }
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Handle add URL
  const handleAddUrlClick = () => {
    const url = urlInputRef.current?.value?.trim();

    if (!url) {
      message.warning("Please enter an image URL");
      return;
    }

    setFormData((prev) => {
      const currentImages = getImagesArray(prev.room_img);
      const updatedImages = [...currentImages, url];
      return {
        ...prev,
        room_img: imagesToString(updatedImages),
      };
    });

    message.success("Image URL added");
    if (urlInputRef.current) {
      urlInputRef.current.value = "";
    }
  };

  // Remove image from form
  const removeImage = (index) => {
    const imgRef = imageRefs.current[index];

    if (imgRef) {
      imgRef.classList.remove("zoomIn");
      imgRef.classList.add("zoomOut");

      setTimeout(() => {
        setFormData((prev) => {
          const currentImages = getImagesArray(prev.room_img);
          const updatedImages = currentImages.filter((_, i) => i !== index);
          return {
            ...prev,
            room_img: imagesToString(updatedImages),
          };
        });

        if (imgRef) {
          imgRef.classList.remove("zoomOut");
        }
      }, 300);
    } else {
      setFormData((prev) => {
        const currentImages = getImagesArray(prev.room_img);
        const updatedImages = currentImages.filter((_, i) => i !== index);
        return {
          ...prev,
          room_img: imagesToString(updatedImages),
        };
      });
    }
  };

  // Move image to first position (set as main)
  const moveToFirst = (index) => {
    setFormData((prev) => {
      const currentImages = getImagesArray(prev.room_img);
      const updatedImages = [...currentImages];
      const [movedImage] = updatedImages.splice(index, 1);
      updatedImages.unshift(movedImage);
      return {
        ...prev,
        room_img: imagesToString(updatedImages),
      };
    });

    message.success("Image set as main image!");
  };

  // ✅ Add room API call (when hotel_id exists)
  const addRoomAPI = async (roomData) => {
    try {
      const response = await fetch(
        "https://camp-coding.tech/wady-way/admin/hotels/add_hotel_rooms.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roomData),
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Add room API error:", error);
      throw error;
    }
  };

  // ✅ Edit room API call
  const editRoomAPI = async (roomData) => {
    try {
      const response = await fetch(
        "https://camp-coding.tech/wady-way/admin/hotels/edit_room.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roomData),
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Edit room API error:", error);
      throw error;
    }
  };

  // ✅ Delete room API call
  const deleteRoomAPI = async (room_id) => {
    try {
      const response = await fetch(
        "https://camp-coding.tech/wady-way/admin/hotels/delete_room.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ room_id }),
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Delete room API error:", error);
      throw error;
    }
  };

  // Submit form (Add or Edit)
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      message.warning("Please enter a room title");
      return;
    }

    // Prepare room data
    const roomData = {
      title: formData.title,
      room_descreption: formData.room_descreption,
      price: formData.price,
      max_adults: formData.max_adults,
      max_children: formData.max_children,
      hidden: formData.hidden,
      room_img: formData.room_img,
    };

    // ✅ Case 1: Editing existing room (has room_id)
    if (formData.room_id) {
      setLoading(true);
      try {
        const result = await editRoomAPI({
          room_id: formData.room_id,
          ...roomData,
        });

        if (result.status === "success") {
          // Update local state
          setRowData((prev) => ({
            ...prev,
            rooms: prev.rooms.map((room, index) =>
              index === editIndex
                ? {
                  ...roomData,
                  id: formData.room_id,
                  room_id: formData.room_id,
                }
                : room
            ),
          }));
          message.success("Room updated successfully!");
          handleClose();
        } else {
          message.error(result.message || "Failed to update room");
        }
      } catch (error) {
        message.error("Failed to update room: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    // ✅ Case 2: Adding new room to existing hotel (has hotel_id but no room_id)
    else if (hotelId) {
      setLoading(true);
      try {
        const result = await addRoomAPI({
          hotel_id: hotelId,
          rooms: [roomData], // Send as array
        });

        if (result.status === "success") {
          // Get the inserted room ID if available
          const newRoomId =
            result.inserted_ids?.[0] || result.room_id || null;

          // Update local state with new room
          const newRoom = {
            ...roomData,
            id: newRoomId,
            room_id: newRoomId,
          };

          if (editIndex !== null) {
            // Editing a local room that now needs to be saved
            setRowData((prev) => ({
              ...prev,
              rooms: prev.rooms.map((room, index) =>
                index === editIndex ? newRoom : room
              ),
            }));
          } else {
            // Adding new room
            setRowData((prev) => ({
              ...prev,
              rooms: [...(prev.rooms || []), newRoom],
            }));
          }

          message.success("Room added successfully!");
          handleClose();
        } else {
          message.error(result.message || "Failed to add room");
        }
      } catch (error) {
        message.error("Failed to add room: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    // ✅ Case 3: New hotel (no hotel_id) - just add to local state
    else {
      if (editIndex !== null) {
        // Editing a new room that hasn't been saved to DB yet
        setRowData((prev) => ({
          ...prev,
          rooms: prev.rooms.map((room, index) =>
            index === editIndex ? roomData : room
          ),
        }));
        message.success("Room updated!");
      } else {
        // Adding a new room to local state
        setRowData((prev) => ({
          ...prev,
          rooms: [...(prev.rooms || []), roomData],
        }));
        message.success("Room added!");
      }
      handleClose();
    }
  };

  // Delete room
  const handleDeleteRoom = async (indexToRemove) => {
    const room = rowData.rooms[indexToRemove];
    const roomId = room.id || room.room_id;

    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    // ✅ If room has room_id, call delete API
    if (roomId) {
      setLoading(true);
      try {
        const result = await deleteRoomAPI(roomId);

        if (result.status === "success") {
          setRowData((prev) => ({
            ...prev,
            rooms: prev.rooms.filter((_, i) => i !== indexToRemove),
          }));
          message.success("Room deleted successfully!");
        } else {
          message.error(result.message || "Failed to delete room");
        }
      } catch (error) {
        message.error("Failed to delete room: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      // ✅ New room not saved yet - just remove from local state
      setRowData((prev) => ({
        ...prev,
        rooms: prev.rooms.filter((_, i) => i !== indexToRemove),
      }));
      message.success("Room removed!");
    }
  };

  // Handle card image navigation
  const handleCardImageNav = (roomIndex, direction, totalImages) => {
    setCardImageIndex((prev) => {
      const currentIndex = prev[roomIndex] || 0;
      let newIndex;
      if (direction === "next") {
        newIndex = (currentIndex + 1) % totalImages;
      } else {
        newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
      }
      return { ...prev, [roomIndex]: newIndex };
    });
  };

  // Helper to check if room is hidden
  const isRoomHidden = (hidden) => {
    return hidden === 1 || hidden === "1" || hidden === true;
  };

  const isUploading = Object.keys(uploading).length > 0;

  return (
    <div className="border p-4 rounded">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-[18px] font-bold">
          Rooms
          {hotelId && (
            <Chip
              label={`Hotel ID: ${hotelId}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 2 }}
            />
          )}
        </div>
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={handleOpenAdd}
          disabled={loading}
        >
          Add Room
        </Button>
      </div>

      {/* Room Cards Grid */}
      {!rowData?.rooms || rowData.rooms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <FaBed className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No rooms added yet</p>
          <Button
            variant="outlined"
            startIcon={<FaPlus />}
            onClick={handleOpenAdd}
            sx={{ mt: 2 }}
            disabled={loading}
          >
            Add Your First Room
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rowData.rooms.map((room, index) => {
            const roomImages = getImagesArray(room.room_img);
            const currentImageIdx = cardImageIndex[index] || 0;
            const hasMultipleImages = roomImages.length > 1;
            const roomHidden = isRoomHidden(room.hidden);
            const hasRoomId = room.id || room.room_id;

            return (
              <Card
                key={index}
                className={`relative ${roomHidden ? "opacity-60" : ""}`}
                sx={{
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                {/* Hidden Badge */}
                {roomHidden && (
                  <Chip
                    icon={<MdVisibilityOff />}
                    label="Hidden"
                    size="small"
                    color="warning"
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      zIndex: 10,
                    }}
                  />
                )}

                {/* New Room Badge (not saved yet) */}
                {!hasRoomId && (
                  <Chip
                    label="New"
                    size="small"
                    color="info"
                    sx={{
                      position: "absolute",
                      top: roomHidden ? 40 : 8,
                      left: 8,
                      zIndex: 10,
                    }}
                  />
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEdit(index)}
                    disabled={loading}
                    sx={{
                      bgcolor: "white",
                      "&:hover": { bgcolor: "primary.light", color: "white" },
                    }}
                  >
                    <MdEdit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteRoom(index)}
                    disabled={loading}
                    sx={{
                      bgcolor: "white",
                      "&:hover": { bgcolor: "error.main", color: "white" },
                    }}
                  >
                    <MdDelete />
                  </IconButton>
                </div>

                {/* Image Slider */}
                <div className="relative h-[180px] bg-gray-100 overflow-hidden group">
                  {roomImages.length > 0 ? (
                    <>
                      <img
                        src={roomImages[currentImageIdx]}
                        alt={room.title}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-300"
                        onClick={() =>
                          window.open(roomImages[currentImageIdx], "_blank")
                        }
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300x200?text=Error";
                        }}
                      />

                      {/* Image Navigation Arrows */}
                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardImageNav(
                                index,
                                "prev",
                                roomImages.length
                              );
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                          >
                            <FaChevronLeft size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardImageNav(
                                index,
                                "next",
                                roomImages.length
                              );
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                          >
                            <FaChevronRight size={12} />
                          </button>
                        </>
                      )}

                      {/* Image Dots Indicator */}
                      {hasMultipleImages && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {roomImages.map((_, imgIdx) => (
                            <button
                              key={imgIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardImageIndex((prev) => ({
                                  ...prev,
                                  [index]: imgIdx,
                                }));
                              }}
                              className={`w-2 h-2 rounded-full transition-all ${imgIdx === currentImageIdx
                                ? "bg-white w-4"
                                : "bg-white/50"
                                }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Image Count Badge */}
                      {roomImages.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <FaEye size={10} />
                          {roomImages.length} photos
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaBed size={40} />
                    </div>
                  )}
                </div>

                <CardContent>
                  {/* Title */}
                  <Typography variant="h6" component="div" noWrap>
                    {room.title || `Room ${index + 1}`}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: 40,
                      mb: 2,
                    }}
                  >
                    {room.room_descreption || "No description"}
                  </Typography>

                  {/* Room Info */}
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      icon={<FaDollarSign />}
                      label={room.price ? `$${room.price}` : "N/A"}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      icon={<FaUser />}
                      label={`${room.max_adults || 0} Adults`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<FaChild />}
                      label={`${room.max_children || 0} Children`}
                      size="small"
                      variant="outlined"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Room Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editIndex !== null ? (
            <>
              Edit Room
              {formData.room_id && (
                <Chip
                  label={`Room ID: ${formData.room_id}`}
                  size="small"
                  color="primary"
                  sx={{ ml: 2 }}
                />
              )}
            </>
          ) : (
            <>
              Add New Room
              {hotelId && (
                <Chip
                  label={`To Hotel ID: ${hotelId}`}
                  size="small"
                  color="success"
                  sx={{ ml: 2 }}
                />
              )}
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Images Section */}
            <fieldset className="border p-4 rounded mb-4">
              <legend className="font-medium mb-2 px-2">Room Images</legend>

              {/* Upload Controls */}
              <div className="space-y-2 mb-4">
                <div className="flex gap-2 flex-wrap">
                  <input
                    ref={urlInputRef}
                    type="text"
                    placeholder="Enter image URL"
                    className="border border-gray-300 p-2 rounded flex-1 min-w-[200px]"
                    disabled={isUploading || loading}
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlClick}
                    disabled={isUploading || loading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdLink />
                    Add URL
                  </button>
                  <label
                    className={`cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 ${isUploading || loading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                      }`}
                  >
                    {isUploading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FiPlus />
                        Upload Files
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={imageInputRef}
                      onChange={(e) => {
                        if (e.target.files && !isUploading && !loading) {
                          handleImageFilesChange(e.target.files);
                        }
                      }}
                      className="hidden"
                      disabled={isUploading || loading}
                    />
                  </label>
                </div>
              </div>

              {/* Images Grid */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-3">
                  {formImagesArray.length === 0 && !isUploading && (
                    <div className="w-full text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
                      No images uploaded yet. Upload files or add image URL.
                    </div>
                  )}

                  {formImagesArray.map((img, index) => {
                    const isMainImage = index === 0;

                    return (
                      <div
                        ref={(el) => {
                          imageRefs.current[index] = el;
                        }}
                        key={index}
                        className={`w-[102px] h-[102px] overflow-hidden relative rounded-lg p-1 border-2 zoomIn transition-all duration-200 ${isMainImage ? "border-green-500" : "border-[#d9d9d9]"
                          }`}
                      >
                        <img
                          src={img}
                          alt={`uploaded-${index}`}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/102?text=Error";
                          }}
                        />

                        {/* Set as Main Button */}
                        {!isMainImage && (
                          <button
                            type="button"
                            onClick={() => moveToFirst(index)}
                            className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/50 hover:bg-green-500 flex items-center justify-center text-white text-xs shadow-md transition-all"
                            title="Set as Main Image"
                          >
                            <FaStar className="text-[10px]" />
                          </button>
                        )}

                        {/* Main Image Badge */}
                        {isMainImage && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full px-2 py-0.5 text-[10px] shadow-md flex items-center gap-1">
                            <FaStar className="text-[8px]" />
                            Main
                          </div>
                        )}

                        {/* Preview Button */}
                        <button
                          type="button"
                          onClick={() => window.open(img, "_blank")}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-blue-500 flex items-center justify-center text-white text-xs shadow-md transition-all"
                          title="Preview"
                        >
                          <FaEye className="text-[10px]" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center text-white text-xs shadow-md transition-all"
                          title="Delete"
                        >
                          <MdDelete className="text-[10px]" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {formImagesArray.length > 0 && (
                  <div className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Total Images:</span>{" "}
                    {formImagesArray.length}
                    <span className="ml-2 text-green-600 flex items-center gap-1 mt-1">
                      <FaStar className="text-xs" />
                      First image will be used as main image
                    </span>
                  </div>
                )}
              </div>
            </fieldset>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <FormControl fullWidth className="md:col-span-2">
                <TextField
                  label="Room Title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  required
                  placeholder="e.g., Deluxe Suite"
                  disabled={loading}
                />
              </FormControl>

              {/* Description */}
              <FormControl fullWidth className="md:col-span-2">
                <TextField
                  label="Room Description"
                  value={formData.room_descreption}
                  onChange={(e) =>
                    handleFieldChange("room_descreption", e.target.value)
                  }
                  multiline
                  rows={3}
                  placeholder="Enter room description..."
                  disabled={loading}
                />
              </FormControl>

              {/* Price */}
              <FormControl fullWidth>
                <TextField
                  label="Price per Night"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleFieldChange("price", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <span className="mr-1 text-gray-500">$</span>
                    ),
                  }}
                  placeholder="0.00"
                  disabled={loading}
                />
              </FormControl>

              {/* Max Adults */}
              <FormControl fullWidth>
                <TextField
                  label="Max Adults"
                  type="number"
                  value={formData.max_adults}
                  onChange={(e) =>
                    handleFieldChange("max_adults", e.target.value)
                  }
                  inputProps={{ min: 0 }}
                  placeholder="0"
                  disabled={loading}
                />
              </FormControl>

              {/* Max Children */}
              <FormControl fullWidth>
                <TextField
                  label="Max Children"
                  type="number"
                  value={formData.max_children}
                  onChange={(e) =>
                    handleFieldChange("max_children", e.target.value)
                  }
                  inputProps={{ min: 0 }}
                  placeholder="0"
                  disabled={loading}
                />
              </FormControl>

              {/* Hidden Toggle */}
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.hidden === 1}
                      onChange={(e) =>
                        handleFieldChange("hidden", e.target.checked ? 1 : 0)
                      }
                      disabled={loading}
                    />
                  }
                  label="Hide this room"
                />
                <Typography variant="caption" color="text.secondary">
                  Hidden rooms won't be visible to guests
                </Typography>
              </FormControl>
            </div>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isUploading || loading}
            startIcon={loading ? <FaSpinner className="animate-spin" /> : null}
          >
            {loading
              ? "Saving..."
              : editIndex !== null
                ? "Save Changes"
                : "Add Room"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AccomRooms;