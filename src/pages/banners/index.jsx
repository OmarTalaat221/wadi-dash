import React, { useState } from "react";
import BreadCrumbs from "../../components/bread-crumbs";
import BannersLayout from "../../layout/Banners";

function Banners() {
  return (
    <div className="flex flex-col gap-2.5">
      <BreadCrumbs title={"Dashboard / Home / Banners"} children={<></>} />{" "}
      <BannersLayout />
    </div>
  );
}

export default Banners;
