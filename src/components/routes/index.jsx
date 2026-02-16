// components/routes/index.js
import React from "react";
import { publicRoutes, canAccessRoute } from "../../data/routes";
import { Route, Routes, Navigate } from "react-router-dom";
import DefaultLayout from "../../layout/default";
import Login from "../../pages/login";
import Unauthorized from "../../pages/Unauthorized/Unauthorized";

// Check authentication
const isAuthenticated = () => {
  const user = localStorage.getItem("admin_data");
  return user !== null && user !== undefined && user !== "";
};

// Get user role
const getUserRole = () => {
  try {
    const adminData = JSON.parse(localStorage.getItem("admin_data") || "{}");
    return adminData?.role || null;
  } catch {
    return null;
  }
};

// Protected Route Component
const ProtectedElement = ({ children, allowedRoles }) => {
  const userRole = getUserRole();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <DefaultLayout>{children}</DefaultLayout>;
};

function DashboardRoutes() {
  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      {publicRoutes?.map((item, index) => {
        return (
          <React.Fragment key={`route-${index}`}>
            {/* Main Route */}
            <Route
              path={item.route}
              element={
                <ProtectedElement allowedRoles={item.roles}>
                  <item.element />
                </ProtectedElement>
              }
            />

            {/* Sub Routes */}
            {item?.subLinks?.map((sub_item, sub_index) => {
              return (
                <Route
                  key={`sub-${index}-${sub_index}`}
                  path={item.route + "/" + sub_item.route}
                  element={
                    <ProtectedElement allowedRoles={item.roles}>
                      <sub_item.element />
                    </ProtectedElement>
                  }
                />
              );
            })}
          </React.Fragment>
        );
      })}

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default DashboardRoutes;
