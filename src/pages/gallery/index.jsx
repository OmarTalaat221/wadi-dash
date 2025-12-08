import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Upload,
  message,
  Card,
  Typography,
  Space,
  Popconfirm,
  Spin,
  Tag,
  Tooltip,
  Input,
  Form,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/base_url";
import { uploadImageToServer } from "../../hooks/uploadImage";

const { Title } = Typography;

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toggling, setToggling] = useState(null);

  // Form for adding photos with title
  const [form] = Form.useForm();

  // Fetch gallery images
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/gallary/select_gallary.php`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        setPhotos(response.data.message);
      } else {
        message.error("Failed to fetch gallery images");
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to load gallery. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load gallery on component mount
  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAddPhoto = () => {
    setFileList([]);
    form.resetFields();
    setModalOpen(true);
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/gallary/delete_gallary.php`,
        {
          id: parseInt(photoId),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        message.success("Photo deleted successfully");
        await fetchGallery(); // Refresh gallery
      } else {
        throw new Error(response.data?.message || "Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete photo. Please try again."
      );
    }
  };

  const handleToggleVisibility = async (photo) => {
    setToggling(photo.id);
    try {
      const response = await axios.post(
        `${base_url}/admin/gallary/toggle_image.php`,
        {
          id: parseInt(photo.id),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        const isCurrentlyHidden = photo.hidden === "1";
        const actionText = isCurrentlyHidden ? "shown" : "hidden";
        message.success(`Photo ${actionText} successfully`);
        await fetchGallery(); // Refresh gallery
      } else {
        throw new Error(
          response.data?.message || "Failed to toggle visibility"
        );
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to toggle visibility. Please try again."
      );
    } finally {
      setToggling(null);
    }
  };

  const handlePreviewPhoto = (photo) => {
    setCurrentPhoto({ ...photo });
    setPreviewModalOpen(true);
  };

  const handleUploadPhoto = async (values) => {
    if (fileList.length === 0) {
      message.error("Please select an image to upload");
      return;
    }

    if (!values.title || values.title.trim() === "") {
      message.error("Please enter a title for the photo");
      return;
    }

    setUploading(true);
    try {
      const file = fileList[0].originFileObj || fileList[0];

      // Step 1: Upload image to your server
      message.loading("Uploading image...", 0);
      const imageUrl = await uploadImageToServer(file);
      message.destroy();

      if (!imageUrl) {
        throw new Error("No image URL returned from upload");
      }

      // Step 2: Add image URL to gallery database with title
      const response = await axios.post(
        `${base_url}/admin/gallary/add_gallary.php`,
        {
          image: imageUrl,
          title: values.title.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        message.success("Photo uploaded and added to gallery successfully!");
        await fetchGallery(); // Refresh gallery
        setModalOpen(false);
        setFileList([]);
        form.resetFields();
      } else {
        throw new Error(
          response.data?.message || "Failed to add photo to gallery"
        );
      }
    } catch (error) {
      message.destroy(); // Clear any loading messages
      console.error("Error uploading photo:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload photo. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setFileList([]);
    form.resetFields();
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // Validate file type
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("Image must be smaller than 10MB!");
        return false;
      }

      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
    listType: "picture-card",
    accept: "image/*",
  };

  const getVisibilityInfo = (hidden) => {
    const isHidden = hidden === "1";
    return {
      color: isHidden ? "red" : "green",
      text: isHidden ? "Hidden" : "Visible",
      icon: isHidden ? EyeInvisibleOutlined : EyeOutlined,
      tooltipText: isHidden ? "Show Image" : "Hide Image",
    };
  };

  const handleRefresh = () => {
    fetchGallery();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Photo Gallery</Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPhoto}
          >
            Add Photo
          </Button>
        </Space>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading gallery..." />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No photos in gallery yet</p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPhoto}
          >
            Add Your First Photo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => {
            const visibilityInfo = getVisibilityInfo(photo.hidden);
            const VisibilityIcon = visibilityInfo.icon;

            return (
              <Card
                key={photo.id}
                cover={
                  <div
                    className={`h-48 bg-cover bg-center cursor-pointer relative ${
                      photo.hidden === "1" ? "opacity-50" : ""
                    }`}
                    style={{
                      backgroundImage: `url(${photo.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    onClick={() => handlePreviewPhoto(photo)}
                  >
                    <div className="absolute top-2 right-2">
                      <Tag color={visibilityInfo.color} className="m-0">
                        {visibilityInfo.text}
                      </Tag>
                    </div>
                  </div>
                }
                actions={[
                  <Tooltip title="Preview Image" key="preview">
                    <EyeOutlined onClick={() => handlePreviewPhoto(photo)} />
                  </Tooltip>,
                  <Tooltip title={visibilityInfo.tooltipText} key="toggle">
                    <VisibilityIcon
                      onClick={() => handleToggleVisibility(photo)}
                      style={{
                        color: toggling === photo.id ? "#1890ff" : undefined,
                      }}
                    />
                  </Tooltip>,
                  <Popconfirm
                    key="delete"
                    title="Delete this photo?"
                    description="Are you sure you want to delete this photo? This action cannot be undone."
                    onConfirm={() => handleDeletePhoto(photo.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Tooltip title="Delete Image">
                      <DeleteOutlined />
                    </Tooltip>
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={
                    <Tooltip title={photo.title || "No title"}>
                      <div className="text-sm font-medium text-gray-900 truncate text-center">
                        {photo.title || "Untitled"}
                      </div>
                    </Tooltip>
                  }
                  description={
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">
                        Added: {new Date(photo.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">ID: {photo.id}</p>
                    </div>
                  }
                />
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Photo Modal */}
      <Modal
        title="Add New Photo"
        open={modalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUploadPhoto}
          className="py-4"
        >
          <Form.Item
            name="title"
            label="Photo Title"
            rules={[
              { required: true, message: "Please enter a title for the photo" },
              { max: 100, message: "Title cannot exceed 100 characters" },
            ]}
          >
            <Input
              placeholder="Enter a descriptive title for your photo"
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item label="Select Image" required>
            <Upload {...uploadProps}>
              {fileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Select Image</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {fileList.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Upload Information:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Image will be uploaded to server</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                <li>• Image will be automatically resized if needed</li>
              </ul>
            </div>
          )}

          <Form.Item className="mb-0 mt-6">
            <Space className="flex justify-end">
              <Button onClick={handleCancel} disabled={uploading}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                disabled={fileList.length === 0}
              >
                Upload Photo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={
          <div className="text-center">
            <Title level={4} className="mb-0">
              {currentPhoto?.title || "Untitled"}
            </Title>
          </div>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={900}
        centered
        destroyOnClose
      >
        <div className="flex flex-col items-center">
          <img
            src={currentPhoto?.image}
            alt={currentPhoto?.title || "Gallery Preview"}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
          <div className="mt-4 text-center">
            <Space direction="vertical" size="small">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-base font-medium text-gray-900 mb-2">
                  {currentPhoto?.title || "Untitled"}
                </p>
                <Tag
                  color={getVisibilityInfo(currentPhoto?.hidden).color}
                  className="text-sm"
                >
                  {getVisibilityInfo(currentPhoto?.hidden).text}
                </Tag>
              </div>
              <p className="text-sm text-gray-500">
                Added:{" "}
                {currentPhoto?.created_at &&
                  new Date(currentPhoto.created_at).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                Image ID: {currentPhoto?.id}
              </p>
              <Button
                type="link"
                size="small"
                onClick={() => window.open(currentPhoto?.image, "_blank")}
              >
                Open Original Image
              </Button>
            </Space>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Gallery;
