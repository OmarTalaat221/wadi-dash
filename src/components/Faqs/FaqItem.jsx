import React, { useState } from "react";
import { Card, Typography, Button, Tooltip } from "antd";
import {
  DownOutlined,
  UpOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const FaqItem = ({ faq, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

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
          {expanded && (
            <Paragraph className="text-gray-600 mt-2 mb-0">
              {faq.answer}
            </Paragraph>
          )}
        </div>
        <div className="flex items-center space-x-2">
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
          {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
        </span>
      </div>
    </Card>
  );
};

export default FaqItem;
