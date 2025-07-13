import React, { useState, useRef } from "react";
import JoditEditor from "jodit-react";

function GeneralSettingsEditor() {
  const [websiteName, setWebsiteName] = useState("Sawani");
  const [location, setLocation] = useState("Dubai, UAE");
  const [termsAndConditions, setTermsAndConditions] = useState(
    "<p>Default Terms and Conditions content goes here.</p>"
  );
  const [privacyPolicy, setPrivacyPolicy] = useState(
    "<p>Default Privacy Policy content goes here.</p>"
  );
  const [copyrightText, setCopyrightText] = useState(
    "© 2025 Sawani. All rights reserved."
  );
  const [websiteLink, setWebsiteLink] = useState(
    "https://www.sawani.ae"
  );
  const termsEditor = useRef(null);
  const privacyEditor = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const settingsData = {
      websiteName,
      location,
      termsAndConditions,
      privacyPolicy,
      copyrightText,
      websiteLink,
    };
    console.log("General Settings:", settingsData);
  };

  return (
    <div className="w-full bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full space-y-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          General Settings Editor
        </h1>
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold" htmlFor="websiteName">
            Website Name
          </label>
          <input
            id="websiteName"
            type="text"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            placeholder="Enter your website name..."
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location..."
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold">
            Terms and Conditions
          </label>
          <JoditEditor
            ref={termsEditor}
            value={termsAndConditions}
            tabIndex={1}
            onBlur={(newContent) => setTermsAndConditions(newContent)}
            onChange={() => {}}
            config={{ readonly: false }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold">Privacy Policy</label>
          <JoditEditor
            ref={privacyEditor}
            value={privacyPolicy}
            tabIndex={1}
            onBlur={(newContent) => setPrivacyPolicy(newContent)}
            onChange={() => {}}
            config={{ readonly: false }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-gray-700 font-semibold"
            htmlFor="copyrightText"
          >
            Copyright Text
          </label>
          <input
            id="copyrightText"
            type="text"
            value={copyrightText}
            onChange={(e) => setCopyrightText(e.target.value)}
            placeholder="© 2025 My Awesome Website. All rights reserved."
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-semibold" htmlFor="websiteLink">
            Website Link
          </label>
          <input
            id="websiteLink"
            type="text"
            value={websiteLink}
            onChange={(e) => setWebsiteLink(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 transition-colors duration-200 font-medium"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default GeneralSettingsEditor;
