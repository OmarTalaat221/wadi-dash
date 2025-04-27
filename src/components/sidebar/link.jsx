import React from "react";
import { NavLink } from "react-router-dom";

function SidebarLink({ path, icon, title, key }) {
  return (
    <NavLink to={path} className={"sidebar-link"} key={key}>
      {typeof icon === "string" ? (
        <img src={icon} alt={title} className="icon" />
      ) : (
        React.createElement(icon) // ✅ create element from component function
      )}

      <span>{title}</span>
    </NavLink>
  );
}

export default SidebarLink;
