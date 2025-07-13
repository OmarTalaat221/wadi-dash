import { Box, Button, IconButton, FormControl, TextField } from "@mui/material";
import { FaEye, FaPlus } from "react-icons/fa";
import React, { useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

const AccomRooms = ({
  rowData,
  setRowData,
  activeTabRoom,
  setActiveTabRoom,
}) => {
  const [activeRoom, setActiveRoom] = useState(0);
  const imageRefs = useRef([]);
  const imageInputRef = useRef(null);

  const handleRoomImageFilesChange = (files, activeRoom) => {
    const fileArray = Array.from(files).map((file) => ({
      type: "file",
      file,
      value: file.name,
      preview: URL.createObjectURL(file),
    }));

    setRowData((prev) => {
      const updatedRooms = prev.rooms.map((room, index) => {
        if (index === activeRoom) {
          return {
            ...room,
            images: [...room.images, ...fileArray],
          };
        }
        return room;
      });

      setTimeout(() => {
        fileArray.forEach((_, idx) => {
          const refIndex = prev.rooms[activeRoom].images.length + idx;
          const imgRef = imageRefs.current[refIndex];
          if (imgRef) {
            imgRef.classList.add("zoomIn");
            setTimeout(() => imgRef.classList.remove("zoomIn"), 300);
          }
        });
      }, 10);

      return {
        ...prev,
        rooms: updatedRooms,
      };
    });
  };

  const handleRoomFeatureFieldChange = (
    roomIndex,
    featureIndex,
    field,
    value
  ) => {
    const updatedRooms = [...rowData.rooms];
    const updatedFeatures = [...updatedRooms[roomIndex].features];
    updatedFeatures[featureIndex] = {
      ...updatedFeatures[featureIndex],
      [field]: value,
    };
    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      features: updatedFeatures,
    };
    setRowData((prev) => ({ ...prev, rooms: updatedRooms }));
  };

  const handleRoomFeatureIconChange = (roomIndex, featureIndex, file) => {
    const updatedRooms = [...rowData.rooms];
    const updatedFeatures = [...updatedRooms[roomIndex].features];
    updatedFeatures[featureIndex] = {
      ...updatedFeatures[featureIndex],
      icon: file,
    };
    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      features: updatedFeatures,
    };
    setRowData((prev) => ({ ...prev, rooms: updatedRooms }));
  };

  const removeRoomFeature = (roomIndex, featureIndex) => {
    const updatedRooms = [...rowData.rooms];
    const updatedFeatures = updatedRooms[roomIndex].features.filter(
      (_, i) => i !== featureIndex
    );
    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      features: updatedFeatures,
    };
    setRowData((prev) => ({ ...prev, rooms: updatedRooms }));
  };

  const addRoomFeature = (roomIndex) => {
    const updatedRooms = [...rowData.rooms];
    const updatedFeatures = [
      ...updatedRooms[roomIndex].features,
      { icon: null, title: "", value: "" },
    ];
    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      features: updatedFeatures,
    };
    setRowData((prev) => ({ ...prev, rooms: updatedRooms }));
  };

  const handleRoomFieldChange = (index, field, value) => {
    const updatedRooms = [...rowData.rooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setRowData((prev) => ({ ...prev, rooms: updatedRooms }));
  };

  const removeRoom = (indexToRemove) => {
    setRowData((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== indexToRemove),
    }));

    // Update activeRoom when a room is removed
    if (activeRoom >= indexToRemove) {
      setActiveRoom(Math.max(0, activeRoom - 1));
    }
  };

  const addRoom = () => {
    setRowData((prev) => ({
      ...prev,
      rooms: [...prev.rooms, { title: "", images: [], features: [] }],
    }));
  };

  const removeRoomImage = (index, activeRoom) => {
    const imgRef = imageRefs.current[index];

    if (imgRef) {
      imgRef.classList.remove("zoomIn");
      imgRef.classList.add("zoomOut");

      setTimeout(() => {
        setRowData((prev) => ({
          ...prev,
          rooms: prev.rooms.map((room, i) =>
            i === activeRoom
              ? { ...room, images: room.images.filter((_, i) => i !== index) }
              : room
          ),
        }));

        imgRef.classList.remove("zoomOut");
      }, 300);
    }
  };

  return (
    <div className="border p-4 rounded">
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[18px] font-bold">Rooms</div>
          <Button variant="contained" startIcon={<FaPlus />} onClick={addRoom}>
            Add Room
          </Button>
        </div>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <div className="inline-flex gap-[20px] my-[10px] items-center overflow-auto snap-x snap-mandatory [&::-webkit-scrollbar]:w-0">
            {rowData.rooms.map((_, index) => (
              <Button
                key={index}
                className="!text-[11px] min-h-[100px] snap-start"
                sx={{
                  minWidth: 180,
                  border: 1,
                  borderColor: "#a4aeb6",
                  backgroundColor:
                    activeRoom === index ? "#e3f2fd" : "transparent",
                }}
                onClick={() => setActiveRoom(index)}
              >
                {`Room ${index + 1}`}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRoom(index);
                  }}
                  sx={{ ml: 1 }}
                >
                  <MdDelete className="text-[20px] text-red-600" />
                </IconButton>
              </Button>
            ))}
          </div>

          <div className="flex items-center mb-[10px] gap-2 flex-wrap">
            {activeTabRoom === "General" && rowData?.rooms?.length > 0 && (
              <>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-3 m-auto">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer px-0 py-2 bg-[rgba(0,0,0,0.02)] border border-dashed border-[#d9d9d9] rounded-lg flex text-center text-[#555] w-[102px] h-[102px] text-xs flex-col gap-2 items-center justify-center hover:border-[#1677ff] transition duration-300 ease-in-out"
                    >
                      <FiPlus className="text-[15px]" />
                      Add Image
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      ref={imageInputRef}
                      onChange={(e) =>
                        e.target.files &&
                        handleRoomImageFilesChange(e.target.files, activeRoom)
                      }
                      className="hidden"
                    />
                    {rowData.rooms[activeRoom]?.images.map((img, index) => (
                      <div
                        key={index}
                        ref={(el) => (imageRefs.current[index] = el)}
                        className="w-[102px] h-[102px] overflow-hidden relative cursor-pointer rounded-lg p-2 border border-[#d9d9d9] zoomIn"
                      >
                        <div className="w-full h-full relative group">
                          <img
                            src={img.preview || img || img.value}
                            alt={`uploaded-${index}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 left-0 w-full h-full bg-black/45 opacity-0 transition-all duration-300 group-hover:opacity-100 z-10" />
                          <div className="absolute inset-0 flex justify-center items-center gap-2 text-white opacity-0 group-hover:opacity-100 z-20">
                            <FaEye />
                            <div
                              onClick={() => removeRoomImage(index, activeRoom)}
                              className="cursor-pointer"
                            >
                              <MdDelete />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-x-[15px] w-full">
                  <div className="col-span-3">
                    <FormControl fullWidth margin="normal">
                      <TextField
                        className="!shadow-none"
                        label="Title"
                        value={rowData.rooms[activeRoom]?.title || ""}
                        fullWidth
                        onChange={(e) =>
                          handleRoomFieldChange(
                            activeRoom,
                            "title",
                            e.target.value
                          )
                        }
                        required
                      />
                    </FormControl>
                  </div>
                </div>
              </>
            )}

            {activeTabRoom === "Features" && rowData?.rooms?.length > 0 && (
              <>
                <button
                  title="Add New Feature"
                  className="group cursor-pointer outline-none hover:rotate-90 duration-300"
                  onClick={() => addRoomFeature(activeRoom)}
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
                <div className="grid grid-cols-3 gap-[20px]">
                  {rowData?.rooms[activeRoom]?.features.map(
                    (feature, index) => (
                      <div
                        key={index}
                        className="mb-3 space-y-2 border p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-16">Icon:</span>
                          <input
                            type="file"
                            onChange={(e) =>
                              handleRoomFeatureIconChange(
                                activeRoom,
                                index,
                                e.target.files ? e.target.files[0] : null
                              )
                            }
                            className="w-full"
                          />
                          {feature.icon && (
                            <span className="text-sm text-gray-600">
                              {feature.icon.name || "File selected"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="w-16">Title:</label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) =>
                              handleRoomFeatureFieldChange(
                                activeRoom,
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 p-2 rounded"
                            placeholder="Feature Title"
                          />
                        </div>
                        <div className="flex items-center justify-start">
                          <button
                            type="button"
                            onClick={() => removeRoomFeature(activeRoom, index)}
                            className="bg-red-500 text-white py-[10px] px-3 rounded hover:bg-red-600 transition-colors duration-200"
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </Box>
      </div>
    </div>
  );
};

export default AccomRooms;
