


import Lookup from "./geocode.js";

////////////////////////////////////////////////////////////////////////////////
// DATA CLASS

// Data represents the data model for the application including downloading
// the CSV and parsing it
class Data {
	constructor(url,cb) {
		this.url = url
		this.rows = new Array();

		// Create groups which are used for selection of positions
		this.studio = new Group("nav-studio",cb);
		this.dept = new Group("nav-dept",cb);
		this.country = new Group("nav-country",cb);
	}

	// Download initiates the download of data from the remote source,
	// when done calls "callback"
	Download(callback) {
		var lookup = new Lookup();
		Papa.parse(this.url, {
			download: true,
			header: true,
			complete: function (_results) {
				callback();
			},
			step: function (row) {
				if (row.errors.length == 0) {
					row = new Row(row.data);
					if (row.isValid()) {
						// Lookup country from location (Address)		
						var country = lookup.Lookup(row.Location());
						if(country) {
							row.Set("Country",country);
						} else {
							console.log("Country lookup failed: ",row.Location());
						}
						// Add row to the master list of rows and the groupings
						this.rows.push(row);
						this.studio.Add(row.Studio(),row);
						this.dept.Add(row.Dept(),row);
						this.country.Add(row.Country(),row);
						callback(row);
					}
				}
			}.bind(this)
		});
	}

	// Reset selectors
	Reset() {
		this.studio.onClick();
		this.dept.onClick();
		this.country.onClick();
	}

	// Return groups
	StudioGroup() {
		return this.studio;
	}
	DeptGroup() {
		return this.dept;
	}
	CountryGroup() {
		return this.country;
	}

	// Return all rows
	Values() {
		return this.rows;
	}

	// Return number of positions
	Counter() {
		return this.rows.length;
	}
}


////////////////////////////////////////////////////////////////////////////////
// ROW CLASS

// Row implements a single job position or row in the spreadsheet
class Row {
	constructor(data) {
		this.data = new Map();
		for (var key in data) {
			var value = "" + data[key];
			this.data.set(key.trim(),value.trim());
		}
	}
	isValid() {
		if (this.Id() && this.Title() && this.LatLng()) {
			return (this.Status() && this.Status() == "live");
		} else {
			return false;
		}
	}
	Keys() {
		var keys = new Array();
		this.data.forEach((_,k) => {
			keys.push(k);
		});
		return keys;
	}
	Set(key,value) {
		this.data.set(key,value);
	}
	Get(key) {
		return this.data.get(key);
	}
	Id() {
		return this.data.get("Job Number");
	}
	Status() {
		return this.data.get("Job Status").toLowerCase();
	}
	Label() {
		return this.Title() + ", " + this.Studio()
	}
	Studio() {
		return this.data.get("Studio");
	}
	StudioUrl() {
		return this.data.get("Company URL");
	}
	Dept() {
		return this.data.get("Department");
	}
	Location() {
		return this.data.get("Location of Job");
	}
	Country() {
		return this.data.get("Country");
	}
	Title() {
		return this.data.get("Job");
	}
	LatLng() {
		if (this.data.get("Latitude") && this.data.get("Longitude")) {
			var lat = parseFloat(this.data.get("Latitude"));
			var lng = parseFloat(this.data.get("Longitude"));			
			return [ lat, lng ];
		}
	}
	Description() {
		return this.data.get("Job Summary");
	}
	toString() {
		var str = "<row";
		if (this.Id()) {
			str += " id=" + this.Id();
		}		if (this.Title()) {
			str += " title=" + this.Title();
		}
		if (this.LatLng()) {
			str += " latlng=" + this.LatLng();
		}
		return str + ">";
	}
}

////////////////////////////////////////////////////////////////////////////////
// GROUP CLASS

// Group represents the groupings for filtering data
class Group {
	constructor(id,cb) {
		this.id = id;
		this.cb = cb;
		this.data = new Map();
	}
	Add(value,row) {
		// Create a new array
		if(!this.data.has(value)) {
			this.data.set(value,new Array());
		}
		// Append row to array
		this.data.get(value).push(row);	
	}
	Keys() {
		var keys = new Array();
		this.data.forEach((_v,k) => {
			keys.push(k);
		});
		keys.sort();
		return keys;
	}
	Id() {
		return this.id;
	}
	onClick(value) {
		var rows = new Array();
		if(value) {
			rows = this.data.get(value);
		}
		if(this.cb) {
			this.cb(this.id,value,rows);
		} else {
			console.log("Clicked",this.id,"=>",value);
		}
	}
}

// EXPORTS
export { Data as default };
