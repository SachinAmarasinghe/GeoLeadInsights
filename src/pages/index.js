import * as React from "react"
import Layout from "../components/layout"
import Seo from "../components/seo"
import '../styles/styles.sass'
import { Link } from "gatsby-link"
import PostcodeAnalysis from "../components/postcodeAnalysis"

const IndexPage = () => (
  <Layout>
    <section className="hero">
      <h1>Unlock the Power of Geo Location Analytics for Enhanced Marketing Strategies</h1>
      <p>Gain valuable insights to supercharge your marketing efforts based on Geo Location data.</p>
      <Link className="btn">Get started</Link>
    </section>
    <section>
      <PostcodeAnalysis />
    </section>


  </Layout>
)

export const Head = () => <Seo title="GeoLead Analytics" />

export default IndexPage
