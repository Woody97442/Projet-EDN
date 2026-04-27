"use client";

import { Link } from "react-router-dom";
import NavBar from "./navbar";

export default function Header() {
  return (
    <header className="w-full border-b bg-white fixed top-0 left-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 ">
        {/* Logo */}
        <Link to="/">
          <img
            src="/LOGO_EDN_2021_WEB.png"
            alt="Logo EDN"
            width={232}
            height={55}
          />
        </Link>
        <NavBar />
      </div>
    </header>
  );
}
