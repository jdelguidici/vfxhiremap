
////////////////////////////////////////////////////////////////////////////////
// CONSTANTS

// Map locations to countries
const Countries = {
    "france": "France",
    "paris": "France",
    "berlin": "Germany",
    "germany": "Germany",
    "london": "United Kingdom",
    "bristol": "United Kingdom",
    "united states": "United States",
    "los angeles": "United States",
    "burbank": "United States",
    "canada": "Canada",
    "montreal": "Canada",
    "vancouver": "Canada",
    "toronto": "Canada",
    "beijing": "China",
    "china": "China",
    "australia": "Australia",
    "sydney": "Australia",
    "adelaide": "Australia",
    "singapore": "Singapore",
    "south korea": "South Korea",
    "seoul": "South Korea",
    "nz": "New Zealand",
    "new zealand": "New Zealand",
    "spain": "Spain",
    "madrid": "Spain",
    "barcelona": "Spain",
    "california": "United States",
    "sweden": "Sweden",
    "stockholm": "Sweden",
    "amsterdam": "Netherlands",
    "netherlands": "Netherlands",
    "oslo": "Norway",
    "norway": "Norway",
    "malta": "Malta",
};

////////////////////////////////////////////////////////////////////////////////
// LOOKUP CLASS

// Data represents the data model for the application including downloading
// the CSV and parsing it
class Lookup {
    Lookup(value) {
        var k = ("" + value).toLowerCase();
        for(var keyword in Countries) {
            if(k.includes(keyword)) {
                return Countries[keyword];
            }            
        }
    }
}

// EXPORTS
export { Lookup as default };
