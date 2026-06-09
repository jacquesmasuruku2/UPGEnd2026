import Navbar from "./Navbar";
import FooterSection from "./FooterSection";
import ScrollToTop from "./ScrollToTop";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <FooterSection />
    <ScrollToTop />
  </>
);

export default Layout;
