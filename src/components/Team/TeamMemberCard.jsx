// components/Team/TeamMemberCard.js
import React from "react";
import { Card, Tag, Tooltip, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

const TeamMemberCard = ({ member, onEdit, onDelete, onToggle, isToggling }) => {
  const getVisibilityInfo = () => {
    return {
      color: member.hidden ? "red" : "green",
      text: member.hidden ? "Hidden" : "Visible",
      icon: member.hidden ? EyeInvisibleOutlined : EyeOutlined,
      actionText: member.hidden ? "show" : "hide",
    };
  };

  const visibilityInfo = getVisibilityInfo();
  const VisibilityIcon = visibilityInfo.icon;

  return (
    <div
      className={`transition-opacity duration-300 ${
        member.hidden ? "opacity-50" : "opacity-100"
      }`}
    >
      <Card
        hoverable
        cover={
          <div className="relative h-48 overflow-hidden">
            <img
              alt={member.name}
              src={member.profileImage}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = "/placeholder-team.png";
              }}
            />
            <div className="absolute top-2 right-2 flex gap-1">
              {member.isTopMember && (
                <Tag color="gold" className="flex items-center">
                  <span className="mr-1">⭐</span>
                  Top Member
                </Tag>
              )}
              <Tag color={visibilityInfo.color} className="flex items-center">
                {visibilityInfo.text}
              </Tag>
            </div>
          </div>
        }
        actions={[
          <Tooltip title="Edit Member" key="edit">
            <EditOutlined onClick={() => onEdit(member)} />
          </Tooltip>,
          <Popconfirm
            key="toggle"
            title={`${visibilityInfo.actionText} this team member?`}
            description={`Are you sure you want to ${visibilityInfo.actionText} "${member.name}"?`}
            onConfirm={() => onToggle(member)}
            okText="Yes"
            cancelText="No"
            disabled={isToggling}
          >
            <Tooltip title={`${visibilityInfo.actionText} Member`}>
              <VisibilityIcon
                style={{
                  color: isToggling ? "#1890ff" : undefined,
                  cursor: isToggling ? "wait" : "pointer",
                }}
              />
            </Tooltip>
          </Popconfirm>,
          <Tooltip title="Delete Member" key="delete">
            <DeleteOutlined onClick={() => onDelete(member)} />
          </Tooltip>,
        ]}
      >
        <Card.Meta
          title={<span className="text-lg font-semibold">{member.name}</span>}
          description={
            <div>
              <p className="text-blue-600 font-medium mb-2">
                {member.position}
              </p>
              <p className="text-gray-600 text-sm line-clamp-2">
                {member.shortDescription}
              </p>
            </div>
          }
        />
      </Card>
    </div>
  );
};

export default TeamMemberCard;
