import React from "react";
import SideBar from "../sidebar";
import Header from "../header";

function DefaultLayout({ children }) {
  return (
    <div className="layout">
      <SideBar />
      <div className="body-layout">
        <Header />
        <div className="content-layout">{children}</div>
      </div>
    </div>
  );
}

export default DefaultLayout;
