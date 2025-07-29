import React, { useState } from "react";
import { Button, Input, Table, Space, Card, Typography, message } from "antd";
import { SendOutlined, DeleteOutlined } from "@ant-design/icons";
import BreadCrumbs from "../../components/bread-crumbs";
import { newsletterSubscribers } from "../../data/newsletter";

const { TextArea } = Input;
const { Title, Text } = Typography;

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState(newsletterSubscribers);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const handleSendNotification = () => {
    if (!messageSubject || !messageContent) {
      message.error("Please fill in both subject and content fields");
      return;
    }

    if (selectedRowKeys.length === 0) {
      message.error("Please select at least one subscriber");
      return;
    }

    // Here you would implement the actual email sending logic
    const selectedEmails = subscribers
      .filter((subscriber) => selectedRowKeys.includes(subscriber.id))
      .map((subscriber) => subscriber.email);

    console.log("Sending notification to:", selectedEmails);
    console.log("Subject:", messageSubject);
    console.log("Content:", messageContent);

    message.success(
      `Notification sent to ${selectedRowKeys.length} subscribers`
    );

    // Reset form
    setMessageSubject("");
    setMessageContent("");
    setSelectedRowKeys([]);
  };

  const handleDeleteSubscriber = (id) => {
    setSubscribers(subscribers.filter((subscriber) => subscriber.id !== id));
    setSelectedRowKeys(selectedRowKeys.filter((key) => key !== id));
    message.success("Subscriber removed successfully");
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteSubscriber(record.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <BreadCrumbs title="Dashboard / Newsletter Management" children={<></>} />

      <Card title="Send Notification" style={{ marginBlock: "20px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Subject"
            value={messageSubject}
            onChange={(e) => setMessageSubject(e.target.value)}
          />
          <TextArea
            rows={4}
            placeholder="Message Content"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendNotification}
            disabled={selectedRowKeys.length === 0}
          >
            Send to {selectedRowKeys.length}{" "}
            {selectedRowKeys.length === 1 ? "Subscriber" : "Subscribers"}
          </Button>
        </Space>
      </Card>

      <Card title="Subscribers List">
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={subscribers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Newsletter;
