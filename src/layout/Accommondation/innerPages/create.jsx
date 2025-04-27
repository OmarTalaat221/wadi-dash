import React, { useState, useEffect } from "react";
import Tabs from "../../../components/Tabs";
import AccommodationFeatures from "../../../components/Accommodation/accomFeatures";
import AccomImages from "../../../components/Accommodation/accomImages";
import AccomRooms from "../../../components/Accommodation/accomRooms";
import JoditEditor from "jodit-react";

function CreateAccomLayout() {
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    price: "",
    features: [],
    images: [],
    rooms: [],
  });

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

  const [activeTab, setActiveTab] = useState("General");
  const [activeTabRoom, setActiveTabRoom] = useState("General");

  useEffect(() => {
    if (activeTab === "Rooms") {
      setActiveTabRoom("General");
    }
  }, [activeTab]);

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Created Accommodation:", formData);
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
              value={formData.title || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Price</label>
            <input
              type="text"
              name="price"
              value={formData.price || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <JoditEditor
              value={formData.desc || ""}
              config={editorConfig}
              onBlur={(content) =>
                setFormData((prev) => ({ ...prev, desc: content }))
              }
            />
          </div>
        </>
      );
    }
    if (activeTab === "Features") {
      return (
        <AccommodationFeatures rowData={formData} setRowData={setFormData} />
      );
    }
    if (activeTab === "Images") {
      return <AccomImages rowData={formData} setRowData={setFormData} />;
    }
    if (activeTab === "Rooms") {
      return (
        <AccomRooms
          activeTabRoom={activeTabRoom}
          setActiveTabRoom={setActiveTabRoom}
          rowData={formData}
          setRowData={setFormData}
        />
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Accommodation</h1>
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
          Create Accommodation
        </button>
      </form>
    </div>
  );
}

export default CreateAccomLayout;
