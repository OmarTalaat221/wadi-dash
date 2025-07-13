import React from 'react';

function BreadCrumbs({ title, children }) {
  return (
    <div className="Page_title_bread_crumbs">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default BreadCrumbs;
