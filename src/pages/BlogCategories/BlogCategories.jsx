import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  Modal,
  message,
  Tag,
  Form,
  Input,
  Switch,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import DataTable from "../../layout/DataTable";
import axios from "axios";
import dayjs from "dayjs";
import { base_url } from "../../utils/base_url";
import { TbListDetails } from "react-icons/tb";

const BlogCategories = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [rowData, setRowData] = useState(null);

  // Modals
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Form instances
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Loading states for actions
  const [actionLoading, setActionLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState({});

  // ============================================
  // Fetch Categories
  // ============================================
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/admin_blogs/select_blog_categories.php`
      );

      if (response.data.status === "success") {
        const categories = response.data.message || response.data.data || [];
        setData(categories);
        setFilteredData(categories);
      } else {
        message.error(response.data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ============================================
  // Add Category
  // ============================================
  const handleAddCategory = async (values) => {
    setActionLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/admin_blogs/add_blog_category.php`,
        {
          category_name: values.category_name,
        }
      );

      if (response.data.status === "success") {
        message.success("Category added successfully!");
        setIsAddModalVisible(false);
        addForm.resetFields();
        fetchCategories();
      } else {
        message.error(response.data.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      message.error("Error adding category");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // Edit Category
  // ============================================
  const handleEditCategory = async (values) => {
    setActionLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/admin_blogs/edit_blog_category.php`,
        {
          category_id: rowData.category_id,
          category_name: values.category_name,
        }
      );

      if (response.data.status === "success") {
        message.success("Category updated successfully!");
        setIsEditModalVisible(false);
        editForm.resetFields();
        fetchCategories();
      } else {
        message.error(response.data.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      message.error("Error updating category");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // Toggle Category Visibility
  // ============================================
  const handleToggleCategory = async (categoryId) => {
    setToggleLoading((prev) => ({ ...prev, [categoryId]: true }));
    try {
      const response = await axios.post(
        `${base_url}/admin/admin_blogs/toggle_category.php`,
        {
          category_id: categoryId,
        }
      );

      if (response.data.status === "success") {
        message.success("Category visibility toggled!");
        fetchCategories();
      } else {
        message.error(response.data.message || "Failed to toggle category");
      }
    } catch (error) {
      console.error("Error toggling category:", error);
      message.error("Error toggling category");
    } finally {
      setToggleLoading((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  // ============================================
  // Open Edit Modal
  // ============================================
  const openEditModal = (record) => {
    setRowData(record);
    editForm.setFieldsValue({
      category_name: record.category_name,
      hidden:
        record.hidden === 1 || record.hidden === "1" || record.hidden === true,
    });
    setIsEditModalVisible(true);
  };

  // ============================================
  // Format Date
  // ============================================
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return dayjs(date).format("YYYY/MM/DD HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  // ============================================
  // Search Handler
  // ============================================
  const handleSearch = (searchValue) => {
    if (!searchValue) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((item) =>
      item.category_name?.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // ============================================
  // Table Headers
  // ============================================
  const headers = [
    {
      title: "#",
      dataIndex: "category_id",
      key: "category_id",
      width: 70,
      render: (text, record, index) => (
        <div className="font-semibold text-gray-600">#{index + 1}</div>
      ),
    },
    {
      title: "Category Name",
      dataIndex: "category_name",
      key: "category_name",
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FolderOutlined className="text-blue-600" />
          </div>
          <span className="font-medium text-gray-800">{text}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "hidden",
      key: "hidden",
      width: 120,
      render: (hidden) => {
        const isHidden = hidden === 1 || hidden === "1" || hidden === true;
        return isHidden ? (
          <Tag
            icon={<EyeInvisibleOutlined />}
            color="red"
            className="flex items-center gap-1 w-fit"
          >
            Hidden
          </Tag>
        ) : (
          <Tag
            icon={<EyeOutlined />}
            color="green"
            className="flex items-center gap-1 w-fit"
          >
            Visible
          </Tag>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (text) => (
        <div className="text-sm text-gray-600">{formatDate(text)}</div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 280,
      render: (text, record) => {
        const isHidden =
          record.hidden === 1 ||
          record.hidden === "1" ||
          record.hidden === true;
        return (
          <div className="flex gap-2">
            {/* View Details */}
            <Tooltip title="View Details">
              <Button
                type="primary"
                icon={<TbListDetails />}
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => {
                  setRowData(record);
                  setIsViewModalVisible(true);
                }}
              />
            </Tooltip>

            {/* Edit */}
            <Tooltip title="Edit Category">
              <Button
                type="default"
                icon={<EditOutlined />}
                className="border-orange-400 text-orange-500 hover:bg-orange-50"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>

            {/* Toggle Visibility */}
            <Tooltip title={isHidden ? "Show Category" : "Hide Category"}>
              <Button
                type="default"
                loading={toggleLoading[record.category_id]}
                icon={isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                className={
                  isHidden
                    ? "border-green-400 text-green-500 hover:bg-green-50"
                    : "border-red-400 text-red-500 hover:bg-red-50"
                }
                onClick={() => handleToggleCategory(record.category_id)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // ============================================
  // Statistics
  // ============================================
  const totalCategories = data.length;
  const visibleCategories = data.filter(
    (c) => c.hidden !== 1 && c.hidden !== "1" && c.hidden !== true
  ).length;
  const hiddenCategories = totalCategories - visibleCategories;

  return (
    <>
      <div className="tabled">
        <Row gutter={[24, 24]}>
          {/* Statistics Cards */}
          <Col xs={24} sm={8}>
            <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Total Categories</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalCategories}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <FolderOutlined className="!text-white text-xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm border-0 bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Visible</p>
                  <p className="text-3xl font-bold text-green-600">
                    {visibleCategories}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircleOutlined className="!text-white text-xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm border-0 bg-gradient-to-r from-red-50 to-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Hidden</p>
                  <p className="text-3xl font-bold text-red-600">
                    {hiddenCategories}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <CloseCircleOutlined className="!text-white text-xl" />
                </div>
              </div>
            </Card>
          </Col>

          {/* Main Table */}
          <Col xs={24}>
            <Card
              bordered={false}
              className="shadow-sm"
              title={
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <FolderOutlined className="!text-white text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold m-0">
                        Blog Categories
                      </h2>
                      <p className="text-gray-500 text-sm m-0">
                        Manage your blog categories
                      </p>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      addForm.resetFields();
                      setIsAddModalVisible(true);
                    }}
                  >
                    Add Category
                  </Button>
                </div>
              }
            >
              <DataTable
                loading={loading}
                addBtn={false}
                searchPlaceholder="Search categories..."
                table={{ header: headers, rows: filteredData }}
                bordered={true}
                onSearchChabnge={(e) => handleSearch(e.target.value)}
                onAddClick={() => {}}
                btnText=""
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* ============================================ */}
      {/* View Details Modal */}
      {/* ============================================ */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FolderOutlined className="text-blue-500" />
            <span>Category Details</span>
          </div>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            className="bg-blue-500"
            onClick={() => {
              setIsViewModalVisible(false);
              openEditModal(rowData);
            }}
          >
            Edit Category
          </Button>,
        ]}
        width={600}
      >
        {rowData && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Category ID</p>
                  <p className="font-bold text-lg text-blue-600">
                    #{rowData.category_id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {rowData.hidden === 1 ||
                  rowData.hidden === "1" ||
                  rowData.hidden === true ? (
                    <Tag icon={<EyeInvisibleOutlined />} color="red">
                      Hidden
                    </Tag>
                  ) : (
                    <Tag icon={<EyeOutlined />} color="green">
                      Visible
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            {/* Category Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 border-b pb-2 flex items-center">
                <FolderOutlined className="mr-2 text-blue-500" />
                Category Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Category Name</p>
                  <p className="font-semibold text-lg">
                    {rowData.category_name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Created At</p>
                    <p className="font-semibold">
                      {formatDate(rowData.created_at)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Updated At</p>
                    <p className="font-semibold">
                      {formatDate(rowData.updated_at) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-600">
                Quick Actions
              </h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="primary"
                  className={
                    rowData.hidden === 1 ||
                    rowData.hidden === "1" ||
                    rowData.hidden === true
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-orange-500 hover:bg-orange-600"
                  }
                  icon={
                    rowData.hidden === 1 ||
                    rowData.hidden === "1" ||
                    rowData.hidden === true ? (
                      <EyeOutlined />
                    ) : (
                      <EyeInvisibleOutlined />
                    )
                  }
                  onClick={() => {
                    handleToggleCategory(rowData.category_id);
                    setIsViewModalVisible(false);
                  }}
                >
                  {rowData.hidden === 1 ||
                  rowData.hidden === "1" ||
                  rowData.hidden === true
                    ? "Show Category"
                    : "Hide Category"}
                </Button>
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsViewModalVisible(false);
                    openEditModal(rowData);
                  }}
                >
                  Edit Category
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================ */}
      {/* Add Category Modal */}
      {/* ============================================ */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-green-500" />
            <span>Add New Category</span>
          </div>
        }
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          addForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddCategory}
          initialValues={{ hidden: false }}
          className="mt-4"
        >
          <Form.Item
            label="Category Name"
            name="category_name"
            rules={[
              { required: true, message: "Please enter category name" },
              {
                min: 2,
                message: "Category name must be at least 2 characters",
              },
            ]}
          >
            <Input
              placeholder="Enter category name"
              size="large"
              prefix={<FolderOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={() => {
                setIsAddModalVisible(false);
                addForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={actionLoading}
              className="bg-blue-500 hover:bg-blue-600"
              icon={<PlusOutlined />}
            >
              Add Category
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ============================================ */}
      {/* Edit Category Modal */}
      {/* ============================================ */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-orange-500" />
            <span>Edit Category</span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditCategory}
          className="mt-4"
        >
          {/* Category ID Display */}
          {rowData && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-500 mb-1">Category ID</p>
              <p className="font-bold text-blue-600">#{rowData.category_id}</p>
            </div>
          )}

          <Form.Item
            label="Category Name"
            name="category_name"
            rules={[
              { required: true, message: "Please enter category name" },
              {
                min: 2,
                message: "Category name must be at least 2 characters",
              },
            ]}
          >
            <Input
              placeholder="Enter category name"
              size="large"
              prefix={<FolderOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={() => {
                setIsEditModalVisible(false);
                editForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={actionLoading}
              className="bg-orange-500 hover:bg-orange-600"
              icon={<EditOutlined />}
            >
              Update Category
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default BlogCategories;
