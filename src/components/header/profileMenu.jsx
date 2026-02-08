import React from "react";
import { Dropdown, Space } from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { logout, getAdminData } from "../../utils/auth";

function ProfileMenu() {
  const adminData = getAdminData();

  const handleLogout = () => {
    logout();
  };

  const items = [
    {
      key: "1",
      label: (
        <div style={{ padding: "8px 0" }}>
          <strong>{adminData?.admin_name || "Admin"}</strong>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {adminData?.admin_email || "admin@example.com"}
          </div>
        </div>
      ),
      disabled: true,
    },

    {
      type: "divider",
    },
    {
      key: "4",
      label: "تسجيل الخروج",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomLeft">
      <div className="ProfileMenu" style={{ cursor: "pointer" }}>
        <img src="/person.png" alt="" />
      </div>
    </Dropdown>
  );
}

export default ProfileMenu;
