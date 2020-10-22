"use strict";

const apiKey = "pDTo9m0oGXSLF8dtss6DLSE8jqbft3wGupV6gwcD";
const searchURL = "https://api.nasa.gov";

function formatParams(params) {
    //may need more than 1 depending on how params need to be formated for each API
    const queryItems = Object.keys(params)
        .map(key => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        })
    return queryItems.join('&');
}

function fetchAndCatch(url) {
    return fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        //.then(responseJson => displayResults(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function getApod(selectedDate) {

    const params = {
        date: selectedDate,
        api_key: apiKey,
    }

    const queryString = formatParams(params)
    const url = searchURL + "/planetary/apod?" + queryString;

    return fetchAndCatch(url);
}

function getNeoWs(selectedDate) {
    const params = {
        start_date: selectedDate,
        end_date: selectedDate,
        api_key: apiKey,
    }

    const queryString = formatParams(params)
    const url = searchURL + "/neo/rest/v1/feed?" + queryString;

    return fetchAndCatch(url);
}

function getFetchRequests(selectedDate) {
    const apodFetch = getApod(selectedDate);
    const neowsFetch = getNeoWs(selectedDate);
    const marsPhotosFetch = marsPhotos(selectedDate); 
    Promise.all([apodFetch, neowsFetch, marsPhotosFetch])
        .then(promiseAll => displayResults(promiseAll, selectedDate));
}

function marsPhotos(selectedDate) {
    //get request for Insight API
    const params = {
        earth_date: selectedDate,
        api_key: apiKey
    }

    const queryString = formatParams(params)
    const url = searchURL + "/mars-photos/api/v1/rovers/curiosity/photos?" + queryString;

    return fetchAndCatch(url);
}



function isVideo(apodData) {
    //determine if ApodData is a youtube video, or an image. 
    if (apodData.url.includes("youtube")) {
        $("#aPOD-results").append(`
        <h3>Astronomy Picture of The Day!</h3>
        <p>${apodData.title}</p>
        <iframe
        src=${apodData.url} alt="Astronomy Picture of the Day">
        </iframe>`);
    } else {
        $("#aPOD-results").append(`
                    <h3>Astronomy Picture of The Day</h3>
                    <p>${apodData.title}</p>
                    <img src=${apodData.url} alt="Astronomy Picture of the Day"></img>`);
    }
}
function displayResults([apodData, neowsData, marsPhotosData], selectedDate) {

    //using .toLocaleString to add commas and round to two decimals. 
    let options = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
    let mphRounded = parseFloat(neowsData.near_earth_objects[selectedDate][0].close_approach_data[0].relative_velocity.miles_per_hour).toLocaleString(undefined, options);
    let distanceRounded = parseFloat(neowsData.near_earth_objects[selectedDate][0].close_approach_data[0].miss_distance.miles).toLocaleString(undefined, options);

    $("#aPOD-results").empty();

    isVideo(apodData);

    $("#neoWs-results").empty();
    $("#neoWs-results").append(`
                    <h3>Near Earth Object Alert!</h3>
                    <p>The asteroid ${neowsData.near_earth_objects[selectedDate][0].name.replace("(", '').replace(")", "")} is traveling 
                    at a relative speed of ${mphRounded} miles per hour,
                    and is approximately ${distanceRounded} miles from earth! </p>`)
    $("#mars-results").empty();
    $("#mars-results").append(`
                    <h3>Photos from Mars!</h3>
                    <p>The Mars rover took the below photo on this date, ${selectedDate}</p>
                    <img src= ${marsPhotosData.photos[0].img_src} alt="Mars Rover Photo"></img>`); 
    $("#results").removeClass("hidden");

    var num = 11234;
    console.log(num);
    console.log(distanceRounded);
}

function watchCalender() {

    $("#date-picker").flatpickr({
        enableTime: false,
        dateFormat: "Y-m-d",
        defaultDate: "today",
        maxDate: "today",
        minDate: "2020-01-01"

    });

    //.ready to generate data baased on the current date by default. 
    $("#date-picker-js").ready(function () {
        const selectedDate = $("#date-picker").val();
        getFetchRequests(selectedDate);
    });

    //.click if user wants to change date. 
    $("#date-picker-js").click(function () {
        const selectedDate = $("#date-picker").val();
        getFetchRequests(selectedDate);
    });
}

function hideResults() {
    //a function that hides results based on user request 
}



$(watchCalender); 
