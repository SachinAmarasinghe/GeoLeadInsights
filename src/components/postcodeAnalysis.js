import * as React from "react"
import { Link } from "gatsby-link"

const PostcodeAnalysis = () => (
    <div>
        <div className="heading_H2">
            <h2>GeoOptimized Insights</h2>
        </div>
        <div className="container">
            <p>
                Paste a list of postal codes, and we'll provide you with a detailed breakdown of Forward Sortation Areas (FSAs) and associated city names, highlighting the frequency of occurrences.
            </p>

            <div className="form">
                <textarea rows={20}></textarea>
                <button className="btn btn-small">Analyze</button>
            </div>

            <div className="loader">
                <span>Analysis running...</span>
                <div></div>
            </div>

            <div>

            </div>

        </div>
    </div>
)

export default PostcodeAnalysis