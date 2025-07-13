import JoditEditor from "jodit-react";
import React, { useState } from "react";
import editorConfig from "../../data/joditConfig";

const TermsAndConditions = () => {
  const [formData, setFormData] = useState({
    description: "",
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
      <div className="bg-white p-5 rounded-[10px]">

      <JoditEditor
        value={formData.description || ""}
        config={editorConfig}
        onBlur={(content) =>
          setFormData((prev) => ({ ...prev, description: content }))
        }
        />
        </div>
       <div className="w-full flex justify-end items-center mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
          >
            Save
          </button>
        </div>
    </div>
  );
};

export default TermsAndConditions;
