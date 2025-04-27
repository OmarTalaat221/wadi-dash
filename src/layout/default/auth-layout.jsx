import React from 'react';
import SideBar from '../sidebar';
import Header from '../header';

function AuthLayout({ children }) {
  return <div className="auth-layout">{children}</div>;
}

export default AuthLayout;
