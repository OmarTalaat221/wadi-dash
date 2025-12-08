import React, { useState, useEffect } from "react";
import BreadCrumbs from "../../components/bread-crumbs";
import CarBreadcrumbsButtons from "../../components/Transfer/transfer-breadcrumbs-buttons";
import CarTableData from "../../components/Transfer/transfer-table-data";
import ConfirmDeleteCar from "../../components/Transfer/confirm-delete";
import ImportCarExcel from "../../components/Transfer/import-excel-modal";
import { message } from "antd";
import axios from "axios";
import { base_url } from "../../utils/base_url";

function Cars() {
  const [openImport, setOpenImport] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async (loading = true) => {
    if (loading) setIsLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/admin/cars/select_cars.php`
      );

      if (response.data.status === "success") {
        setCars(response.data.message);
      } else {
        message.error("Failed to load cars");
      }
    } catch (error) {
      message.error("An error occurred while loading cars");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (carId) => {
    try {
      const response = await axios.post(
        `${base_url}/admin/cars/toggle_car.php`,
        {
          id: carId,
        }
      );

      message.success("Car visibility toggled successfully");
      fetchCars(false); // Refresh the list
    } catch (error) {
      message.error("Failed to toggle car visibility");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!openDelete) return;

    try {
      const response = await axios.post(
        `${base_url}/admin/cars/delete_car.php`,
        {
          id: openDelete.id,
        }
      );

      message.success("Car deleted successfully");
      setOpenDelete(false);
      fetchCars(); // Refresh the list
    } catch (error) {
      message.error("Failed to delete car");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col">
      <BreadCrumbs
        title={"Dashboard / Home / Cars"}
        children={
          <>
            <CarBreadcrumbsButtons setOpenImport={setOpenImport} cars={cars} />
          </>
        }
      />
      {isLoading ? (
        <div className="text-center p-8">Loading cars...</div>
      ) : (
        <CarTableData
          setOpenDelete={setOpenDelete}
          cars={cars}
          onToggle={handleToggle}
          isLoading={isLoading}
        />
      )}
      <ImportCarExcel
        open={openImport}
        setOpen={setOpenImport}
        onImportSuccess={fetchCars}
      />
      <ConfirmDeleteCar
        open={openDelete}
        setOpen={setOpenDelete}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Cars;
