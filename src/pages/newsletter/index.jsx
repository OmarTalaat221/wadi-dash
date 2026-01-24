import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Table,
  Space,
  Card,
  Typography,
  message,
  Popconfirm,
  Empty,
  Tag,
} from "antd";
import {
  SendOutlined,
  ReloadOutlined,
  MailOutlined,
  LinkOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import BreadCrumbs from "../../components/bread-crumbs";
import axios from "axios";
import { base_url } from "../../utils/base_url";

const { TextArea } = Input;
const { Text } = Typography;

const Newsletter = () => {
  // Data State
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Selection State
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Form State
  const [emailTitle, setEmailTitle] = useState("");
  const [emailLink, setEmailLink] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Pagination State
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch subscribers from API
  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${base_url}/admin/newsletter/select_newsletter.php`
      );

      console.log("Newsletter Response:", response.data);

      if (response?.data?.status === "success") {
        const subscribersData = response.data.message || [];
        setSubscribers(subscribersData);
        setPagination((prev) => ({
          ...prev,
          total: subscribersData.length,
        }));
      } else {
        message.error(response?.data?.message || "Failed to fetch subscribers");
        setSubscribers([]);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      message.error("Failed to fetch subscribers");
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch subscribers on mount
  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Validate form
  const validateForm = () => {
    if (!emailTitle.trim()) {
      message.error("Please enter an email title");
      return false;
    }

    if (!emailBody.trim()) {
      message.error("Please enter email body");
      return false;
    }

    // Validate link if provided
    if (emailLink.trim()) {
      try {
        new URL(emailLink);
      } catch {
        message.error("Please enter a valid URL for the link");
        return false;
      }
    }

    return true;
  };

  // Send email to selected subscribers (partial)
  const handleSendToSelected = async () => {
    if (!validateForm()) return;

    if (selectedRowKeys.length === 0) {
      message.error("Please select at least one subscriber");
      return;
    }

    try {
      setSendingEmail(true);

      // Convert IDs array to comma-separated string
      const idsString = selectedRowKeys.join(",");

      const payload = {
        type: "partial",
        ids: idsString,
        title: emailTitle.trim(),
        link: emailLink.trim() || "",
        body: emailBody.trim(),
      };

      console.log("Sending email to selected:", payload);

      const response = await axios.post(
        `${base_url}/admin/mailer/send_newsletter.php`,
        JSON.stringify(payload),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data);

      if (response?.status == 200) {
        message.success(
          `Email sent successfully to ${selectedRowKeys.length} subscriber(s)`
        );

        // Reset form
        resetForm();
      } else {
        message.error(response?.data?.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      message.error(error?.response?.data?.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  // Send to all subscribers
  const handleSendToAll = async () => {
    if (!validateForm()) return;

    if (subscribers.length === 0) {
      message.error("No subscribers available");
      return;
    }

    try {
      setSendingEmail(true);

      const payload = {
        type: "all",
        title: emailTitle.trim(),
        link: emailLink.trim() || "",
        body: emailBody.trim(),
      };

      console.log("Sending to all:", payload);

      const response = await axios.post(
        `${base_url}/admin/mailer/send_newsletter.php`,
        JSON.stringify(payload),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data);

      if (response?.data?.status === "success") {
        message.success(
          `Email sent successfully to all ${subscribers.length} subscribers`
        );

        // Reset form
        resetForm();
      } else {
        message.error(response?.data?.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      message.error(error?.response?.data?.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setEmailTitle("");
    setEmailLink("");
    setEmailBody("");
    setSelectedRowKeys([]);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => parseInt(a.id) - parseInt(b.id),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: "#1890ff" }} />
          <a href={`mailto:${email}`}>{email}</a>
        </Space>
      ),
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Subscribed Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => <Tag color="blue">{formatDate(date)}</Tag>,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
  ];

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: loading,
    }),
  };

  // Handle table change (pagination, sorting)
  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(newPagination);
  };

  // Select all subscribers
  const handleSelectAll = () => {
    const allKeys = subscribers.map((sub) => sub.id);
    setSelectedRowKeys(allKeys);
  };

  // Check if form is valid for sending
  const isFormValid = emailTitle.trim() && emailBody.trim();

  return (
    <div style={{ padding: "20px" }}>
      <BreadCrumbs title="Dashboard / Newsletter Management" children={<></>} />

      {/* Send Email Card */}
      <Card
        title={
          <Space>
            <MailOutlined />
            <span>Send Newsletter Email</span>
          </Space>
        }
        style={{ marginBlock: "20px" }}
        extra={
          <Text type="secondary">
            {selectedRowKeys.length} subscriber(s) selected
          </Text>
        }
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {/* Email Title */}
          <div>
            <Text strong style={{ marginBottom: 8, display: "block" }}>
              Email Title <span style={{ color: "red" }}>*</span>
            </Text>
            <Input
              placeholder="Enter email title (e.g., Exciting New Offers at Wadi Way!)"
              value={emailTitle}
              onChange={(e) => setEmailTitle(e.target.value)}
              prefix={<FileTextOutlined />}
              size="large"
              maxLength={200}
              showCount
            />
          </div>

          {/* Email Link */}
          <div>
            <Text strong style={{ marginBottom: 8, display: "block" }}>
              Link (Optional)
            </Text>
            <Input
              placeholder="Enter link URL (e.g., https://www.wadiway.com/offers)"
              value={emailLink}
              onChange={(e) => setEmailLink(e.target.value)}
              prefix={<LinkOutlined />}
              size="large"
              type="url"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              This link will be included in the email for subscribers to click
            </Text>
          </div>

          {/* Email Body */}
          <div>
            <Text strong style={{ marginBottom: 8, display: "block" }}>
              Email Body <span style={{ color: "red" }}>*</span>
            </Text>
            <TextArea
              rows={6}
              placeholder="Enter email body content (e.g., Dear subscriber, we are thrilled to offer you exclusive deals this season...)"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              maxLength={10000}
              showCount
            />
          </div>

          {/* Action Buttons */}
          <Space wrap style={{ marginTop: 16 }}>
            {/* Send to Selected */}
            <Popconfirm
              title="Send Email to Selected Subscribers"
              description={`Are you sure you want to send this email to ${selectedRowKeys.length} selected subscriber(s)?`}
              onConfirm={handleSendToSelected}
              okText="Yes, Send"
              cancelText="Cancel"
              disabled={selectedRowKeys.length === 0 || !isFormValid}
            >
              <Button
                type="primary"
                icon={<SendOutlined />}
                disabled={selectedRowKeys.length === 0 || !isFormValid}
                loading={sendingEmail}
                size="large"
              >
                Send to {selectedRowKeys.length}{" "}
                {selectedRowKeys.length === 1 ? "Subscriber" : "Subscribers"}
              </Button>
            </Popconfirm>

            {/* Send to All */}
            <Popconfirm
              title="Send Email to All Subscribers"
              description={`Are you sure you want to send this email to all ${subscribers.length} subscribers?`}
              onConfirm={handleSendToAll}
              okText="Yes, Send to All"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              disabled={subscribers.length === 0 || !isFormValid}
            >
              <Button
                type="default"
                icon={<SendOutlined />}
                disabled={subscribers.length === 0 || !isFormValid}
                loading={sendingEmail}
                size="large"
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                  color: "#fff",
                }}
              >
                Send to All ({subscribers.length})
              </Button>
            </Popconfirm>

            {/* Clear Selection */}
            {selectedRowKeys.length > 0 && (
              <Button onClick={() => setSelectedRowKeys([])}>
                Clear Selection
              </Button>
            )}

            {/* Select All */}
            <Button
              onClick={handleSelectAll}
              disabled={subscribers.length === 0}
            >
              Select All
            </Button>

            {/* Clear Form */}
            <Button onClick={resetForm} danger>
              Clear Form
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Subscribers List Card */}
      <Card
        title={
          <Space>
            <MailOutlined />
            <span>Subscribers List</span>
            <Tag color="blue">{subscribers.length} Total</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSubscribers}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={subscribers}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} subscribers`,
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No subscribers found"
              />
            ),
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};

export default Newsletter;
