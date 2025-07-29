import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Upload,
  message,
  Card,
  Typography,
  Space,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [modalType, setModalType] = useState(""); // "add", "edit", "preview"
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    // Load initial data
    // This would typically come from an API
    setPhotos([
      {
        id: 1,
        title: "Beautiful Mountain",
        description: "A scenic view of mountains during sunset",
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format",
      },
      {
        id: 2,
        title: "Beach Paradise",
        description: "Crystal clear waters and white sand",
        imageUrl:
          "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format",
      },
      {
        id: 3,
        title: "City Skyline",
        description: "Urban landscape at night with bright lights",
        imageUrl:
          "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&auto=format",
      },
    ]);
  }, []);

  const handleAddPhoto = () => {
    form.resetFields();
    setFileList([]);
    setImageUrl("");
    setCurrentPhoto({
      id: Date.now(),
      title: "",
      description: "",
      imageUrl: "",
    });
    setModalType("add");
    setModalOpen(true);
  };

  const handleEditPhoto = (photo) => {
    form.setFieldsValue({
      title: photo.title,
      description: photo.description,
      imageUrl: photo.imageUrl,
    });
    setImageUrl(photo.imageUrl);
    setFileList(
      photo.imageUrl
        ? [
            {
              uid: "-1",
              name: "image.png",
              status: "done",
              url: photo.imageUrl,
            },
          ]
        : []
    );
    setCurrentPhoto({ ...photo });
    setModalType("edit");
    setModalOpen(true);
  };

  const handleDeletePhoto = (photoId) => {
    setPhotos(photos.filter((p) => p.id !== photoId));
    message.success("Photo deleted successfully");
  };

  const handlePreviewPhoto = (photo) => {
    setCurrentPhoto({ ...photo });
    setPreviewModalOpen(true);
  };

  const handleSavePhoto = (values) => {
    const updatedPhoto = {
      ...currentPhoto,
      ...values,
      imageUrl: imageUrl || values.imageUrl,
    };

    if (modalType === "add") {
      setPhotos([...photos, updatedPhoto]);
      message.success("Photo added successfully");
    } else if (modalType === "edit") {
      setPhotos(
        photos.map((p) => (p.id === currentPhoto.id ? updatedPhoto : p))
      );
      message.success("Photo updated successfully");
    }
    setModalOpen(false);
  };

  const handleCancel = () => {
    setModalOpen(false);
    form.resetFields();
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setImageUrl("");
    },
    beforeUpload: (file) => {
      // You would typically upload to a server here
      // For this example, we'll use a FileReader to get a data URL
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageUrl(String(reader.result));
      };
      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Photo Gallery</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPhoto}>
          Add Photo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            cover={
              <div
                className="h-48 bg-cover bg-center cursor-pointer"
                style={{ backgroundImage: `url(${photo.imageUrl})` }}
                onClick={() => handlePreviewPhoto(photo)}
              />
            }
            actions={[
              <EyeOutlined
                key="preview"
                onClick={() => handlePreviewPhoto(photo)}
              />,
              <EditOutlined
                key="edit"
                onClick={() => handleEditPhoto(photo)}
              />,
              <Popconfirm
                title="Delete this photo?"
                description="Are you sure you want to delete this photo?"
                onConfirm={() => handleDeletePhoto(photo.id)}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined key="delete" />
              </Popconfirm>,
            ]}
          >
            <Card.Meta title={photo.title} description={photo.description} />
          </Card>
        ))}
      </div>

      {/* Add/Edit Photo Modal */}
      <Modal
        title={modalType === "add" ? "Add New Photo" : "Edit Photo"}
        open={modalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSavePhoto}
          initialValues={currentPhoto}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="upload"
            label="Upload Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          {(imageUrl ||
            (currentPhoto && currentPhoto.imageUrl && !fileList.length)) && (
            <div className="mb-4">
              <p className="mb-2">Preview:</p>
              <img
                src={imageUrl || currentPhoto?.imageUrl}
                alt="Preview"
                className="mx-auto"
                style={{ maxWidth: "100%", maxHeight: "300px" }}
              />
            </div>
          )}

          <Form.Item className="flex justify-end">
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={null}
        width={800}
        centered
      >
        <div className="flex flex-col items-center">
          <img
            src={currentPhoto?.imageUrl}
            alt={currentPhoto?.title}
            style={{ maxWidth: "100%", maxHeight: "500px" }}
          />
          <Title level={3} className="mt-4">
            {currentPhoto?.title}
          </Title>
          <Paragraph>{currentPhoto?.description}</Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default Gallery;
