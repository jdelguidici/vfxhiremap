
class Groups {
	constructor() {
		this.data = new Object();
	}
	Add(row) {
		if(row.Studio()) {
			this.AddKey("studio",row.Studio());
		}
	}
	AddKey(key,value) {
		if(!this.data[key]) {
			this.data[key] = new Map();
		}
		this.data[key].set(value,true);
	}
	Studios() {
		var m = this.data["studio"];
		if(m) {
			return m.keys();
		}
	}
}

class Data {
	constructor(url) {
		this.url = url
		this.rows = new Array();
		this.groups = new Groups();
	}

	// Download initiates the download of data from the remote source,
	// when done calls "callback"
	Download(callback) {
		Papa.parse(this.url, {
			download: true,
			header: true,
			complete: function (results) {
				callback();
			},
			step: function (row) {
				if (row.errors.length == 0) {
					row = new Row(row.data);
					if (row.isValid()) {
						callback(row);
					}
					this.groups.Add(row);
				}
			}.bind(this)
		});
	}

	// Return all studios
	Studios() {
		return this.groups.Studios();
	}
}

class Row {
	constructor(data) {
		this.data = new Object();
		for (var key in data) {
			this.data[key.trim()] = data[key];
		}
	}
	isValid() {
		if (this.Id() && this.Title() && this.LatLng()) {
			return true;
		} else {
			return false;
		}
	}
	Id() {
		return this.data["Job Number"].trim();
	}
	Label() {
		return this.Title() + ", " + this.Studio()
	}
	Studio() {
		return this.data["Studio"].trim();
	}
	Title() {
		return this.data["Job"].trim();
	}
	LatLng() {
		if (this.data["Latitude"] && this.data["Longitude"]) {
			var lat = parseFloat(this.data["Latitude"]);
			var lng = parseFloat(this.data["Longitude"]);
			return [ lat, lng ];
		}
	}
	Description() {
		return this.data["Job Summary"].trim();
	}
	toString() {
		var str = "<row";
		if (this.Id()) {
			str += " id=" + this.Id();
		}
		if (this.Title()) {
			str += " title=" + this.Title();
		}
		if (this.LatLng()) {
			str += " latlng=" + this.LatLng();
		}
		return str + ">";
	}
}

// EXPORTS
export { Data as default };
