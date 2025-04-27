import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { accom } from "../../../data/accom";
import Tabs from "../../../components/Tabs";
import AccommodationFeatures from "../../../components/Accommodation/accomFeatures";
import AccomImages from "../../../components/Accommodation/accomImages";
import AccomRooms from "../../../components/Accommodation/accomRooms";
import JoditEditor from "jodit-react";

function UpdateAccomLayout() {
  const { product_id } = useParams();

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

  const productData = accom[product_id];
  const initialFeatures = (productData.features || []).map((feat) => {
    if (feat.label !== undefined && feat.value !== undefined) {
      return feat;
    } else {
      const parts = feat.text.split(":");
      const label = parts[0]?.trim() || "";
      const value = parts[1]?.trim() || "";
      return { icon: null, label, value };
    }
  });
  const initialImages = (productData.images || []).map((img) => ({
    type: "url",
    value: img,
  }));

  const initialRooms = (productData.rooms || []).map((room) => ({
    title: room.title,
    images: room.images,
    features: room.features,
  }));

  const [rowData, setRowData] = useState({
    ...productData,
    features: initialFeatures,
    images: initialImages,
    rooms: initialRooms,
  });

  const [activeTab, setActiveTab] = useState("General");
  const [activeTabRoom, setActiveTabRoom] = useState("General");

  useEffect(() => {
    if (activeTab === "Rooms") {
      setActiveTabRoom("General");
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Accommodation:", rowData);
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
            <label className="block mb-1 font-medium">Price</label>
            <input
              type="text"
              name="price"
              value={rowData.price || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <JoditEditor
              value={rowData.desc || ""}
              config={editorConfig}
              onBlur={(content) =>
                setRowData((prev) => ({ ...prev, desc: content }))
              }
            />
          </div>
        </>
      );
    }
    if (activeTab === "Features") {
      return (
        <AccommodationFeatures rowData={rowData} setRowData={setRowData} />
      );
    }
    if (activeTab === "Images") {
      return <AccomImages rowData={rowData} setRowData={setRowData} />;
    }
    if (activeTab === "Rooms") {
      return (
        <AccomRooms
          activeTabRoom={activeTabRoom}
          setActiveTabRoom={setActiveTabRoom}
          rowData={rowData}
          setRowData={setRowData}
        />
      );
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Accommodation</h1>
      <div className="mb-4">
        <nav className="flex space-x-4 border-b">
          <Tabs
            tabs={["General", "Features", "Images", "Rooms"]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            classNameDecoration=""
            className=""
          />
        </nav>

        {activeTab === "Rooms" && (
          <div className=" w-full border-b-1 flex items-center justify-start">
            <Tabs
              tabs={["General", "Features"]}
              activeTab={activeTabRoom}
              setActiveTab={setActiveTabRoom}
              classNameDecoration="!bg-[#295557]"
              className="text-[12px] !py-[8px]"
            />
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-5 rounded-[10px]"
      >
        {renderTabContent()}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default UpdateAccomLayout;
