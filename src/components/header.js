import * as React from "react"
import { Link } from "gatsby"

const Header = ({ siteTitle }) => (
  <nav className="header">
    <Link className="logo" to="">GeoLead Analytics</Link>
    <div>
      <Link className="link" to="">Solutions</Link>
      <Link className="link" to="">About</Link>
      <Link className="link" to="">Contact us</Link>
    </div>
  </nav>
)

export default Header
