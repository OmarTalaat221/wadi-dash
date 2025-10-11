import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Table,
  Tag,
  Space,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/base_url";

const { Option } = Select;

const SiteInfo = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchContactInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/contact/select_contact.php`
      );

      if (response.data.status === "success") {
        setData(response.data.message);
      } else {
        message.error("Failed to fetch contact information");
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
      message.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  // Add new contact
  const handleAdd = async (values) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/contact/add_contact.php`,
        {
          value: values.value,
          type: values.type?.toLowerCase(),
        }
      );

      if (response.data.status === "success") {
        message.success("Contact information added successfully");
        setIsAddModalVisible(false);
        addForm.resetFields();
        fetchContactInfo();
      } else {
        message.error(
          response.data.message || "Failed to add contact information"
        );
      }
    } catch (error) {
      console.error("Error adding contact:", error);
      message.error("Error adding contact information");
    }
  };

  // Edit contact
  const handleEdit = async (values) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/contact/edit_contact.php`,
        {
          id: editingRecord.id,
          value: values.value,
        }
      );

      if (response.data.status === "success") {
        message.success("Contact information updated successfully");
        setIsEditModalVisible(false);
        setEditingRecord(null);
        editForm.resetFields();
        fetchContactInfo();
      } else {
        message.error(
          response.data.message || "Failed to update contact information"
        );
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      message.error("Error updating contact information");
    }
  };

  // Toggle visibility
  const handleToggleVisibility = async (id) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/contact/toggle_contact.php`,
        {
          id,
        }
      );

      if (response.data.status === "success") {
        message.success("Visibility updated successfully");
        fetchContactInfo();
      } else {
        message.error(response.data.message || "Failed to toggle visibility");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      message.error("Error updating visibility");
    }
  };

  // Open edit modal
  const openEditModal = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      value: record.value,
    });
    setIsEditModalVisible(true);
  };

  // Get icon based on type
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "phone":
        return <PhoneOutlined className="text-blue-500" />;
      case "email":
        return <MailOutlined className="text-green-500" />;
      case "location":
        return <EnvironmentOutlined className="text-red-500" />;
      default:
        return null;
    }
  };

  // Get color based on type
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "phone":
        return "blue";
      case "email":
        return "green";
      case "location":
        return "orange";
      default:
        return "default";
    }
  };

  // Table columns
  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(type)}
          <Tag color={getTypeColor(type)}>{type.toUpperCase()}</Tag>
        </div>
      ),
      filters: [
        { text: "Phone", value: "Phone" },
        { text: "Email", value: "Email" },
        { text: "Location", value: "Location" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text, record) => (
        <div>
          <p className="font-medium">{text}</p>
          {/* {record.type === "Email" && (
            <a
              href={`mailto:${text}`}
              className="text-xs text-blue-500 hover:underline"
            >
              Send Email
            </a>
          )}
          {record.type === "Phone" && (
            <a
              href={`tel:${text}`}
              className="text-xs text-blue-500 hover:underline"
            >
              Call Now
            </a>
          )} */}
        </div>
      ),
    },
    {
      title: "Visibility",
      dataIndex: "hidden",
      key: "hidden",
      width: 120,
      align: "center",
      render: (hidden) => (
        <Tag color={hidden === "0" ? "success" : "default"}>
          {hidden === "0" ? (
            <>
              <EyeOutlined /> Visible
            </>
          ) : (
            <>
              <EyeInvisibleOutlined /> Hidden
            </>
          )}
        </Tag>
      ),
      filters: [
        { text: "Visible", value: "0" },
        { text: "Hidden", value: "1" },
      ],
      onFilter: (value, record) => record.hidden === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      align: "center",
      render: (text, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title={`${record.hidden === "0" ? "Hide" : "Show"} this contact?`}
            description={`Are you sure you want to ${
              record.hidden === "0" ? "hide" : "show"
            } this contact information?`}
            onConfirm={() => handleToggleVisibility(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type={record.hidden === "0" ? "default" : "primary"}
              icon={
                record.hidden === "0" ? (
                  <EyeInvisibleOutlined />
                ) : (
                  <EyeOutlined />
                )
              }
              size="small"
            >
              {record.hidden === "0" ? "Hide" : "Show"}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Group data by type for summary cards
  const getStatistics = () => {
    const phones = data.filter((item) => item.type === "Phone");
    const emails = data.filter((item) => item.type === "Email");
    const locations = data.filter((item) => item.type === "Location");
    const visible = data.filter((item) => item.hidden === "0");

    return { phones, emails, locations, visible };
  };

  const stats = getStatistics();

  return (
    <div className="tabled">
      <Row gutter={[16, 16]} className="mb-4">
        {/* Statistics Cards */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <PhoneOutlined className="text-3xl text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{stats.phones.length}</p>
            <p className="text-gray-500">Phone Numbers</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <MailOutlined className="text-3xl text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.emails.length}</p>
            <p className="text-gray-500">Email Addresses</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <EnvironmentOutlined className="text-3xl text-red-500 mb-2" />
            <p className="text-2xl font-bold">{stats.locations.length}</p>
            <p className="text-gray-500">Locations</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <EyeOutlined className="text-3xl text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{stats.visible.length}</p>
            <p className="text-gray-500">Visible Items</p>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs="24" xl={24} className="!w-full">
          <Card
            bordered={false}
            className="!w-full mb-24"
            title={
              <div className="flex items-center justify-between">
                <span>Site Contact Information</span>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalVisible(true)}
                >
                  Add New Contact
                </Button>
              </div>
            }
          >
            <Table
              columns={columns}
              dataSource={data}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
              }}
              bordered
            />
          </Card>
        </Col>
      </Row>

      {/* Add Modal */}
      <Modal
        title="Add New Contact Information"
        visible={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          addForm.resetFields();
        }}
        footer={null}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Please select a type" }]}
          >
            <Select placeholder="Select contact type" size="large">
              <Option value="Phone">
                <PhoneOutlined /> Phone
              </Option>
              <Option value="Email">
                <MailOutlined /> Email
              </Option>
              <Option value="Location">
                <EnvironmentOutlined /> Location
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Value"
            name="value"
            rules={[
              { required: true, message: "Please enter the value" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const type = getFieldValue("type");
                  if (!value) return Promise.resolve();

                  if (type === "Email") {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                      return Promise.reject(
                        new Error("Please enter a valid email address")
                      );
                    }
                  }

                  if (type === "Phone") {
                    const phoneRegex = /^[0-9+\-\s()]+$/;
                    if (!phoneRegex.test(value)) {
                      return Promise.reject(
                        new Error("Please enter a valid phone number")
                      );
                    }
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter contact value"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsAddModalVisible(false);
                  addForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add Contact
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit ${editingRecord?.type} Information`}
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingRecord(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 mb-1">Type</p>
            <Tag color={getTypeColor(editingRecord?.type)}>
              {editingRecord?.type}
            </Tag>
          </div>

          <Form.Item
            label="Value"
            name="value"
            rules={[
              { required: true, message: "Please enter the value" },
              () => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();

                  if (editingRecord?.type === "Email") {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                      return Promise.reject(
                        new Error("Please enter a valid email address")
                      );
                    }
                  }

                  if (editingRecord?.type === "Phone") {
                    const phoneRegex = /^[0-9+\-\s()]+$/;
                    if (!phoneRegex.test(value)) {
                      return Promise.reject(
                        new Error("Please enter a valid phone number")
                      );
                    }
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter contact value"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsEditModalVisible(false);
                  setEditingRecord(null);
                  editForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Contact
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SiteInfo;
