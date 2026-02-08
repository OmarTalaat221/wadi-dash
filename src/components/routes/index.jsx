import React from "react";
import { publicRoutes } from "../../data/routes";
import { Route, Routes, Navigate } from "react-router-dom";
import DefaultLayout from "../../layout/default";
import Login from "../../pages/login";

// Check authentication
const isAuthenticated = () => {
  const user = localStorage.getItem("admin_data");
  return user !== null && user !== undefined && user !== "";
};

function DashboardRoutes() {
  return (
    <Routes>
      {/* Login Route - WITHOUT Sidebar */}
      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected Routes - WITH Sidebar */}
      {publicRoutes?.map((item, index) => {
        // Skip routes that are hidden from menu (but still render them if they have a route)
        return (
          <React.Fragment key={`route-${index}`}>
            {/* Main Route */}
            <Route
              path={item.route}
              element={
                isAuthenticated() ? (
                  <DefaultLayout>
                    <item.element />
                  </DefaultLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Sub Routes - Render ALL sub routes, even if hidden */}
            {item?.subLinks?.map((sub_item, sub_index) => {
              return (
                <Route
                  key={`sub-${index}-${sub_index}`}
                  path={item.route + "/" + sub_item.route}
                  element={
                    isAuthenticated() ? (
                      <DefaultLayout>
                        <sub_item.element />
                      </DefaultLayout>
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
              );
            })}
          </React.Fragment>
        );
      })}

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default DashboardRoutes;
