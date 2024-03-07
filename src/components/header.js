import * as React from "react"
import { Link } from "gatsby"

const Header = ({ siteTitle }) => (
  <nav className="header">
    <Link className="logo">GeoLead Analytics</Link>
    <div>
      <Link className="link">Solutions</Link>
      <Link className="link">About</Link>
      <Link className="link">Contact us</Link>
    </div>
  </nav>
)

export default Header
