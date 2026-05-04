// pages/ActivityCategories/ActivityCategories.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Tooltip,
  Popconfirm,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/base_url";
import { useNavigate } from "react-router-dom";

function ActivityCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm] = Form.useForm();

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm] = Form.useForm();

  // ── Fetch Categories ──
  const fetchCategories = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/activities/select_activity_categories.php`
      );
      if (response.data?.status === "success") {
        setCategories(response.data.message || []);
      } else {
        message.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── Add Category ──
  const handleAdd = async (values) => {
    setAddLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/activities/add_activity_category.php`,
        { category_name: values.category_name.trim() },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.status === "success") {
        message.success(response.data.message || "Category added successfully");
        setIsAddOpen(false);
        addForm.resetFields();
        fetchCategories(false);
      } else if (response.data?.status === "found") {
        message.warning(response.data.message || "Category already exists");
      } else {
        throw new Error("Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      message.error("Failed to add category");
    } finally {
      setAddLoading(false);
    }
  };

  // ── Edit Category ──
  const openEditModal = (category) => {
    setEditingCategory(category);
    editForm.setFieldsValue({
      category_name: category.category_name,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (values) => {
    if (!editingCategory) return;
    setEditLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/activities/edit_activity_category.php`,
        {
          category_id: editingCategory.category_id,
          category_name: values.category_name.trim(),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.status === "success") {
        message.success("Category updated successfully");
        setIsEditOpen(false);
        setEditingCategory(null);
        editForm.resetFields();
        fetchCategories(false);
      } else if (response.data?.status === "found") {
        message.warning(
          response.data.message || "Another category with same name exists"
        );
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      message.error("Failed to update category");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Toggle Visibility ──
  const handleToggle = async (category) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/activities/toggle_activity_category.php`,
        { category_id: category.category_id },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.status === "success") {
        const isHidden = category.hidden === "0" || category.hidden === 0;
        message.success(
          isHidden ? "Category hidden successfully" : "Category visible now"
        );
        fetchCategories(false);
      } else {
        throw new Error("Failed to toggle category");
      }
    } catch (error) {
      console.error("Error toggling category:", error);
      message.error("Failed to toggle category visibility");
    }
  };

  // ── Delete Category ──
  const handleDelete = async (category) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/activities/delete_activity_category.php`,
        { category_id: category.category_id },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.status === "success") {
        message.success("Category deleted successfully");
        fetchCategories(false);
      } else {
        throw new Error(response.data?.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error(
        error?.response?.data?.message || "Failed to delete category"
      );
    }
  };

  // ── Table Columns ──
  const columns = [
    {
      title: "ID",
      dataIndex: "category_id",
      key: "category_id",
      width: 80,
      sorter: (a, b) => a.category_id - b.category_id,
    },
    {
      title: "Category Name",
      dataIndex: "category_name",
      key: "category_name",
      sorter: (a, b) => a.category_name?.localeCompare(b.category_name),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Tag color={record.hidden === "0" ? "green" : "red"}>
          {record.hidden === "0" ? "Visible" : "Hidden"}
        </Tag>
      ),
    },
    {
      title: "Visibility",
      key: "visibility",
      width: 130,
      render: (_, record) => (
        <Switch
          checked={record.hidden === "0"}
          onChange={() => handleToggle(record)}
          checkedChildren="Visible"
          unCheckedChildren="Hidden"
        />
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      sorter: (a, b) => a.created_at?.localeCompare(b.created_at),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              type="primary"
              size="small"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Category"
            description={`Are you sure you want to delete "${record.category_name}"?`}
            onConfirm={() => handleDelete(record)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button icon={<DeleteOutlined />} danger size="small" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/activities")}
          >
            Back to Activities
          </Button>
          <h2 className="text-xl font-semibold m-0">Activity Categories</h2>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            addForm.resetFields();
            setIsAddOpen(true);
          }}
        >
          Add Category
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          rowKey="category_id"
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} categories`,
            showQuickJumper: true,
          }}
          scroll={{ x: 800 }}
          bordered
          size="middle"
        />
      </div>

      {/* Add Modal */}
      <Modal
        title="Add Category"
        open={isAddOpen}
        onCancel={() => {
          if (!addLoading) setIsAddOpen(false);
        }}
        onOk={() => addForm.submit()}
        okText="Add"
        confirmLoading={addLoading}
        destroyOnClose
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAdd}
          preserve={false}
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
            <Input placeholder="e.g., Snorkeling, Diving, Hiking" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Category"
        open={isEditOpen}
        onCancel={() => {
          if (!editLoading) {
            setIsEditOpen(false);
            setEditingCategory(null);
          }
        }}
        onOk={() => editForm.submit()}
        okText="Update"
        confirmLoading={editLoading}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
          preserve={false}
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
            <Input placeholder="e.g., Snorkeling, Diving, Hiking" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ActivityCategories;
