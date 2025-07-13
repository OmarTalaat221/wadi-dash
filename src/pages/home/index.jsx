import React from 'react';
import BreadCrumbs from '../../components/bread-crumbs';

function Home() {
  return (
    <div>
      <BreadCrumbs
        title={"Dashboard / Home"}
        children={<></>}
      />
    </div>
  );
}

export default Home;
