// src/components/Accommodation/accommodation-table-data.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, Switch, Button, message, Tooltip, Tag } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
} from "@ant-design/icons";

function AccommodationTableData({
  setOpenDelete,
  accom,
  loading,
  onRefresh,
  onToggle,
  pagination,
  onPaginationChange,
}) {
  const navigate = useNavigate();
  const goToUpdate = (id) => navigate(`update/${id}`);
  const goToView = (id) => navigate(`view/${id}`);

  // Get admin data from localStorage
  const adminData = JSON.parse(localStorage.getItem("admin_data") || "{}");
  const invitationCode = adminData?.invitation_code || "";

  const copyToClipboard = (hotelId) => {
    const link = `https://wady-way-s2yw.vercel.app/hotel-suits/hotel-details?hotel=${hotelId}&hotel-invite-code=${invitationCode}`;
    navigator.clipboard.writeText(link);
    message.success("Link copied to clipboard!");
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (newPagination, filters, sorter) => {
    if (onPaginationChange) {
      onPaginationChange(newPagination.current, newPagination.pageSize);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Main Image",
      key: "image",
      width: 180,
      render: (_, record) => {
        const images = record.image ? record.image.split("//CAMP//") : [];
        const firstImage = images[0] || "https://via.placeholder.com/200x120";

        return (
          <img
            className="w-[160px] h-[100px] object-cover rounded-md"
            src={firstImage}
            alt={record?.title || "Accommodation"}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/160x100?text=No+Image";
            }}
          />
        );
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title?.localeCompare(b.title),
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span className="font-medium">{text}</span>
        </Tooltip>
      ),
    },
    // {
    //   title: "Category",
    //   dataIndex: "category",
    //   key: "category",
    //   width: 120,
    //   sorter: (a, b) => a.category?.localeCompare(b.category),
    //   render: (category) => <Tag color="blue">{category || "N/A"}</Tag>,
    // },
    {
      title: "Price",
      key: "price",
      width: 120,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-green-600">
            {record.price_currency || "$"}
            {record.price_current}
          </span>
          {record.price_original &&
            parseFloat(record.price_original) >
              parseFloat(record.price_current) && (
              <span className="text-sm text-gray-500 line-through">
                {record.price_currency || "$"}
                {record.price_original}
              </span>
            )}
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || "N/A"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Amenities",
      key: "amenities",
      width: 120,
      render: (_, record) => {
        const amenitiesCount = record.amenities?.length || 0;
        return (
          <Tag color={amenitiesCount > 0 ? "green" : "default"}>
            {amenitiesCount} amenities
          </Tag>
        );
      },
    },
    {
      title: "Visibility",
      key: "visibility",
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.hidden === "0"}
          onChange={() => onToggle(record.id)}
          checkedChildren="Visible"
          unCheckedChildren="Hidden"
          size="small"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      fixed: "right",
      render: (_, record) => (
        <div className="flex gap-1">
          <Tooltip title="Copy Link">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => copyToClipboard(record.id)}
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              type="primary"
              size="small"
              onClick={() => goToUpdate(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              onClick={() => setOpenDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="TableData p-4">
      <Table
        columns={columns}
        dataSource={accom}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 10,
          total: pagination?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} accommodations`,
          showQuickJumper: true,
          position: ["bottomRight"],
        }}
        onChange={handleTableChange}
        scroll={{ x: 1300 }}
        bordered
        size="middle"
      />
    </div>
  );
}

export default AccommodationTableData;
