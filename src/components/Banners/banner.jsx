import React, { useState } from "react";

function BannersEditor({data, type}) {
  const [banners, setBanners] = useState([
    {
      id: 1,
      videoType: "url",
      video: "",
      bigTitle: "",
      smallTitle: "",
      paragraph: "",
    },
  ]);

  const handleBannerChange = (id, field, value) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id ? { ...banner, [field]: value } : banner
      )
    );
  };

  const handleVideoFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      handleBannerChange(id, "video", fileUrl);
    }
  };

  const handleAddBanner = () => {
    const newBanner = {
      id: Date.now(),
      videoType: "url",
      video: "",
      bigTitle: "",
      smallTitle: "",
      paragraph: "",
    };
    setBanners([...banners, newBanner]);
  };

  const handleRemoveBanner = (id) => {
    setBanners(banners.filter((banner) => banner.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Banners:", banners);
  };

  return (
    <div className="w-full bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full space-y-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Banners Editor
        </h1>
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="border p-4 rounded-lg transition hover:shadow-md space-y-4"
          >
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-semibold">Video Type</label>
              <select
                value={banner.videoType}
                onChange={(e) =>
                  handleBannerChange(banner.id, "videoType", e.target.value)
                }
                className="border px-3 py-2 rounded"
              >
                <option value="url">URL</option>
                <option value="file">File</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              {banner.videoType === "url" ? (
                <>
                  <label className="text-gray-700 font-semibold">
                    Video URL
                  </label>
                  <input
                    type="text"
                    value={banner.video}
                    onChange={(e) =>
                      handleBannerChange(banner.id, "video", e.target.value)
                    }
                    placeholder="https://example.com/video.mp4"
                    className="border px-3 py-2 rounded w-full"
                  />
                </>
              ) : (
                <>
                  <label className="text-gray-700 font-semibold">
                    Upload Video
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleVideoFileChange(banner.id, e)}
                    accept="video/*"
                    className="border px-3 py-2 rounded w-full"
                  />
                  {banner.video && (
                    <video
                      src={banner.video}
                      controls
                      className="w-full mt-2"
                    ></video>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-semibold">Big Title</label>
              <input
                type="text"
                value={banner.bigTitle}
                onChange={(e) =>
                  handleBannerChange(banner.id, "bigTitle", e.target.value)
                }
                placeholder="Enter big title..."
                className="border px-3 py-2 rounded w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-semibold">Small Title</label>
              <input
                type="text"
                value={banner.smallTitle}
                onChange={(e) =>
                  handleBannerChange(banner.id, "smallTitle", e.target.value)
                }
                placeholder="Enter small title..."
                className="border px-3 py-2 rounded w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-semibold">Paragraph</label>
              <textarea
                value={banner.paragraph}
                onChange={(e) =>
                  handleBannerChange(banner.id, "paragraph", e.target.value)
                }
                placeholder="Enter paragraph text..."
                className="border px-3 py-2 rounded w-full"
                rows="3"
              ></textarea>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveBanner(banner.id)}
              className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
            >
              Remove Banner
            </button>
          </div>
        ))}
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={handleAddBanner}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Add Banner
          </button>
          <button
            type="submit"
            className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 transition"
          >
            Save Banners
          </button>
        </div>
      </form>
    </div>
  );
}

export default BannersEditor;
