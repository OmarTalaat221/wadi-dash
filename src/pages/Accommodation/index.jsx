import React, { useState } from "react";
import BreadCrumbs from "../../components/bread-crumbs";
import AccommodationTableData from "../../components/Accommodation/accommodation-table-data";
import ConfirmDeleteAccommodation from "../../components/Accommodation/confirm-delete";
import AccomBreadcrumbsButtons from "../../components/Accommodation/accom-breadcrumbs-buttons";
import ImportAccommodationsExcel from "../../components/Accommodation/import-excel-modal";
import { accom } from "../../data/accom";

function Accommodation() {
  const [openImport, setOpenImport] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div className="flex flex-col">
      <BreadCrumbs
        title={"Dashboard / Home / Accommodation"}
        children={
          <>
            <AccomBreadcrumbsButtons
              setOpenImport={setOpenImport}
              accom={accom}
            />
          </>
        }
      />
      <AccommodationTableData setOpenDelete={setOpenDelete} accom={accom} />
      <ImportAccommodationsExcel open={openImport} setOpen={setOpenImport} />
      <ConfirmDeleteAccommodation open={openDelete} setOpen={setOpenDelete} />
    </div>
  );
}

export default Accommodation;
