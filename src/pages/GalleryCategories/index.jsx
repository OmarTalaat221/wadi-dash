import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
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
  Table,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/base_url";

const { Title } = Typography;

const GalleryCategories = () => {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(null);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/gallary/categories/select_category.php`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        setCategories(response.data.message || []);
      } else {
        message.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add category
  const handleAddCategory = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        category: values.category.trim(),
      };

      console.log("Adding category with payload:", payload);

      const response = await axios.post(
        `${base_url}/admin/gallary/categories/add_category.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        message.success("Category added successfully!");
        await fetchCategories();
        setModalOpen(false);
        form.resetFields();
      } else {
        throw new Error(response.data?.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add category. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Edit category
  const handleEditCategory = async (values) => {
    if (!currentCategory) return;

    setSubmitting(true);
    try {
      const payload = {
        category_id: parseInt(currentCategory.category_id),
        category: values.category.trim(),
      };

      console.log("Updating category with payload:", payload);

      const response = await axios.post(
        `${base_url}/admin/gallary/categories/edit_cat.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        message.success("Category updated successfully!");
        await fetchCategories();
        setEditModalOpen(false);
        editForm.resetFields();
        setCurrentCategory(null);
      } else {
        throw new Error(response.data?.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update category. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/gallary/categories/delete_category.php`,
        {
          category_id: parseInt(categoryId),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        message.success("Category deleted successfully");
        await fetchCategories();
      } else {
        throw new Error(response.data?.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete category. Please try again."
      );
    }
  };

  // Toggle visibility
  const handleToggleVisibility = async (category) => {
    setToggling(category.category_id);
    try {
      const response = await axios.post(
        `${base_url}/admin/gallary/categories/toggle_image.php`,
        {
          category_id: parseInt(category.category_id),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        const isCurrentlyHidden = category.hidden === "1";
        const actionText = isCurrentlyHidden ? "shown" : "hidden";
        message.success(`Category ${actionText} successfully`);
        await fetchCategories();
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

  const handleOpenEdit = (category) => {
    setCurrentCategory(category);
    editForm.setFieldsValue({
      category: category.category,
    });
    setEditModalOpen(true);
  };

  const getVisibilityInfo = (hidden) => {
    const isHidden = hidden === "1";
    return {
      color: isHidden ? "red" : "green",
      text: isHidden ? "Hidden" : "Visible",
      icon: isHidden ? EyeInvisibleOutlined : EyeOutlined,
      tooltipText: isHidden ? "Show Category" : "Hide Category",
    };
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "category_id",
      key: "category_id",
      width: 80,
      sorter: (a, b) => parseInt(a.category_id) - parseInt(b.category_id),
    },
    {
      title: "Category Name",
      dataIndex: "category",
      key: "category",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{text}</span>
          {record.hidden === "1" && (
            <Tag color="red" className="ml-2">
              Hidden
            </Tag>
          )}
        </div>
      ),
      sorter: (a, b) => a.category.localeCompare(b.category),
    },
    {
      title: "Status",
      dataIndex: "hidden",
      key: "hidden",
      width: 120,
      render: (hidden) => {
        const info = getVisibilityInfo(hidden);
        return <Tag color={info.color}>{info.text}</Tag>;
      },
      filters: [
        { text: "Visible", value: "0" },
        { text: "Hidden", value: "1" },
      ],
      onFilter: (value, record) => record.hidden === value,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => {
        const visibilityInfo = getVisibilityInfo(record.hidden);
        const VisibilityIcon = visibilityInfo.icon;

        return (
          <Space>
            <Tooltip title="Edit Category">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleOpenEdit(record)}
              />
            </Tooltip>

            <Tooltip title={visibilityInfo.tooltipText}>
              <Button
                type="text"
                icon={<VisibilityIcon />}
                loading={toggling === record.category_id}
                onClick={() => handleToggleVisibility(record)}
              />
            </Tooltip>

            <Popconfirm
              title="Delete this category?"
              description="Are you sure you want to delete this category? This action cannot be undone."
              onConfirm={() => handleDeleteCategory(record.category_id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete Category">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Gallery Categories</Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchCategories}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Add Category
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="category_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categories`,
          }}
          locale={{
            emptyText: (
              <div className="py-8">
                <p className="text-gray-500 mb-4">No categories found</p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalOpen(true)}
                >
                  Add Your First Category
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* Add Category Modal */}
      <Modal
        title="Add New Category"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCategory}
          className="py-4"
        >
          <Form.Item
            name="category"
            label="Category Name"
            rules={[
              { required: true, message: "Please enter category name" },
              {
                min: 2,
                message: "Category name must be at least 2 characters",
              },
              {
                max: 100,
                message: "Category name must be less than 100 characters",
              },
            ]}
          >
            <Input
              placeholder="Enter category name (e.g., Egypt Tour)"
              showCount
              maxLength={100}
              autoFocus
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="flex justify-end">
              <Button
                onClick={() => {
                  setModalOpen(false);
                  form.resetFields();
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Add Category
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title="Edit Category"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          editForm.resetFields();
          setCurrentCategory(null);
        }}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditCategory}
          className="py-4"
        >
          <Form.Item
            name="category"
            label="Category Name"
            rules={[
              { required: true, message: "Please enter category name" },
              {
                min: 2,
                message: "Category name must be at least 2 characters",
              },
              {
                max: 100,
                message: "Category name must be less than 100 characters",
              },
            ]}
          >
            <Input
              placeholder="Enter category name"
              showCount
              maxLength={100}
              autoFocus
            />
          </Form.Item>

          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">
              Category ID:{" "}
              <span className="font-medium">
                {currentCategory?.category_id}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Created:{" "}
              <span className="font-medium">
                {currentCategory?.created_at &&
                  new Date(currentCategory.created_at).toLocaleString()}
              </span>
            </p>
          </div>

          <Form.Item className="mb-0">
            <Space className="flex justify-end">
              <Button
                onClick={() => {
                  setEditModalOpen(false);
                  editForm.resetFields();
                  setCurrentCategory(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Update Category
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GalleryCategories;
