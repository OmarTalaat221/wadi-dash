// layout/SideBar/SideBar.js
import React, { useEffect } from "react";
import SidebarLink from "../../components/sidebar/link";
import Logo from "../../components/sidebar/logo";
import { publicRoutes, getRoutesByRole } from "../../data/routes";

function SideBar() {
  // جيب الـ role من localStorage أو من context
  const adminData = JSON.parse(localStorage.getItem("admin_data") || "{}");
  const userRole = adminData?.role || "content_editor"; // default role

  // فلتر الـ routes حسب الـ role
  const allowedRoutes = getRoutesByRole(userRole);

  useEffect(() => {
    const dropMenuItems = document.querySelectorAll(".drop-menu-link-item");

    const handleClick = (event) => {
      if (event.target.closest(".drop-menu-drop")) return;

      const currentItem = event.currentTarget;
      const dropMenu = currentItem.querySelector(".drop-menu-drop");

      const isAlreadyOpen =
        dropMenu?.style.height && dropMenu.style.height !== "0px";

      document.querySelectorAll(".drop-menu-drop").forEach((menu) => {
        menu.style.height = "0px";
        menu.style.padding = "0px";
      });

      if (!isAlreadyOpen && dropMenu) {
        dropMenu.style.height = dropMenu.scrollHeight + "px";
        dropMenu.style.padding = "";
      }
    };

    dropMenuItems.forEach((item) => {
      item.addEventListener("click", handleClick);
    });

    return () => {
      dropMenuItems.forEach((item) => {
        item.removeEventListener("click", handleClick);
      });
    };
  }, []);

  return (
    <aside>
      <Logo />
      <ul className="drop-menu">
        {allowedRoutes?.map((item, index) => {
          return item?.hidden ? null : (
            <li className="drop-menu-link-item" key={index}>
              <SidebarLink
                path={item?.route}
                title={item?.title}
                icon={item?.icon}
                key={index}
              />
              {item?.subLinks && item?.subLinks?.length ? (
                <ul className="drop-menu-drop !px-4">
                  {item?.subLinks?.map((sub_item, sub_index) => {
                    return sub_item?.hidden ? null : (
                      <li
                        className="drop-menu-drop-item first:mt-4"
                        key={sub_index}
                      >
                        <SidebarLink
                          path={item?.route + "/" + sub_item?.route}
                          title={sub_item?.title}
                          icon={sub_item?.icon}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default SideBar;
