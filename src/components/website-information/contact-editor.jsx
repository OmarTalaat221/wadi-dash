import React, { useState } from "react";

function ContactEditor() {
  const [socials, setSocials] = useState([
   
    {
      id: 2,
      title: "Whatsapp",
      value: "+971525147720",
    },
    {
      id: 3,
      title: "phone",
      value: "+971525147720",
    },
    {
      id: 4,
      title: "Email",
      value: "info@sawani.ae",
    },
  ]);

  const handleSocialChange = (id, field, value) => {
    setSocials((prev) =>
      prev.map((social) =>
        social.id === id ? { ...social, [field]: value } : social
      )
    );
  };



  const handleAddSocial = () => {
    const newSocial = {
      id: Date.now(),
      title: "",
      value: ""
    };
    setSocials([...socials, newSocial]);
  };

  const handleRemoveSocial = (id) => {
    setSocials(socials.filter((social) => social.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Socials array:", socials);
  };

  return (
    <div className="w-[100%] bg-gray-100 flex justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full "
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Contact Us Editor
        </h1>
        {socials.map((social) => (
          <div className="flex gap-4 justify-between md:flex-row items-center ">
            <div
              key={social.id}
              className="flex w-full flex-col md:flex-row items-center gap-4 mb-4 border p-4 rounded-lg transition hover:shadow-md"
            >
              <div className="flex flex-col flex-1 gap-2">
                <label className="text-gray-700 font-semibold">Title</label>
                <input
                  type="text"
                  value={social.title}
                  onChange={(e) =>
                    handleSocialChange(social.id, "title", e.target.value)
                  }
                  placeholder="Social Media Title"
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <div className="flex flex-col flex-1 gap-2">
                <label className="text-gray-700 font-semibold">value</label>
                <input
                  type="text"
                  value={social.value}
                  onChange={(e) =>
                    handleSocialChange(social.id, "value", e.target.value)
                  }
                  placeholder="..."
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

            
            </div>
            <button
              type="button"
              onClick={() => handleRemoveSocial(social.id)}
              className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={handleAddSocial}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Add Contact
          </button>
          <button
            type="submit"
            className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default ContactEditor;
