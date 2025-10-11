// components/Faqs/FaqItem.js
import React, { useState } from "react";
import { Card, Typography, Button, Tooltip, Tag } from "antd";
import {
  DownOutlined,
  UpOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const FaqItem = ({ faq, onEdit, onDelete, onToggleStatus }) => {
  const [expanded, setExpanded] = useState(false);

  const getVisibilityColor = (hidden) => {
    const isHidden = hidden === "1" || hidden === 1;
    return isHidden ? "red" : "green";
  };

  const getVisibilityText = (hidden) => {
    const isHidden = hidden === "1" || hidden === 1;
    return isHidden ? "Hidden" : "Visible";
  };

  const getVisibilityIcon = (hidden) => {
    const isHidden = hidden === "1" || hidden === 1;
    return isHidden ? EyeInvisibleOutlined : EyeOutlined;
  };

  const formatTypeName = (type) => {
    if (!type) return "General";
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const VisibilityIcon = getVisibilityIcon(faq.hidden);

  return (
    <Card
      className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-300"
      bodyStyle={{ padding: "16px 24px" }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <Title level={5} className="mb-1 text-lg">
            {faq.question}
          </Title>

          <Tag color={getVisibilityColor(faq.hidden)}>
            {getVisibilityText(faq.hidden)}
          </Tag>

          {expanded && (
            <Paragraph className="text-gray-600 mt-2 mb-0">
              {faq.answer}
            </Paragraph>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Tooltip title={`${faq.hidden === "1" ? "Show" : "Hide"} FAQ`}>
            <Button
              type="text"
              icon={<VisibilityIcon />}
              onClick={() => onToggleStatus(faq)}
              className="hover:bg-blue-50"
            />
          </Tooltip>

          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(faq);
              }}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              type="text"
              danger
              onClick={(e) => {
                e.stopPropagation();
                onDelete(faq);
              }}
            />
          </Tooltip>

          <Button
            type="text"
            icon={expanded ? <UpOutlined /> : <DownOutlined />}
            onClick={toggleExpand}
            aria-label={expanded ? "Collapse" : "Expand"}
          />
        </div>
      </div>

      <div className="mt-2">
        <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
          {formatTypeName(faq.type)}
        </span>
      </div>
    </Card>
  );
};

export default FaqItem;
