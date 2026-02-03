import React, { useState, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";
import { Select, message } from "antd";
import axios from "axios";
import { base_url } from "../../utils/base_url";

const tripStatusOptions = [
  { label: "User had a trip", value: "have_trip" },
  { label: "User does not have a trip", value: "donot_have_trip" },
  { label: "User will make a trip", value: "will_have_trip" },
];

const Notifications = () => {
  const editor = useRef(null); // ✅ Add ref

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tripStatus: undefined,
  });
  const [loading, setLoading] = useState(false);

  // ✅ IMPORTANT: Memoize the config to prevent re-renders
  const config = useMemo(
    () => ({
      readonly: loading,
      height: 300,
      toolbar: true,
      spellcheck: true,
      language: "en",

      // Fix copy/paste
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html",

      // Enable features
      enableDragAndDropFileToEditor: true,
      toolbarAdaptive: false,
      toolbarSticky: false,

      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,

      useSearch: true,
      allowResizeY: true,

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
        "align",
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

      // ✅ Fix placeholder
      placeholder: "Enter notification description...",
    }),
    [loading] // Only recreate when loading changes
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTripStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, tripStatus: value }));
  };

  // ✅ Handle editor content change
  const handleEditorChange = (newContent) => {
    setFormData((prev) => ({ ...prev, description: newContent }));
  };

  const validateForm = () => {
    if (!formData.tripStatus) {
      message.error("Please select user trip status");
      return false;
    }

    if (
      !formData.description?.trim() ||
      formData.description === "<p><br></p>"
    ) {
      message.error("Please enter notification description");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        notification_body: formData.description,
        type: formData.tripStatus,
        notification_title: formData.title,
      };

      const response = await axios.post(
        `${base_url}/admin/notifications/handel_send_notifi.php`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success" || response.data.success) {
        message.success(
          response.data.message || "Notification sent successfully!"
        );
        // setFormData({ title: "", description: "", tripStatus: undefined });
      } else {
        message.error(response.data.message || "Failed to send notification");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Send Notification</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-5 rounded-[10px] shadow-sm"
      >
        <div>
          <label className="block mb-1 font-medium">
            User Trip Status <span className="text-red-500">*</span>
          </label>
          <Select
            size="large"
            style={{ width: "100%" }}
            placeholder="Select user trip status"
            options={tripStatusOptions}
            value={formData.tripStatus}
            onChange={handleTripStatusChange}
            allowClear
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Enter notification title"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          {/* ✅ Fixed JoditEditor */}
          <JoditEditor
            ref={editor}
            value={formData.description}
            config={config}
            onBlur={handleEditorChange}
            onChange={() => {}} // ✅ Add empty onChange to prevent warnings
          />
        </div>

        <div className="w-full flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setFormData({ title: "", description: "", tripStatus: undefined })
            }
            disabled={loading}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Notifications;
