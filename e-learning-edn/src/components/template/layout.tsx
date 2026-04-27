import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";

export default function Layout() {
  return (
    <div>
      <Header />
      <main className="container mx-auto pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
