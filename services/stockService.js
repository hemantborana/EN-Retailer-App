const STOCK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyY4ys2VzcsmslZj-vYieV1l-RRTp90eDMwcdANFZ3qecf8VRPgz-dNo46jqIqencqF/exec';

/**
 * Fetches stock data from the Google Apps Script.
 * The script is expected to return a JSON object with `success`, `timestamp`, and `data` properties.
 */
export const fetchStockData = async () => {
    try {
        const response = await fetch(STOCK_SCRIPT_URL);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const result = await response.json();
        if (result.success) {
            return {
                data: result.data,
                timestamp: result.timestamp
            };
        } else {
            throw new Error(result.message || 'The stock API returned an error.');
        }
    } catch (error) {
        console.error('Failed to fetch stock data:', error);
        throw error; // Re-throw to be caught by the calling function
    }
};
