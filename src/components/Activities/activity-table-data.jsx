// components/Activity/activity-table-data.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, Switch, Button, message, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, CopyOutlined } from "@ant-design/icons";

function ActivityTableData({
  setOpenDelete,
  activities,
  loading,
  onToggle,
  pagination,
  onPaginationChange,
}) {
  const navigate = useNavigate();
  const goToUpdate = (id) => navigate(`update/${id}`);

  // Get admin data from localStorage
  const adminData = JSON.parse(localStorage.getItem("admin_data") || "{}");
  const invitationCode = adminData?.invitation_code || "";

  const copyToClipboard = (activityId) => {
    const link = `https://wady-way-s2yw.vercel.app/activities/activities-details?id=${activityId}&activity-invite-code=${invitationCode}`;
    navigator.clipboard.writeText(link);
    message.success("Link copied to clipboard!");
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (newPagination, filters, sorter) => {
    // Call parent's pagination change handler with page and pageSize
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
      width: 140,
      render: (_, record) => {
        const imageUrl = record?.image?.split("//CAMP//")[0] || "";
        return (
          <img
            className="w-[120px] h-[120px] object-cover rounded-md"
            src={imageUrl}
            alt={record?.title || "Activity"}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/120x120?text=No+Image";
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
    },
    {
      title: "Activity Type",
      dataIndex: "activity_type",
      key: "activity_type",
      sorter: (a, b) => a.activity_type?.localeCompare(b.activity_type),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-green-600">
            {record.price_currency || "$"}
            {record.price_current}
          </span>
          {record.price_original &&
            parseFloat(record.price_original) >
              parseFloat(record.price_current) && (
              <span className="text-sm text-gray-400 line-through">
                {record.price_currency || "$"}
                {record.price_original}
              </span>
            )}
          {record.price_note && (
            <span className="text-xs text-gray-500">{record.price_note}</span>
          )}
        </div>
      ),
    },
    {
      title: "Visibility",
      key: "visibility",
      render: (_, record) => (
        <Switch
          checked={record.hidden === "0"}
          onChange={() => onToggle(record.id)}
          checkedChildren="Visible"
          unCheckedChildren="Hidden"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
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
        dataSource={activities}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 10,
          total: pagination?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} activities`,
          showQuickJumper: true,
          position: ["bottomRight"],
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
        bordered
        size="middle"
      />
    </div>
  );
}

export default ActivityTableData;
