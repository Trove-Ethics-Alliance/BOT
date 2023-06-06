const axios = require('axios');

/**
 * Check if a string is a valid JSON.
 * @param {string} jsonString - The string to check for JSON validity.
 * @returns {boolean} True if the string is valid JSON, false otherwise.
 */
function isValidJSON(jsonString) {
    try {
        JSON.parse(jsonString);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Make an API call using Axios.
 * @param {string} url - The URL to make the API call to.
 * @param {string} method - The HTTP method to use for the request (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {string} [data] - Optional. The data to send with the request. Must be a valid JSON string.
 * @returns {Promise<any>} A promise that resolves with the response data if the request is successful, or rejects with an error if there is a failure.
 */
function apiCall(url, method, data) {
    return new Promise((resolve, reject) => {

        // Validate JSON input parameter.
        if (data) {
            if (isValidJSON(data) === false) return reject(new Error('Data must be a valid JSON string.'));
        }

        // Make options object for Axios to handle requests.
        const options = {
            baseURL: process.env.API_URL,
            method,
            url,
            data: data ? data : undefined,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'tea-discord-bot',
                'authorization': process.env.API_TOKEN,
            },
        };

        // Use Axios to create the http request.
        axios(options)
            .then(response => resolve(response.data))
            .catch(reject);
    });
}

module.exports.apiCall = apiCall;