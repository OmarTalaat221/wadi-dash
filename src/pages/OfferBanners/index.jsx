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
  Select,
  Avatar,
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  PercentageOutlined,
  GiftOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/base_url";
import { uploadImageToServer } from "../../hooks/uploadImage";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const OfferBanners = () => {
  const [banners, setBanners] = useState([]);
  const [tours, setTours] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toursLoading, setToursLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch tours
  const fetchTours = async () => {
    setToursLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/user/tours/select_tours.php`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        setTours(response.data.message);
      } else {
        message.error("Failed to fetch tours");
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
      message.error("Failed to load tours. Please try again.");
    } finally {
      setToursLoading(false);
    }
  };

  // Fetch offer banners
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/offer_panners/select_offer_panners.php`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        setBanners(response.data.message);
      } else {
        message.error("Failed to fetch offer banners");
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to load banners. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchTours();
  }, []);

  // Get first image from image string
  const getFirstImage = (imageStr) => {
    if (!imageStr) return "https://via.placeholder.com/100x60?text=No+Image";
    return imageStr.split("//CAMP//")[0].trim();
  };

  // Get tour by ID
  const getTourById = (tourId) => {
    return tours.find((tour) => tour.id === String(tourId));
  };

  const handleAddBanner = () => {
    setFileList([]);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEditBanner = (banner) => {
    setCurrentBanner(banner);
    setEditFileList([]);
    editForm.setFieldsValue({
      panner_title: banner.panner_title,
      offer_percentage: banner.offer_percentage,
      offer_descreption: banner.offer_descreption,
      tour_id: banner.tour_id ? String(banner.tour_id) : undefined,
    });
    setEditModalOpen(true);
  };

  const handleDeleteBanner = async (bannerId) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/offer_panners/delete_offer_panners.php`,
        {
          panner_id: parseInt(bannerId),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        message.success("Offer banner deleted successfully");
        await fetchBanners();
      } else {
        throw new Error(response.data?.message || "Failed to delete banner");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete banner. Please try again."
      );
    }
  };

  const handlePreviewBanner = (banner) => {
    setCurrentBanner({ ...banner });
    setPreviewModalOpen(true);
  };

  const handleUploadBanner = async (values) => {
    if (fileList.length === 0) {
      message.error("Please select a banner image");
      return;
    }

    setUploading(true);
    try {
      const file = fileList[0].originFileObj || fileList[0];

      // Upload image to server
      message.loading("Uploading banner image...", 0);
      const imageUrl = await uploadImageToServer(file);
      message.destroy();

      if (!imageUrl) {
        throw new Error("No image URL returned from upload");
      }

      // Add banner to database
      const response = await axios.post(
        `${base_url}/admin/offer_panners/add_offer_panners.php`,
        {
          panner_img: imageUrl,
          panner_title: values.panner_title.trim(),
          offer_percentage: values.offer_percentage.trim(),
          offer_descreption: values.offer_descreption.trim(),
          tour_id: values.tour_id ? parseInt(values.tour_id) : null,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        message.success("Offer banner added successfully!");
        await fetchBanners();
        setModalOpen(false);
        setFileList([]);
        form.resetFields();
      } else {
        throw new Error(response.data?.message || "Failed to add banner");
      }
    } catch (error) {
      message.destroy();
      console.error("Error uploading banner:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload banner. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateBanner = async (values) => {
    setUploading(true);
    try {
      let imageUrl = currentBanner.panner_img;

      // If new image selected, upload it
      if (editFileList.length > 0) {
        const file = editFileList[0].originFileObj || editFileList[0];
        message.loading("Uploading banner image...", 0);
        imageUrl = await uploadImageToServer(file);
        message.destroy();

        if (!imageUrl) {
          throw new Error("No image URL returned from upload");
        }
      }

      // Update banner in database
      const response = await axios.post(
        `${base_url}/admin/offer_panners/update_offer_panner.php`,
        {
          panner_id: currentBanner.panner_id,
          panner_img: imageUrl,
          panner_title: values.panner_title.trim(),
          offer_percentage: values.offer_percentage.trim(),
          offer_descreption: values.offer_descreption.trim(),
          tour_id: values.tour_id ? parseInt(values.tour_id) : null,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        message.success("Offer banner updated successfully!");
        await fetchBanners();
        setEditModalOpen(false);
        setEditFileList([]);
        editForm.resetFields();
      } else {
        throw new Error(response.data?.message || "Failed to update banner");
      }
    } catch (error) {
      message.destroy();
      console.error("Error updating banner:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update banner. Please try again."
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

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditFileList([]);
    editForm.resetFields();
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
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
      return false;
    },
    fileList,
    listType: "picture-card",
    accept: "image/*",
  };

  const editUploadProps = {
    onRemove: () => {
      setEditFileList([]);
    },
    beforeUpload: (file) => {
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

      setEditFileList([file]);
      return false;
    },
    fileList: editFileList,
    listType: "picture-card",
    accept: "image/*",
  };

  const handleRefresh = () => {
    fetchBanners();
    fetchTours();
  };

  // Custom Tour Select Option Render
  const renderTourOption = (tour) => (
    <div className="flex items-center gap-3 py-1">
      <img
        src={getFirstImage(tour.image)}
        alt={tour.title}
        className="w-12 h-8 object-cover rounded"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/48x32?text=Tour";
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-800 truncate text-sm">
          {tour.title}
        </div>
        <div className="text-xs text-gray-500">
          {tour.price_currency}
          {tour.price_current} • {tour.duration_days} days
        </div>
      </div>
    </div>
  );

  // Tour Select Component
  const TourSelect = ({ value, onChange, placeholder }) => (
    <Select
      showSearch
      allowClear
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Select a tour to link with this offer"}
      loading={toursLoading}
      optionFilterProp="children"
      filterOption={(input, option) => {
        const tour = tours.find((t) => t.id === option.value);
        return tour?.title?.toLowerCase().includes(input.toLowerCase());
      }}
      optionLabelProp="label"
      size="large"
      className="w-full"
      dropdownRender={(menu) => (
        <>
          <div className="px-3 py-2 bg-gray-50 border-b">
            <Text type="secondary" className="text-xs">
              <GlobalOutlined className="mr-1" />
              Select a tour to link with this offer banner
            </Text>
          </div>
          {menu}
        </>
      )}
      notFoundContent={
        toursLoading ? (
          <div className="text-center py-4">
            <Spin size="small" />
            <p className="text-gray-500 mt-2">Loading tours...</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <GlobalOutlined className="text-3xl text-gray-300" />
            <p className="text-gray-500 mt-2">No tours found</p>
          </div>
        )
      }
    >
      {tours.map((tour) => (
        <Option
          key={tour.id}
          value={tour.id}
          label={
            <div className="flex items-center gap-2">
              <img
                src={getFirstImage(tour.image)}
                alt=""
                className="w-6 h-4 object-cover rounded"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/24x16?text=T";
                }}
              />
              <span className="truncate">{tour.title}</span>
            </div>
          }
        >
          {renderTourOption(tour)}
        </Option>
      ))}
    </Select>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>
          <GiftOutlined className="mr-2" />
          Offer Banners
        </Title>
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
            onClick={handleAddBanner}
          >
            Add Offer Banner
          </Button>
        </Space>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading offer banners..." />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12">
          <GiftOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
          <p className="text-gray-500 mb-4 mt-4">No offer banners yet</p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddBanner}
          >
            Add Your First Offer Banner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {banners.map((banner) => {
            const linkedTour = getTourById(banner.tour_id);
            return (
              <Card
                key={banner.panner_id}
                hoverable
                cover={
                  <div
                    className="h-48 bg-cover bg-center cursor-pointer relative group"
                    style={{
                      backgroundImage: `url(${banner.panner_img})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    onClick={() => handlePreviewBanner(banner)}
                  >
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <EyeOutlined className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Tag color="orange" className="m-0">
                        <PercentageOutlined /> {banner.offer_percentage}
                      </Tag>
                    </div>
                    {linkedTour && (
                      <div className="absolute bottom-2 left-2 right-2 overflow-hidden">
                        <Tag
                          color="blue"
                          className="m-0 flex items-center gap-1 max-w-full"
                        >
                          <GlobalOutlined />
                          <span className="truncate">{linkedTour.title}</span>
                        </Tag>
                      </div>
                    )}
                  </div>
                }
                actions={[
                  <Tooltip title="Preview Banner" key="preview">
                    <EyeOutlined onClick={() => handlePreviewBanner(banner)} />
                  </Tooltip>,
                  <Tooltip title="Edit Banner" key="edit">
                    <EditOutlined onClick={() => handleEditBanner(banner)} />
                  </Tooltip>,
                  <Popconfirm
                    key="delete"
                    title="Delete this banner?"
                    description="Are you sure you want to delete this offer banner?"
                    onConfirm={() => handleDeleteBanner(banner.panner_id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="Delete Banner">
                      <DeleteOutlined className="text-red-500" />
                    </Tooltip>
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={
                    <Tooltip title={banner.panner_title}>
                      <div className="text-base font-semibold text-gray-900 truncate">
                        {banner.panner_title}
                      </div>
                    </Tooltip>
                  }
                  description={
                    <div>
                      <Tooltip title={banner.offer_descreption}>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {banner.offer_descreption}
                        </p>
                      </Tooltip>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        <Tag color="green">{banner.offer_percentage}</Tag>
                        <Text type="secondary" className="text-xs">
                          ID: {banner.panner_id}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Banner Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <GiftOutlined className="mr-2" />
            Add New Offer Banner
          </div>
        }
        open={modalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUploadBanner}
          className="py-4"
        >
          <Form.Item
            name="panner_title"
            label="Banner Title"
            rules={[
              {
                required: true,
                message: "Please enter a title for the banner",
              },
              { max: 100, message: "Title cannot exceed 100 characters" },
            ]}
          >
            <Input
              placeholder="e.g., Savings worldwide, Honeymoon Tour"
              showCount
              maxLength={100}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="offer_percentage"
            label="Offer Percentage"
            rules={[
              {
                required: true,
                message: "Please enter the offer percentage",
              },
              { max: 50, message: "Offer text cannot exceed 50 characters" },
            ]}
          >
            <Input
              placeholder="e.g., 20% Off, 50% Off, Enjoy 40% Off"
              prefix={<PercentageOutlined />}
              showCount
              maxLength={50}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="offer_descreption"
            label="Offer Description"
            rules={[
              {
                required: true,
                message: "Please enter the offer description",
              },
              {
                max: 200,
                message: "Description cannot exceed 200 characters",
              },
            ]}
          >
            <TextArea
              placeholder="e.g., Discover Great Deal, 4 Days In Switzerland"
              showCount
              maxLength={200}
              rows={3}
              size="large"
            />
          </Form.Item>

          {/* Tour Select */}
          <Form.Item
            name="tour_id"
            label={
              <span>
                <GlobalOutlined className="mr-1" />
                Link to Tour (Optional)
              </span>
            }
            tooltip="Select a tour to link with this offer banner. Users can click on the banner to view the tour."
          >
            <TourSelect placeholder="Search and select a tour..." />
          </Form.Item>

          <Divider />

          <Form.Item label="Banner Image" required>
            <Upload {...uploadProps}>
              {fileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Select Banner Image</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" className="text-xs mt-2 block">
              Recommended size: 1200x600px for best results
            </Text>
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="flex justify-end">
              <Button onClick={handleCancel} disabled={uploading} size="large">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                disabled={fileList.length === 0}
                icon={<PlusOutlined />}
                size="large"
              >
                {uploading ? "Uploading..." : "Add Offer Banner"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Banner Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <EditOutlined className="mr-2" />
            Edit Offer Banner
          </div>
        }
        open={editModalOpen}
        onCancel={handleEditCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateBanner}
          className="py-4"
        >
          <Form.Item
            name="panner_title"
            label="Banner Title"
            rules={[
              {
                required: true,
                message: "Please enter a title for the banner",
              },
              { max: 100, message: "Title cannot exceed 100 characters" },
            ]}
          >
            <Input
              placeholder="e.g., Savings worldwide, Honeymoon Tour"
              showCount
              maxLength={100}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="offer_percentage"
            label="Offer Percentage"
            rules={[
              {
                required: true,
                message: "Please enter the offer percentage",
              },
              { max: 50, message: "Offer text cannot exceed 50 characters" },
            ]}
          >
            <Input
              placeholder="e.g., 20% Off, 50% Off, Enjoy 40% Off"
              prefix={<PercentageOutlined />}
              showCount
              maxLength={50}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="offer_descreption"
            label="Offer Description"
            rules={[
              {
                required: true,
                message: "Please enter the offer description",
              },
              {
                max: 200,
                message: "Description cannot exceed 200 characters",
              },
            ]}
          >
            <TextArea
              placeholder="e.g., Discover Great Deal, 4 Days In Switzerland"
              showCount
              maxLength={200}
              rows={3}
              size="large"
            />
          </Form.Item>

          {/* Tour Select */}
          <Form.Item
            name="tour_id"
            label={
              <span>
                <GlobalOutlined className="mr-1" />
                Link to Tour (Optional)
              </span>
            }
            tooltip="Select a tour to link with this offer banner. Users can click on the banner to view the tour."
          >
            <TourSelect placeholder="Search and select a tour..." />
          </Form.Item>

          <Divider />

          <Form.Item label="Banner Image">
            <div className="mb-3">
              <Text type="secondary" className="text-sm">
                Current Image:
              </Text>
              <div className="mt-2 border rounded-lg overflow-hidden w-full max-w-xs">
                <img
                  src={currentBanner?.panner_img}
                  alt="Current banner"
                  className="w-full h-32 object-cover"
                />
              </div>
            </div>
            <Upload {...editUploadProps}>
              {editFileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Change Image (Optional)</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" className="text-xs mt-2 block">
              Leave empty to keep current image. Recommended size: 1200x600px
            </Text>
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="flex justify-end">
              <Button
                onClick={handleEditCancel}
                disabled={uploading}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                icon={<EditOutlined />}
                size="large"
              >
                {uploading ? "Updating..." : "Update Banner"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={
          <div className="text-center">
            <Title level={4} className="mb-1">
              {currentBanner?.panner_title}
            </Title>
            <Tag color="orange" className="text-base px-3 py-1">
              <PercentageOutlined /> {currentBanner?.offer_percentage}
            </Tag>
          </div>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button
            key="edit"
            icon={<EditOutlined />}
            onClick={() => {
              setPreviewModalOpen(false);
              handleEditBanner(currentBanner);
            }}
          >
            Edit
          </Button>,
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={900}
        centered
        destroyOnClose
      >
        <div className="flex flex-col items-center">
          <div className="w-full mb-4 rounded-lg overflow-hidden shadow-lg">
            <img
              src={currentBanner?.panner_img}
              alt={currentBanner?.panner_title || "Banner Preview"}
              style={{
                width: "100%",
                maxHeight: "60vh",
                objectFit: "cover",
              }}
            />
          </div>

          <div className="w-full bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
            <Space direction="vertical" size="middle" className="w-full">
              <div>
                <Text strong className="text-gray-700">
                  Banner Title:
                </Text>
                <Title level={5} className="mt-1 mb-0">
                  {currentBanner?.panner_title}
                </Title>
              </div>

              <div>
                <Text strong className="text-gray-700">
                  Offer:
                </Text>
                <div className="mt-1">
                  <Tag color="green" className="text-lg px-4 py-2">
                    {currentBanner?.offer_percentage}
                  </Tag>
                </div>
              </div>

              <div>
                <Text strong className="text-gray-700">
                  Description:
                </Text>
                <p className="text-base text-gray-800 mt-1">
                  {currentBanner?.offer_descreption}
                </p>
              </div>

              {/* Linked Tour Preview */}
              {currentBanner?.tour_id && getTourById(currentBanner.tour_id) && (
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <Text
                    strong
                    className="text-gray-700 flex items-center gap-2 mb-3"
                  >
                    <GlobalOutlined className="text-blue-500" />
                    Linked Tour:
                  </Text>
                  <div className="flex items-center gap-4">
                    <img
                      src={getFirstImage(
                        getTourById(currentBanner.tour_id)?.image
                      )}
                      alt="Tour"
                      className="w-20 h-14 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/80x56?text=Tour";
                      }}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getTourById(currentBanner.tour_id)?.title}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>
                          {getTourById(currentBanner.tour_id)?.price_currency}
                          {getTourById(currentBanner.tour_id)?.price_current}
                        </span>
                        <span>•</span>
                        <span>
                          {getTourById(currentBanner.tour_id)?.duration_days}{" "}
                          days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-orange-200">
                <Text type="secondary" className="text-sm">
                  Banner ID: {currentBanner?.panner_id}
                </Text>
                <Button
                  type="link"
                  onClick={() =>
                    window.open(currentBanner?.panner_img, "_blank")
                  }
                  icon={<EyeOutlined />}
                >
                  View Original Image
                </Button>
              </div>
            </Space>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OfferBanners;
