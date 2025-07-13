import React, { useState } from "react";

function WebsiteLogoEditor() {
  const defaultHeaderLogo = "/header-logo.webp";
  const defaultFooterLogo = "/footer-logo.webp";
  const defaultTabLogo =
    "https://res.cloudinary.com/dbz6ebekj/image/upload/v1744028390/WhatsApp_Image_2025-04-07_at_2.18.26_PM_t1hzrc.jpg";

  const [headerLogo, setHeaderLogo] = useState(defaultHeaderLogo);
  const [footerLogo, setFooterLogo] = useState(defaultFooterLogo);
  const [tabLogo, setTabLogo] = useState(defaultTabLogo);

  const handleLogoChange = (e, setLogo) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setLogo(imageUrl);
    }
  };

  const handleSaveChanges = () => {
    console.log("Changes saved");
    // Add additional save logic here (e.g., API calls)
  };

  return (
    <div className="w-full bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg  w-full">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Header Logo */}
          <div className="flex flex-col items-center border p-4 rounded-lg transition hover:shadow-md">
            <span className="text-lg font-semibold text-gray-700 mb-2">
              Header Logo
            </span>
            <img
              src={headerLogo}
              alt="Header Logo Preview"
              className="w-24 h-24 object-contain mb-4 p-1"
            />
            <label
              htmlFor="header-logo-editor"
              className="cursor-pointer bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors duration-200"
            >
              Change
            </label>
            <input
              type="file"
              id="header-logo-editor"
              onChange={(e) => handleLogoChange(e, setHeaderLogo)}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Footer Logo */}
          <div className="flex flex-col items-center border p-4 rounded-lg transition hover:shadow-md">
            <span className="text-lg font-semibold text-gray-700 mb-2">
              Footer Logo
            </span>
            <img
              src={footerLogo}
              alt="Footer Logo Preview"
              className="w-24 h-24 object-contain mb-4 p-1"
            />
            <label
              htmlFor="footer-logo-editor"
              className="cursor-pointer bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors duration-200"
            >
              Change
            </label>
            <input
              type="file"
              id="footer-logo-editor"
              onChange={(e) => handleLogoChange(e, setFooterLogo)}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Tab Logo */}
          <div className="flex flex-col items-center border p-4 rounded-lg transition hover:shadow-md">
            <span className="text-lg font-semibold text-gray-700 mb-2">
              Tab Logo
            </span>
            <img
              src={tabLogo}
              alt="Tab Logo Preview"
              className="w-24 h-24 object-contain mb-4 p-1"
            />
            <label
              htmlFor="tab-logo-editor"
              className="cursor-pointer bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors duration-200"
            >
              Change
            </label>
            <input
              type="file"
              id="tab-logo-editor"
              onChange={(e) => handleLogoChange(e, setTabLogo)}
              className="hidden"
              accept="image/*"
            />
          </div>
        </form>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSaveChanges}
            className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors duration-200 font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebsiteLogoEditor;
