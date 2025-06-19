import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-[#0a1f44] text-[#e0f0ff] shadow-md z-[1000] px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold">TurMaipo 🚌</h1>
      <span className="text-sm text-[#d1ecff]">Pasajero</span>
    </header>
  );
};

export default Header;
