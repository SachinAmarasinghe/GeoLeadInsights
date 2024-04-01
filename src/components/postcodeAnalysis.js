import React, { useEffect, useState } from "react"
import { Link } from "gatsby-link"
import { StaticImage } from "gatsby-plugin-image"
import postcodeData from "../data/transformed_postal_fsa.json"



const PostcodeAnalysis = () => {

    const [postcodes, setPostcodes] = useState([])
    const [postalFSAData, setPostalFSAData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postcodesWithCities, setPostcodesWithCities] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [resultsPerPage, setResultsPerPage] = useState(30)

    useEffect(() => {
        setPostalFSAData(postcodeData)
    }, [])



    const handleChange = (e) => {
        setPostcodes(e.target.value.split(/\r?\n/));
    }

    const cleanPostCodes = (postCodeString) => {
        return postCodeString.flatMap(line => line.split(','))
            .map(code => code.trim().toUpperCase().replace(/\s+/g, '').substring(0, 3))
            .filter(code => code.length === 3);
    }

    const getPostCodesWithCities = () => {
        const individualResults = []
        const cleanedPostcodes = cleanPostCodes(postcodes)
        cleanedPostcodes.forEach((code, index) => {
            const cityEntry = postalFSAData.find(entry => entry.Postal_FSA.includes(code.substring(0, 3)));
            individualResults.push({
                Code: code,
                City: cityEntry ? cityEntry.City_Name : "Not Found"
            });
        });
        setPostcodesWithCities(individualResults)
    }

    const handleClick = () => {
        getPostCodesWithCities();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const indexOfLastResult = currentPage * resultsPerPage
    const indexOfFirstResult = indexOfLastResult - resultsPerPage
    const currentResults = postcodesWithCities.slice(indexOfFirstResult, indexOfLastResult)

    const renderTableRows = () => {
        return currentResults.map((data, index) => (
            <tr key={index}>
                <td>{data.Code}</td>
                <td>{data.City}</td>
            </tr>
        ))
    }

    const pageNumbers = []
    for (let i = 1; i <= Math.ceil(postcodesWithCities.length / resultsPerPage); i++) {
        pageNumbers.push(i)
    }


    return (
        <div>
            <div className="heading_H2">
                <h2>GeoOptimized Insights</h2>
            </div>
            <div className="container">
                <p>
                    Paste a list of postal codes, and we'll provide you with a detailed breakdown of Forward Sortation Areas (FSAs) and associated city names, highlighting the frequency of occurrences.
                </p>

                <div className="form">
                    <textarea rows={20} onChange={handleChange} value={postcodes}></textarea>
                    <button className="btn btn-small" onClick={handleClick}>Analyze</button>
                </div>

                <div className="loader">
                    <span>Analysis running...</span>
                    <div></div>
                </div>
            </div>

            <div className="cities-and-top30">
                <div className="container">
                    <div className="postcode-table">
                        <h3>Postal Codes with cities</h3>
                        <div className="heading">
                            <div className="pagination">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                    <StaticImage src="../images/chevron-left.svg" width={20} height={20} quality={100} alt="left" />
                                </button>
                                <span>{currentPage}</span>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.ceil(postcodesWithCities.length / resultsPerPage)}>
                                    <StaticImage src="../images/chevron-right.svg" width={20} height={20} quality={100} alt="right" />
                                </button>
                            </div>
                            <a className="btn btn-small" >Download full list (csv)</a>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Postal Code</th>
                                    <th>City</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderTableRows()}

                            </tbody>
                        </table>
                    </div>

                    <div className="postcode-table">
                        <h3>Top 30 postal codes</h3>
                        <div className="heading">
                            <a className="btn btn-small" >Download top 30 list (csv)</a>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Postal Code</th>
                                    <th>City</th>
                                    <th>Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="cities-group">
                <div className="container">
                    <div className="postcode-table">
                        <h3>Postal Code breakdown grouped by cities</h3>
                        <div className="heading">
                            <a className="btn btn-small" >Download City breakdown list (csv)</a>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>City</th>
                                    <th>Postal Codes / FSAs</th>
                                    <th>Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div >
    )
}

export default PostcodeAnalysis