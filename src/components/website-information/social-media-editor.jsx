import React, { useState } from "react";

function SocialMediaEditor() {
  const [socials, setSocials] = useState([
    {
      id: 1,
      title: "Facebook",
      link: "https://www.facebook.com/SawaniProperties/",
      icon: "",
    },
    {
      id: 2,
      title: "Whatsapp",
      link: "https://wa.me/+971525147720",
      icon: "",
    },
    {
      id: 3,
      title: "Instagram",
      link: "https://www.instagram.com/sawaniproperties",
      icon: "",
    },
    {
      id: 4,
      title: "LinkedIn",
      link: "https://www.linkedin.com/company/sawani.properties/",
      icon: "",
    },
  ]);

  const handleSocialChange = (id, field, value) => {
    setSocials((prev) =>
      prev.map((social) =>
        social.id === id ? { ...social, [field]: value } : social
      )
    );
  };

  const handleIconChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      handleSocialChange(id, "icon", imageUrl);
    }
  };

  const handleAddSocial = () => {
    const newSocial = {
      id: Date.now(),
      title: "",
      link: "",
      icon: "",
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
          Social Media Editor
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
                <label className="text-gray-700 font-semibold">Link</label>
                <input
                  type="text"
                  value={social.link}
                  onChange={(e) =>
                    handleSocialChange(social.id, "link", e.target.value)
                  }
                  placeholder="https://..."
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-semibold">Icon</label>
                <div className="flex items-center gap-2">
                  {social.icon ? (
                    <img
                      src={social.icon}
                      alt={`${social.title} icon`}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center border rounded text-gray-400">
                      N/A
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={(e) => handleIconChange(social.id, e)}
                    accept="image/*"
                    className="hidden"
                    id={`icon-upload-${social.id}`}
                  />
                  <label
                    htmlFor={`icon-upload-${social.id}`}
                    className="cursor-pointer bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition"
                  >
                    Upload
                  </label>
                </div>
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
            Add Social Media
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

export default SocialMediaEditor;
