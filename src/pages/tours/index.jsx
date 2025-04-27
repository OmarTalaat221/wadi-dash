import React, { useState } from "react";
import BreadCrumbs from "../../components/bread-crumbs";
import TourBreadcrumbsButtons from "../../components/tours-page/tour-breadcrumbs-buttons";
import ToursTableData from "../../components/tours-page/tour-table-data";
import Modal from "../../components/modal";
import ImportToursExcel from "../../components/tours-page/import-excel-modal";
import ConfirmDeleteTour from "../../components/tours-page/confirm-delete";
import { tours } from "../../data/tours";

function Tours() {
  const [openImport, setOpenImport] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div className="flex flex-col">
      <BreadCrumbs
        title={"Dashboard / Home / Tours"}
        children={
          <>
            <TourBreadcrumbsButtons
              setOpenImport={setOpenImport}
              tours={tours}
            />
          </>
        }
      />
      <ToursTableData setOpenDelete={setOpenDelete} tours={tours} />
      <ImportToursExcel open={openImport} setOpen={setOpenImport} />
      <ConfirmDeleteTour open={openDelete} setOpen={setOpenDelete} />
    </div>
  );
}

export default Tours;
