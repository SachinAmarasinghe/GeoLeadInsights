//button click
const analysePostCodes = async () => {
  showLoader(true);

  cleanup();

  let fsadata = loadFSAData();

  let inputData = getInputData();

  const fsaWithCity = assignCities(inputData,fsadata);

  countFSA(fsaWithCity);

  groupByCities(fsaWithCity);

  showLoader(false);
};

//load fsa reference table
const loadFSAData = async () => {
  try {
    const response = await fetch("transformed_postal_fsa.json"); // Adjust the path as necessary
    let fsaData = await response.json();
    return fsaData;
  } catch (error) {
    console.error("Error loading postal data:", error);
    return error;
  }
};

//get input FSA's
const getInputData = () => {
  const inputData = document.getElementById("postalCodesInput").value;
  const lines = inputData.split(/\r?\n/);
  const postalCodes = lines.map((line) =>
    line.trim().toUpperCase().replace(/\s+/g, "").substring(0, 3)
  );

  return inputData;
};

//assign cities for FSA's
const assignCities = (inputData,fsaData) => {
  let dataWithCities = [];
  
  return dataWithCities;
};

//count FSAs and get top 30
const countFSA = (data) => {
  let fsaCount = [];
  return fsaCount;
};

//group by cities and show FSA's and count
const groupByCities = (data) => {
  let cityGroup = [];
  return cityGroup;
};

//show loader
const showLoader = (show) => {
  if (show) {
    //show loader
    document.getElementById("results").style.display = "none";
    document.getElementById("loader").style.display = "block";
  } else {
    //hide loader
    document.getElementById("results").style.display = "block";
    document.getElementById("loader").style.display = "none";
  }
};

//cleanup data
const cleanup = () => {
  //clean data shown
};
