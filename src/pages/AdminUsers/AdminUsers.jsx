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
  Select,
  Popconfirm,
  Tooltip,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CrownOutlined,
  TeamOutlined,
  ShopOutlined,
  SafetyOutlined,
  CopyOutlined,
  ReloadOutlined,
  KeyOutlined,
  PercentageOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import DataTable from "../../layout/DataTable";
import axios from "axios";
import dayjs from "dayjs";
import { base_url } from "../../utils/base_url";
import { TbListDetails } from "react-icons/tb";
import { ROLES } from "../../data/routes";

const { Option } = Select;
const { Text, Paragraph } = Typography;

const AdminUsers = () => {
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
  const [deleteLoading, setDeleteLoading] = useState({});

  // ============================================
  // Generate Invitation Code
  // ============================================
  const generateInvitationCode = (name) => {
    // Get first 3 characters from name (uppercase)
    const prefix = name
      ? name.replace(/\s/g, "").substring(0, 3).toUpperCase()
      : "USR";

    // Generate random alphanumeric string
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPart = "";
    for (let i = 0; i < 8; i++) {
      randomPart += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return `${prefix}${randomPart}`;
  };

  // ============================================
  // Regenerate Code for Edit Form
  // ============================================
  const regenerateCodeForEdit = () => {
    const currentName =
      editForm.getFieldValue("admin_name") || rowData?.admin_name;
    const newCode = generateInvitationCode(currentName);
    editForm.setFieldsValue({ invitation_code: newCode });
    message.success("New invitation code generated!");
  };

  // ============================================
  // Fetch Admins
  // ============================================
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/admin_users/select_admins.php`
      );

      if (response.data.status === "success") {
        const admins = response.data.message || response.data.data || [];
        setData(admins);
        setFilteredData(admins);
      } else {
        message.error(response.data.message || "Failed to fetch admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      message.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ============================================
  // Add Admin
  // ============================================
  const handleAddAdmin = async (values) => {
    setActionLoading(true);
    try {
      // Generate invitation code from name
      const invitationCode = generateInvitationCode(values.admin_name);

      const response = await axios.post(
        `${base_url}/admin/admin_users/add_new_admin.php`,
        {
          admin_email: values.admin_email,
          admin_password: values.admin_password,
          role: values.role,
          admin_name: values.admin_name,
          invitation_code: invitationCode,
          public_commission: parseFloat(values.public_commission) || 0,
          tour_commission: parseFloat(values.tour_commission) || 0,
        }
      );

      if (response.data.status === "success") {
        message.success("Admin added successfully!");
        setIsAddModalVisible(false);
        addForm.resetFields();
        fetchAdmins();
      } else {
        message.error(response.data.message || "Failed to add admin");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      message.error("Error adding admin");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // Edit Admin
  // ============================================
  const handleEditAdmin = async (values) => {
    setActionLoading(true);
    try {
      const payload = {
        admin_id: parseInt(rowData.admin_id),
        admin_name: values.admin_name,
        admin_email: values.admin_email,
        role: values.role,
        public_commission: parseFloat(values.public_commission) || 0,
        tour_commission: parseFloat(values.tour_commission) || 0,
      };

      // Only include password if it's provided
      if (values.admin_password) {
        payload.admin_password = values.admin_password;
      }

      // Include invitation_code (can be empty or custom)
      if (values.invitation_code !== undefined) {
        payload.invitation_code = values.invitation_code || "";
      }

      const response = await axios.post(
        `${base_url}/admin/admin_users/edit_admin.php`,
        payload
      );

      if (response.data.status === "success") {
        message.success("Admin updated successfully!");
        setIsEditModalVisible(false);
        editForm.resetFields();
        fetchAdmins();
      } else {
        message.error(response.data.message || "Failed to update admin");
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      message.error("Error updating admin");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // Delete Admin
  // ============================================
  const handleDeleteAdmin = async (adminId) => {
    setDeleteLoading((prev) => ({ ...prev, [adminId]: true }));
    try {
      const response = await axios.post(
        `${base_url}/admin/admin_users/delete_admin.php`,
        {
          admin_id: parseInt(adminId),
        }
      );

      if (response.data.status === "success") {
        message.success("Admin deleted successfully!");
        fetchAdmins();
      } else {
        message.error(response.data.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      message.error("Error deleting admin");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [adminId]: false }));
    }
  };

  // ============================================
  // Open Edit Modal
  // ============================================
  const openEditModal = (record) => {
    setRowData(record);
    editForm.setFieldsValue({
      admin_name: record.admin_name,
      admin_email: record.admin_email,
      role: record.role,
      admin_password: "",
      invitation_code: record.invitation_code?.trim() || "",
      public_commission: record.public_commission,
      tour_commission: record.tour_commission,
    });
    setIsEditModalVisible(true);
  };

  // ============================================
  // Copy to Clipboard
  // ============================================
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard!`);
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

  const getRoleConfig = (role) => {
    const configs = {
      super_admin: {
        color: "red",
        icon: <SafetyOutlined />,
        label: "Super Admin",
      },
      operation_manager: {
        color: "purple",
        icon: <CrownOutlined />,
        label: "Operation Manager",
      },
      accountant: {
        color: "green",
        icon: <DollarOutlined />,
        label: "Accountant",
      },
      customer_support: {
        color: "blue",
        icon: <CustomerServiceOutlined />,
        label: "Customer Support",
      },
      content_editor: {
        color: "orange",
        icon: <EditOutlined />,
        label: "Content Editor",
      },
    };
    return (
      configs[role] || { color: "gray", icon: <UserOutlined />, label: role }
    );
  };

  const handleSearch = (searchValue) => {
    if (!searchValue) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter(
      (item) =>
        item.admin_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.admin_email?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.role?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.invitation_code?.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // ============================================
  // Table Headers
  // ============================================
  const headers = [
    {
      title: "#",
      dataIndex: "admin_id",
      key: "admin_id",
      width: 70,
      render: (text, record, index) => (
        <div className="font-semibold text-gray-600">#{index + 1}</div>
      ),
    },
    {
      title: "Admin Info",
      key: "admin_info",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <UserOutlined className="!text-white text-lg" />
          </div>
          <div>
            <div className="font-semibold text-gray-800">
              {record.admin_name}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <MailOutlined className="text-xs" />
              {record.admin_email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => {
        const config = getRoleConfig(role);
        return (
          <Tag
            icon={config.icon}
            color={config.color}
            className="flex items-center gap-1 w-fit"
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Invitation Code",
      dataIndex: "invitation_code",
      key: "invitation_code",
      width: 180,
      render: (code) => (
        <div className="flex items-center gap-2">
          {code?.trim() ? (
            <>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                {code?.trim()}
              </code>
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(code?.trim(), "Invitation code")}
                className="text-gray-500 hover:text-blue-500"
              />
            </>
          ) : (
            <span className="text-gray-400 italic text-sm">No code</span>
          )}
        </div>
      ),
    },

    {
      title: "Public Commission",
      dataIndex: "public_commission",
      key: "public_commission",
      width: 150,
      render: (value) => (
        <Tag color="green" className="font-semibold">
          {value || 0}%
        </Tag>
      ),
    },
    {
      title: "Tour Commission",
      dataIndex: "tour_commission",
      key: "tour_commission",
      width: 150,
      render: (value) => (
        <Tag color="blue" className="font-semibold">
          {value || 0}%
        </Tag>
      ),
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
      width: 250,
      render: (text, record) => (
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
          <Tooltip title="Edit Admin">
            <Button
              type="default"
              icon={<EditOutlined />}
              className="border-orange-400 text-orange-500 hover:bg-orange-50"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>

          {/* Delete */}
          <Popconfirm
            title="Delete Admin"
            description="Are you sure you want to delete this admin? This action cannot be undone."
            onConfirm={() => handleDeleteAdmin(record.admin_id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Admin">
              <Button
                type="default"
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading[record.admin_id]}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // ============================================
  // Statistics
  // ============================================
  const totalAdmins = data.length;
  const managers = data.filter(
    (a) => a.role?.toLowerCase() === "manager"
  ).length;
  const sellers = data.filter((a) => a.role?.toLowerCase() === "seller").length;

  return (
    <>
      <div className="tabled">
        <Row gutter={[24, 24]}>
          {/* Statistics Cards */}
          <Col xs={24} sm={8}>
            <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Total Admins</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalAdmins}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <TeamOutlined className="!text-white text-xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm border-0 bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Managers</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {managers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <CrownOutlined className="!text-white text-xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm border-0 bg-gradient-to-r from-cyan-50 to-cyan-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Sellers</p>
                  <p className="text-3xl font-bold text-cyan-600">{sellers}</p>
                </div>
                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                  <ShopOutlined className="!text-white text-xl" />
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
                      <TeamOutlined className="!text-white text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold m-0">Admin Users</h2>
                      <p className="text-gray-500 text-sm m-0">
                        Manage your admin users and roles
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
                    Add Admin
                  </Button>
                </div>
              }
            >
              <DataTable
                loading={loading}
                addBtn={false}
                searchPlaceholder="Search by name, email, role, or code..."
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
            <UserOutlined className="text-blue-500" />
            <span>Admin Details</span>
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
            Edit Admin
          </Button>,
        ]}
        width={700}
      >
        {rowData && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <UserOutlined className="!text-white text-2xl" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Admin ID</p>
                    <p className="font-bold text-lg text-blue-600">
                      #{rowData.admin_id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Role</p>
                  {(() => {
                    const config = getRoleConfig(rowData.role);
                    return (
                      <Tag icon={config.icon} color={config.color}>
                        {config.label}
                      </Tag>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Admin Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 border-b pb-2 flex items-center">
                <UserOutlined className="mr-2 text-blue-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Full Name</p>
                  <p className="font-semibold text-lg">{rowData.admin_name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <MailOutlined /> Email Address
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{rowData.admin_email}</p>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() =>
                        copyToClipboard(rowData.admin_email, "Email")
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invitation Code */}
            <div>
              <h3 className="font-semibold text-lg mb-3 border-b pb-2 flex items-center">
                <KeyOutlined className="mr-2 text-green-500" />
                Invitation Code
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                {rowData.invitation_code?.trim() ? (
                  <>
                    <p className="text-xs text-gray-500 mb-2">
                      Share this code with new users
                    </p>
                    <div className="flex items-center justify-between">
                      <code className="bg-white px-4 py-2 rounded text-lg font-mono font-bold text-green-700">
                        {rowData.invitation_code?.trim()}
                      </code>
                      <Button
                        type="primary"
                        icon={<CopyOutlined />}
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() =>
                          copyToClipboard(
                            rowData.invitation_code?.trim(),
                            "Invitation code"
                          )
                        }
                      >
                        Copy Code
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 italic">
                      No invitation code set
                    </p>
                    <Button
                      type="link"
                      onClick={() => {
                        setIsViewModalVisible(false);
                        openEditModal(rowData);
                      }}
                    >
                      Add invitation code
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h3 className="font-semibold text-lg mb-3 border-b pb-2">
                Timeline
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Created At</p>
                  <p className="font-semibold">
                    {formatDate(rowData.created_at)}
                  </p>
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
                  className="bg-blue-500 hover:bg-blue-600"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsViewModalVisible(false);
                    openEditModal(rowData);
                  }}
                >
                  Edit Admin
                </Button>
                <Popconfirm
                  title="Delete Admin"
                  description="Are you sure you want to delete this admin?"
                  onConfirm={() => {
                    handleDeleteAdmin(rowData.admin_id);
                    setIsViewModalVisible(false);
                  }}
                  okText="Yes, Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete Admin
                  </Button>
                </Popconfirm>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================ */}
      {/* Add Admin Modal */}
      {/* ============================================ */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-green-500" />
            <span>Add New Admin</span>
          </div>
        }
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          addForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddAdmin}
          initialValues={{
            role: "seller",
            public_commission: 0,
            tour_commission: 0,
          }}
          className="mt-4"
        >
          <Form.Item
            label="Full Name"
            name="admin_name"
            rules={[
              { required: true, message: "Please enter admin name" },
              {
                min: 3,
                message: "Name must be at least 3 characters",
              },
            ]}
          >
            <Input
              placeholder="Enter admin full name"
              size="large"
              prefix={<UserOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="admin_email"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              placeholder="admin@example.com"
              size="large"
              prefix={<MailOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="admin_password"
            rules={[
              { required: true, message: "Please enter password" },
              {
                min: 6,
                message: "Password must be at least 6 characters",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter secure password"
              size="large"
              prefix={<LockOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select size="large" placeholder="Select role">
              <Option value={ROLES.SUPER_ADMIN}>
                <div className="flex items-center gap-2">
                  <SafetyOutlined className="!text-red-500" />
                  <span>Super Admin</span>
                </div>
              </Option>
              <Option value={ROLES.OPERATION_MANAGER}>
                <div className="flex items-center gap-2">
                  <CrownOutlined className="!text-purple-500" />
                  <span>Operation Manager</span>
                </div>
              </Option>
              <Option value={ROLES.ACCOUNTANT}>
                <div className="flex items-center gap-2">
                  <DollarOutlined className="!text-green-500" />
                  <span>Accountant</span>
                </div>
              </Option>
              <Option value={ROLES.CUSTOMER_SUPPORT}>
                <div className="flex items-center gap-2">
                  <CustomerServiceOutlined className="!text-blue-500" />
                  <span>Customer Support</span>
                </div>
              </Option>
              <Option value={ROLES.CONTENT_EDITOR}>
                <div className="flex items-center gap-2">
                  <EditOutlined className="!text-orange-500" />
                  <span>Content Editor</span>
                </div>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Public Commission (%)"
            name="public_commission"
            rules={[
              { required: true, message: "Please enter public commission" },
            ]}
          >
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="Enter percentage (0-100)"
              size="large"
              suffix="%"
              prefix={<PercentageOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label="Tour Commission (%)"
            name="tour_commission"
            rules={[
              { required: true, message: "Please enter tour commission" },
            ]}
          >
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="Enter percentage (0-100)"
              size="large"
              suffix="%"
              prefix={<PercentageOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <KeyOutlined className="text-green-600" />
              <strong className="text-green-700">Invitation Code</strong>
            </div>
            <p className="text-xs text-gray-600">
              An invitation code will be automatically generated using the first
              3 letters of the admin's name + random characters.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Example:{" "}
              <code className="bg-white px-2 py-0.5 rounded">IBRKJ8M2N4X5</code>
            </p>
          </div>

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
              Add Admin
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ============================================ */}
      {/* Edit Admin Modal */}
      {/* ============================================ */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-orange-500" />
            <span>Edit Admin</span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditAdmin}
          className="mt-4"
        >
          <Form.Item
            label="Full Name"
            name="admin_name"
            rules={[
              { required: true, message: "Please enter admin name" },
              {
                min: 3,
                message: "Name must be at least 3 characters",
              },
            ]}
          >
            <Input
              placeholder="Enter admin full name"
              size="large"
              prefix={<UserOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="admin_email"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              placeholder="admin@example.com"
              size="large"
              prefix={<MailOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label="New Password (Optional)"
            name="admin_password"
            help="Leave blank to keep current password"
          >
            <Input.Password
              placeholder="Enter new password (optional)"
              size="large"
              prefix={<LockOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select size="large" placeholder="Select role">
              <Option value={ROLES.SUPER_ADMIN}>
                <div className="flex items-center gap-2">
                  <SafetyOutlined className="!text-red-500" />
                  <span>Super Admin</span>
                </div>
              </Option>
              <Option value={ROLES.OPERATION_MANAGER}>
                <div className="flex items-center gap-2">
                  <CrownOutlined className="!text-purple-500" />
                  <span>Operation Manager</span>
                </div>
              </Option>
              <Option value={ROLES.ACCOUNTANT}>
                <div className="flex items-center gap-2">
                  <DollarOutlined className="!text-green-500" />
                  <span>Accountant</span>
                </div>
              </Option>
              <Option value={ROLES.CUSTOMER_SUPPORT}>
                <div className="flex items-center gap-2">
                  <CustomerServiceOutlined className="!text-blue-500" />
                  <span>Customer Support</span>
                </div>
              </Option>
              <Option value={ROLES.CONTENT_EDITOR}>
                <div className="flex items-center gap-2">
                  <EditOutlined className="!text-orange-500" />
                  <span>Content Editor</span>
                </div>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Public Commission (%)"
            name="public_commission"
            rules={[
              { required: true, message: "Please enter public commission" },
            ]}
          >
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="Enter percentage (0-100)"
              size="large"
              suffix="%"
              prefix={<PercentageOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label="Tour Commission (%)"
            name="tour_commission"
            rules={[
              { required: true, message: "Please enter tour commission" },
            ]}
          >
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="Enter percentage (0-100)"
              size="large"
              suffix="%"
              prefix={<PercentageOutlined className="text-gray-400" />}
            />
          </Form.Item>

          {/* Invitation Code - Editable */}
          <Form.Item
            label={
              <div className="flex items-center gap-2">
                <span>Invitation Code</span>
                <span className="text-gray-400 text-xs font-normal">
                  (Optional - leave blank to remove)
                </span>
              </div>
            }
            name="invitation_code"
          >
            <Input
              placeholder="Enter invitation code or leave blank"
              size="large"
              prefix={<KeyOutlined className="text-gray-400" />}
              suffix={
                <Tooltip title="Generate new code from name">
                  <Button
                    type="text"
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={regenerateCodeForEdit}
                    className="text-green-500 hover:text-green-600"
                  />
                </Tooltip>
              }
            />
          </Form.Item>

          <div className="bg-amber-50 p-3 rounded-lg mb-4 border border-amber-200">
            <p className="text-xs text-amber-700">
              <strong>Tip:</strong> Click the refresh button to generate a new
              code based on the admin's name, or enter your own custom code.
              Leave blank to remove the invitation code.
            </p>
          </div>

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
              Update Admin
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AdminUsers;
