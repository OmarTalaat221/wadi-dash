import React, { useState } from "react";
import JoditEditor from "jodit-react";
import editorConfig from "../../data/joditConfig";
import { Select, message } from "antd";
import axios from "axios";
import { base_url } from "../../utils/base_url";

// ✅ Updated: Match API values
const tripStatusOptions = [
  { label: "User has a trip", value: "have_trip" },
  { label: "User does not have a trip", value: "donot_have_trip" },
  { label: "User will make a trip", value: "will_have_trip" },
];

const Notifications = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tripStatus: undefined,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTripStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, tripStatus: value }));
  };

  // ✅ Validation function
  const validateForm = () => {
    if (!formData.tripStatus) {
      message.error("Please select user trip status");
      return false;
    }

    if (!formData.title?.trim()) {
      message.error("Please enter notification title");
      return false;
    }

    if (!formData.description?.trim()) {
      message.error("Please enter notification description");
      return false;
    }

    return true;
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        notification_body: formData.description,
        type: formData.tripStatus,
        // Optional: Add title if API supports it
        notification_title: formData.title,
      };

      console.log("Sending payload:", payload);

      // Send request
      const response = await axios.post(
        `${base_url}/admin/notifications/handel_send_notifi.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data);

      // Handle success
      if (response.data.status === "success" || response.data.success) {
        message.success(
          response.data.message || "Notification sent successfully!"
        );

        // Reset form
        setFormData({
          title: "",
          description: "",
          tripStatus: undefined,
        });
      } else {
        // Handle API error
        message.error(response.data.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);

      // Handle network/server errors
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Network error occurred while sending notification";

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    return (
      <>
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
          <p className="text-sm text-gray-500 mt-1">
            Select the target audience based on their trip status
          </p>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
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
          <JoditEditor
            value={formData.description || ""}
            config={{
              ...editorConfig,
              readonly: loading,
            }}
            onBlur={(content) =>
              setFormData((prev) => ({ ...prev, description: content }))
            }
          />
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Send Notification</h1>
        {formData.tripStatus && (
          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
            Target:{" "}
            {
              tripStatusOptions.find((opt) => opt.value === formData.tripStatus)
                ?.label
            }
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-5 rounded-[10px] shadow-sm"
      >
        {renderTabContent()}

        <div className="w-full flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setFormData({
                title: "",
                description: "",
                tripStatus: undefined,
              })
            }
            disabled={loading}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Send Notification
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview Section */}
      {(formData.title || formData.description) && (
        <div className="mt-6 bg-white p-5 rounded-[10px] shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Preview</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
            {formData.title && (
              <h3 className="font-bold text-lg mb-2">{formData.title}</h3>
            )}
            {formData.description && (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.description }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
