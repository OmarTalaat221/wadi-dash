// layout/SideBar/SideBar.js
import React, { useEffect } from "react";
import SidebarLink from "../../components/sidebar/link";
import Logo from "../../components/sidebar/logo";
import { getRoutesByRole } from "../../data/routes";
import { useReadStatus } from "../../context/ReadStatusContext";

function SideBar() {
  const adminData = JSON.parse(localStorage.getItem("admin_data") || "{}");
  const userRole = adminData?.role || "content_editor";
  const allowedRoutes = getRoutesByRole(userRole);

  // ✅ Global read status
  const { hasAnyNew } = useReadStatus();

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
          if (item?.hidden) return null;

          const isRequests = item?.route === "/requests";

          return (
            <li className="drop-menu-link-item" key={index}>
              {/* ✅ Wrap link in relative container for dot positioning */}
              <div className="relative">
                <SidebarLink
                  path={item?.route}
                  title={item?.title}
                  icon={item?.icon}
                />

                {/* ✅ Red dot for Requests when there's unread */}
                {isRequests && hasAnyNew && (
                  <span className="absolute top-1/2 -translate-y-1/2 right-3 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px_rgba(255,255,255,0.8)] animate-pulse" />
                )}
              </div>

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
