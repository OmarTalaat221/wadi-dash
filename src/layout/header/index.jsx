import React from 'react';
import ProfileMenu from '../../components/header/profileMenu';

function Header() {
  return (
    <header>
      <img src="/menu.svg" alt="" />
      <div className="profileMenu">
        <ProfileMenu />
      </div>
    </header>
  );
}

export default Header;
