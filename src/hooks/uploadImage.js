import axios from "axios";

export const uploadImageToServer = async (file) => {
  const formData = new FormData();
  formData.append("image", file); // Adjust field name if needed

  try {
    const response = await axios.post(
      "https://camp-coding.tech/wady-way/user/item_img_uploader.php",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Assuming the response contains the uploaded image URL
    if (response.data && response.status == 200) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Failed to upload image");
    }
  } catch (error) {
    console.error("Error uploading to server:", error);
    throw error;
  }
};
