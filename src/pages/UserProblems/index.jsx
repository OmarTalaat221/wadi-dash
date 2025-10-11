import React, { useState, useEffect } from "react";
import { Button, Card, Col, Row, Modal, message, Tag } from "antd";
import DataTable from "../../layout/DataTable";
import axios from "axios";
import dayjs from "dayjs";
import { base_url } from "../../utils/base_url";

const UserProblems = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch contact messages
  const fetchContactMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/contact/select_contact_messages.php`
      );

      if (response.data.status === "success") {
        setData(response.data.message);
        setFilteredData(response.data.message);
      } else {
        message.error("Failed to fetch contact messages");
      }
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      message.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactMessages();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return dayjs(date).format("YYYY/MM/DD HH:mm:ss");
    } catch (error) {
      return dateString;
    }
  };

  // Truncate message for table display
  const truncateMessage = (message, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const headers = [
    {
      title: "User Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <div>
          <p className="font-medium">{text}</p>
        </div>
      ),
    },
    {
      title: "Contact Info",
      dataIndex: "email",
      key: "contact",
      render: (text, record) => (
        <div>
          <p className="text-sm">{text}</p>
          <p className="text-xs text-gray-500">{record.phone}</p>
        </div>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (text) => (
        <div>
          <p className="text-sm text-gray-700">{truncateMessage(text)}</p>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => (
        <div>
          <p className="text-sm">{formatDate(text)}</p>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="flex gap-2">
          <Button
            className="bg-primary text-white"
            type="primary"
            onClick={() => {
              setRowData(record);
              setIsModalVisible(true);
            }}
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="tabled">
        <Row className="">
          <Col xs="24" xl={24} className="!w-full">
            <Card
              bordered={false}
              className="!w-full mb-24"
              title={
                <div className="flex justify-between items-center">
                  <span>User Contact Messages</span>
                  <Tag color="blue">Total: {data.length}</Tag>
                </div>
              }
            >
              <div className="">
                <DataTable
                  loading={loading}
                  addBtn={false}
                  searchPlaceholder={"Search for User Messages"}
                  table={{ header: headers, rows: filteredData }}
                  bordered={true}
                  onSearchChabnge={() => {}}
                  onAddClick={() => {}}
                  btnText=""
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Details Modal */}
      <Modal
        title="Contact Message Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {rowData && (
          <div className="space-y-6">
            {/* Header with Message ID */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Message ID</p>
                  <p className="font-bold text-lg">#{rowData.message_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Received On</p>
                  <p className="font-semibold">
                    {formatDate(rowData.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 border-b pb-2 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                User Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 mb-1">Full Name</p>
                  <p className="font-semibold">{rowData.name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                  <p className="font-semibold">{rowData.phone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="font-semibold">{rowData.email}</p>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <h3 className="font-semibold text-lg mb-3 border-b pb-2 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Message Content
              </h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {rowData.message}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-600">
                Quick Actions
              </h3>
              <div className="flex gap-2">
                <Button
                  type="primary"
                  className="bg-blue-500"
                  onClick={() => {
                    window.location.href = `mailto:${rowData.email}?subject=Re: Your Message&body=Dear ${rowData.name},%0D%0A%0D%0A`;
                  }}
                >
                  Reply via Email
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    window.location.href = `tel:${rowData.phone}`;
                  }}
                >
                  Call User
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Name: ${rowData.name}\nEmail: ${rowData.email}\nPhone: ${rowData.phone}\nMessage: ${rowData.message}`
                    );
                    message.success("Message details copied to clipboard!");
                  }}
                >
                  Copy Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default UserProblems;
