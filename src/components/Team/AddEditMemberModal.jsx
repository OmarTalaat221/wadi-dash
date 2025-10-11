// components/Team/AddEditMemberModal.js
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Button,
  Upload,
  Radio,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { uploadImageToServer } from "../../hooks/uploadImage";

const AddEditMemberModal = ({
  open,
  setOpen,
  initialData,
  onSave,
  saving = false,
}) => {
  const [form] = Form.useForm();
  const [imageInputType, setImageInputType] = useState("url");
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const isEditing = !!initialData;

  useEffect(() => {
    if (open && initialData) {
      // Safely handle bestPlaces array
      const bestPlacesString = Array.isArray(initialData.bestPlaces)
        ? initialData.bestPlaces.join(", ")
        : "";

      form.setFieldsValue({
        name: initialData.name || "",
        position: initialData.position || "",
        profileImage: initialData.profileImage || "",
        shortDescription: initialData.shortDescription || "",
        funFact: initialData.funFact || "",
        favoriteQuote: initialData.favoriteQuote || "",
        favoriteMemory: initialData.favoriteMemory || "",
        bestPlaces: bestPlacesString,
        isTopMember: initialData.isTopMember || false,
        ig_link: initialData.ig_link || "https://www.instagram.com/",
        facebook_link: initialData.facebook_link || "https://www.facebook.com/",
      });

      setPreviewUrl(initialData.profileImage || "");
      setImageInputType("url");
    } else if (open) {
      form.resetFields();
      setPreviewUrl("");
      setFileList([]);
      setImageInputType("url");
    }
  }, [open, initialData, form]);

  const handleCancel = () => {
    if (!saving && !uploading) {
      setOpen(false);
      form.resetFields();
      setPreviewUrl("");
      setFileList([]);
      setImageInputType("url");
    }
  };

  const handleImageUpload = async (file) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }

    // Validate file size (max 10MB)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("Image must be smaller than 10MB!");
      return false;
    }

    setUploading(true);
    try {
      message.loading("Uploading image...", 0);
      const response = await uploadImageToServer(file);
      message.destroy();

      // Extract URL from response - adjust based on your API response structure
      const imageUrl =
        response.url || response.image_url || response.data?.url || response;

      if (imageUrl) {
        form.setFieldsValue({ profileImage: imageUrl });
        setPreviewUrl(imageUrl);
        setFileList([
          {
            uid: "-1",
            name: file.name,
            status: "done",
            url: imageUrl,
          },
        ]);
        message.success("Image uploaded successfully!");
      } else {
        throw new Error("No image URL returned from server");
      }
    } catch (error) {
      message.destroy();
      console.error("Upload error:", error);
      message.error(
        error.message || "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreviewUrl(url);
    form.setFieldsValue({ profileImage: url });
    if (url) {
      setFileList([]);
    }
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // Convert comma-separated string to array
        const bestPlaces = values.bestPlaces
          ? values.bestPlaces
              .split(",")
              .map((place) => place.trim())
              .filter((place) => place)
          : [];

        const memberData = {
          ...values,
          bestPlaces,
          profileImage: previewUrl || values.profileImage,
          id: initialData ? initialData.id : Date.now(),
        };

        onSave(memberData);
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setPreviewUrl("");
      form.setFieldsValue({ profileImage: "" });
    },
    beforeUpload: handleImageUpload,
    fileList,
    listType: "picture-card",
    accept: "image/*",
    disabled: uploading || saving,
  };

  return (
    <Modal
      title={isEditing ? "Edit Team Member" : "Add New Team Member"}
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button
          key="cancel"
          onClick={handleCancel}
          disabled={saving || uploading}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          className="bg-blue-600"
          loading={saving}
          disabled={uploading}
        >
          {isEditing ? "Update" : "Add"} Team Member
        </Button>,
      ]}
      centered
      maskClosable={!saving && !uploading}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isTopMember: false,
          profileImage:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
          ig_link: "https://www.instagram.com/",
          facebook_link: "https://www.facebook.com/",
          bestPlaces: "",
        }}
        className="pt-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: "Please enter the name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input
              placeholder="Enter full name"
              disabled={saving || uploading}
            />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[
              { required: true, message: "Please enter the position" },
              { min: 2, message: "Position must be at least 2 characters" },
            ]}
          >
            <Input
              placeholder="Enter job position"
              disabled={saving || uploading}
            />
          </Form.Item>
        </div>

        {/* Enhanced Profile Image Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Profile Image
          </label>
          <Radio.Group
            value={imageInputType}
            onChange={(e) => setImageInputType(e.target.value)}
            className="mb-3"
            disabled={saving || uploading}
          >
            <Radio value="url">Image URL</Radio>
            <Radio value="upload">Upload Image</Radio>
          </Radio.Group>

          {imageInputType === "url" ? (
            <Form.Item
              name="profileImage"
              rules={[
                { required: true, message: "Please enter the image URL" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input
                placeholder="Enter image URL"
                disabled={saving || uploading}
                onChange={handleUrlChange}
              />
            </Form.Item>
          ) : (
            <div className="mb-4">
              <Upload {...uploadProps}>
                {fileList.length === 0 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>
                      {uploading ? "Uploading..." : "Upload"}
                    </div>
                  </div>
                )}
              </Upload>
              {uploading && (
                <p className="text-blue-600 text-sm mt-2">Uploading image...</p>
              )}
            </div>
          )}

          {/* Image Preview */}
          {previewUrl && (
            <div className="mt-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <Form.Item
          name="shortDescription"
          label="Description"
          rules={[
            { required: true, message: "Please enter a description" },
            { min: 10, message: "Description must be at least 10 characters" },
          ]}
        >
          <Input.TextArea
            rows={2}
            placeholder="Enter a description"
            disabled={saving || uploading}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="funFact"
            label="Fun Fact"
            rules={[
              { required: true, message: "Please enter a fun fact" },
              { min: 5, message: "Fun fact must be at least 5 characters" },
            ]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Enter a fun fact"
              disabled={saving || uploading}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="favoriteQuote"
            label="Favorite Quote"
            rules={[
              { required: true, message: "Please enter a favorite quote" },
              { min: 5, message: "Quote must be at least 5 characters" },
            ]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Enter a favorite quote"
              disabled={saving || uploading}
              maxLength={300}
              showCount
            />
          </Form.Item>
        </div>

        <Form.Item
          name="favoriteMemory"
          label="Favorite Travel Memory"
          rules={[
            { required: true, message: "Please enter a favorite memory" },
            { min: 10, message: "Memory must be at least 10 characters" },
          ]}
        >
          <Input.TextArea
            rows={2}
            placeholder="Enter a favorite travel memory"
            disabled={saving || uploading}
            maxLength={400}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="bestPlaces"
          label="Best Places (comma-separated)"
          rules={[
            { required: true, message: "Please enter at least one place" },
          ]}
        >
          <Input
            placeholder="e.g. Bali, New York, Paris"
            disabled={saving || uploading}
            maxLength={200}
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="ig_link"
            label="Instagram Link"
            rules={[{ type: "url", message: "Please enter a valid URL" }]}
          >
            <Input
              placeholder="Instagram profile URL"
              disabled={saving || uploading}
            />
          </Form.Item>

          <Form.Item
            name="facebook_link"
            label="Facebook Link"
            rules={[{ type: "url", message: "Please enter a valid URL" }]}
          >
            <Input
              placeholder="Facebook profile URL"
              disabled={saving || uploading}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="isTopMember"
          label="Top Team Member"
          valuePropName="checked"
          extra={`Only ${4} team members can be marked as top members.`}
        >
          <Switch disabled={saving || uploading} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditMemberModal;
