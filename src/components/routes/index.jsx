import React from 'react';
import { publicRoutes } from '../../data/routes';
import { Route, Routes } from 'react-router-dom';

function DashboardRoutes() {
  return (
    <Routes>
      {publicRoutes?.map((item, index) => {
        return (
          <>
            <Route path={item.route} key={index} element={<item.element />} />
            {item?.subLinks?.map((sub_item, sub_index) => {
              return (
                <Route
                  path={item.route + "/" + sub_item.route}
                  key={sub_index}
                  element={<sub_item.element />}
                />
              );
            })}
          </>
        );
      })}
    </Routes>
  );
}

export default DashboardRoutes;
