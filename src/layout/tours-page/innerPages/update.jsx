import { MdDelete } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoMdCloseCircle } from "react-icons/io";
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { tours } from "../../../data/tours";
import Tabs from "../../../components/Tabs";
import { FiPlus } from "react-icons/fi";
import JoditEditor from "jodit-react";

import {
  Box,
  Button,
  IconButton,
  FormControl,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { days } from "../../../data/days";
import { accom } from "../../../data/accom";
import { transfers } from "../../../data/transfer";
import { Select, Tag, Space } from "antd";
import TourFeatures from "../../../components/tours-page/TourFeatures";

function UpdateTourLayout() {
  const { product_id } = useParams();
  const toursData = tours?.[product_id];
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

  const [showMapModal, setShowMapModal] = useState(false);
  const imageRefs = useRef([]);
  const isMapUrl = (url) => {
    const regex =
      /^(https?:\/\/)?(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|openstreetmap\.org\/|maps\.apple\.com\/)/i;
    return regex.test(url);
  };

  const initialFeatures = (toursData.features || []).map((feat) => {
    if (feat.label !== undefined && feat.value !== undefined) {
      return feat;
    } else {
      const parts = feat.text.split(":");
      const label = parts[0]?.trim() || "";
      const value = parts[1]?.trim() || "";
      return { icon: null, label, value };
    }
  });
  const initialImages = (toursData.images || []).map((img) => ({
    type: "url",
    value: img,
  }));
  const initialFloorPlans = (toursData.floorPlans || []).map((fp) => ({
    type: "url",
    value: fp,
  }));
  const [rowData, setRowData] = useState({
    ...toursData,
    features: initialFeatures,
    images: initialImages,
    floorPlans: initialFloorPlans,
    days: days || [],
  });
  const [activeTab, setActiveTab] = useState("General");
  const [activeDay, setActiveDay] = useState(0);
  const imageInputRef = useRef(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRowData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    console.log(rowData);
  }, [rowData]);

  const addDay = () => {
    const newDayNumber = rowData?.days?.length + 1;
    const newDay = {
      day: newDayNumber,
      location: "",
      description: "",
      accommodation: [],
      transfers: [],
    };
    setRowData({ ...rowData, days: [...(rowData.days || []), newDay] });
  };

  useEffect(() => {
    console.log(rowData);
  }, [rowData]);

  const removeDay = (indexToRemove) => {
    const updatedDays = [...rowData.days];
    updatedDays.splice(indexToRemove, 1);

    const renumbered = updatedDays.map((day, i) => ({
      ...day,
      day: i + 1,
    }));

    setRowData({ ...rowData, days: renumbered });
    if (activeDay >= indexToRemove) {
      setActiveDay(Math.max(0, activeDay - 1));
    }
  };

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...rowData.days];
    updatedDays[index] = { ...updatedDays[index], [field]: value };
    setRowData((prev) => ({ ...prev, days: updatedDays }));
  };

  const handleImageFilesChange = (files) => {
    const fileArray = Array.from(files).map((file) => ({
      type: "file",
      file,
      value: file.name,
      preview: URL.createObjectURL(file),
    }));

    setRowData((prev) => {
      const updated = [...prev.images, ...fileArray];

      // Add zoomIn to new refs
      setTimeout(() => {
        fileArray.forEach((_, idx) => {
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
  };

  const removeImage = (index) => {
    const imgRef = imageRefs.current[index];

    if (imgRef) {
      imgRef.classList.remove("zoomIn");
      imgRef.classList.add("zoomOut");

      // Remove from state *after* animation
      setTimeout(() => {
        setRowData((prev) => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
        }));

        // No need to manually remove class; image is removed from DOM
        // But if you're reusing DOM nodes, do it here instead:
        imgRef.classList.remove("zoomOut");
      }, 300); // Match this with animation duration
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated tour:", rowData);
  };
  const renderTabContent = () => {
    if (activeTab === "General") {
      return (
        <>
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={rowData.title || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <JoditEditor
              value={rowData.description || ""}
              config={editorConfig}
              onBlur={(content) =>
                setRowData((prev) => ({ ...prev, description: content }))
              }
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Map</label>
            <div className="flex items-center gap-[10px]">
              <input
                type="text"
                name="map"
                value={rowData.map || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />

              {isMapUrl(rowData.map) && (
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  View
                </button>
              )}
            </div>
          </div>

          <Dialog
            open={showMapModal}
            onClose={() => setShowMapModal(false)}
            fullWidth
            maxWidth="lg"
          >
            <DialogContent>
              {rowData.map && (
                <iframe
                  src={rowData.map}
                  width="100%"
                  height="450px"
                  className="rounded-[10px]"
                ></iframe>
              )}
            </DialogContent>
          </Dialog>
        </>
      );
    }
    if (activeTab === "Features") {
      return <TourFeatures rowData={rowData} setRowData={setRowData} />;
    }

    if (activeTab === "Images") {
      return (
        <fieldset className="border p-4 rounded">
          <legend className="font-medium mb-2">Images</legend>
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
                onChange={(e) => {
                  if (e.target.files) {
                    handleImageFilesChange(e.target.files);
                  }
                }}
                className="hidden"
              />
              {rowData.images.map((img, index) => (
                <div
                  ref={(el) => {
                    imageRefs.current[index] = el;
                  }}
                  key={index}
                  className="w-[102px] h-[102px] overflow-hidden relative cursor-pointer rounded-lg p-2 border border-[#d9d9d9] zoomIn"
                >
                  <div className="w-full h-full relative group">
                    <img
                      src={img.preview || img.value}
                      alt={`uploaded-${index}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-black/45 opacity-0 transition-all duration-300 group-hover:opacity-100 z-10" />
                    <div className="absolute inset-0 flex justify-center items-center gap-2 text-white opacity-0 group-hover:opacity-100 z-20">
                      <FaEye />
                      <div
                        onClick={() => removeImage(index)}
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
        </fieldset>
      );
    }
    if (activeTab === "Days") {
      return (
        <div className="border p-4 rounded overflow-hidden">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[18px] font-bold">Days</div>
              <Button
                variant="contained"
                startIcon={<FaPlus />}
                onClick={addDay}
              >
                Add Day
              </Button>
            </div>

            <div className="w-full flex gap-[20px] my-[10px] items-center overflow-auto snap-x snap-mandatory [&::-webkit-scrollbar]:w-0">
              {rowData.days.map((item, index) => (
                <Button
                  key={index}
                  className="!text-[11px] min-h-[100px] snap-start"
                  sx={{
                    minWidth: 150,
                    border: 1,
                    borderColor: "#a4aeb6",
                    backgroundColor:
                      activeDay === index ? "#e3f2fd" : "transparent",
                  }}
                  onClick={() => setActiveDay(index)}
                >
                  {`Day ${item.day}`}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDay(index);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <MdDelete className="text-[20px] text-red-600" />
                  </IconButton>
                </Button>
              ))}
            </div>
            {rowData?.days?.length > 0 && (
              <div>
                <div className="grid grid-cols-3 items-center gap-x-[15px] w-full">
                  <div className="col-span-3">
                    <FormControl fullWidth margin="normal">
                      <TextField
                        className="!shadow-none"
                        label="Location"
                        value={rowData.days[activeDay]?.location || ""}
                        fullWidth
                        onChange={(e) =>
                          handleDayChange(activeDay, "location", e.target.value)
                        }
                        required
                      />
                    </FormControl>
                  </div>

                  <div className="col-span-3">
                    <FormControl fullWidth margin="normal">
                      <label className="block mb-1 font-medium">
                        Description
                      </label>
                      <JoditEditor
                        value={rowData.days[activeDay]?.description || ""}
                        config={editorConfig}
                        onBlur={(content) =>
                          handleDayChange(activeDay, "description", content)
                        }
                      />
                    </FormControl>
                  </div>
                  <div className="col-span-3">
                    <div className="mb-2">Select Accommodation</div>
                    <Select
                      mode="multiple"
                      size="middle"
                      labelInValue
                      showSearch
                      style={{ width: "100%" }}
                      dropdownStyle={{
                        maxHeight: "none",
                        overflow: "auto",
                        padding: "4px 8px",
                      }}
                      dropdownRender={(menu) => (
                        <div style={{ maxHeight: "300px", overflow: "auto" }}>
                          {menu}
                        </div>
                      )}
                      placeholder="Select accommodations"
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option?.label &&
                        typeof option.label === "string" &&
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                      value={(rowData.days[activeDay]?.accommodation || []).map(
                        (acc) => ({
                          label: acc.title,
                          value: acc.id,
                        })
                      )}
                      onChange={(value) => {
                        const selectedAccoms = value.map((v) =>
                          accom.find((a) => a.id === v.value)
                        );
                        handleDayChange(
                          activeDay,
                          "accommodation",
                          selectedAccoms
                        );
                      }}
                    >
                      {accom.map((acc) => (
                        <Select.Option
                          key={acc.id}
                          value={acc.id}
                          label={acc.title}
                        >
                          <Space>
                            <img
                              src={acc.imageCover}
                              alt={acc.title}
                              style={{
                                width: 32,
                                height: 32,
                                objectFit: "cover",
                              }}
                            />
                            {acc.title}
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <div className="mb-2">Select Transfers</div>
                    <Select
                      mode="multiple"
                      size="middle"
                      labelInValue
                      showSearch
                      allowClear
                      style={{ width: "100%" }}
                      dropdownStyle={{
                        maxHeight: "none",
                        overflow: "auto",
                        padding: "4px 8px",
                      }}
                      dropdownRender={(menu) => (
                        <div style={{ maxHeight: "300px", overflow: "auto" }}>
                          {menu}
                        </div>
                      )}
                      placeholder="Select transfers"
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option?.label &&
                        typeof option.label === "string" &&
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                      value={(rowData.days[activeDay]?.transfers || []).map(
                        (transfer) => ({
                          label: transfer.name,
                          value: transfer.id,
                        })
                      )}
                      onChange={(value) => {
                        const selectedTransfers = value.map((v) =>
                          transfers.find((t) => t.id === v.value)
                        );
                        handleDayChange(
                          activeDay,
                          "transfers",
                          selectedTransfers
                        );
                      }}
                    >
                      {transfers.map((transfer) => (
                        <Select.Option
                          key={transfer.id}
                          value={transfer.id}
                          label={transfer.name || transfer.title}
                        >
                          <Space>
                            <img
                              src={
                                transfer.images && transfer.images.length > 0
                                  ? transfer.images[0]
                                  : ""
                              }
                              alt={transfer.name || transfer.title}
                              style={{
                                width: 32,
                                height: 32,
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                            {transfer.name || transfer.title}
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Tour</h1>
      <div className="mb-4">
        <nav className="flex space-x-4 border-b">
          <Tabs
            tabs={["General", "Days", "Features", "Images"]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            classNameDecoration=""
            className=""
          />
        </nav>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-5 rounded-[10px]"
      >
        {renderTabContent()}
        <div className="w-full flex justify-end items-center">
          <button
            type="submit"
            className="bg-blue-500  text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateTourLayout;
