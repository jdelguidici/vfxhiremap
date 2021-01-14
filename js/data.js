


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
		if (this.Id() && this.Title() && this.Pos()) {
			return true;
		} else {
			return false;
		}
	}
	Id() {
		return this.data["Job Number"];
	}
	Label() {
		return this.Title() + ", " + this.Studio()
	}
	Studio() {
		return this.data["Studio"];
	}
	Title() {
		return this.data["Job"];
	}
	Pos() {
		if (this.data["Latitude"] && this.data["Longitude"]) {
			var lat = parseFloat(this.data["Latitude"]);
			var lng = parseFloat(this.data["Longitude"]);
			return new LatLong(lat, lng)
		}
	}
	toHTML() {
		var str = "<div><strong>" + this.Title() + "</strong></div>";
		for (var k in this.data) {
			switch (k) {
				case "Studio":
				case "Job Summary":
				case "Department":
					str += "<li><strong>" + k + "</strong>: " + this.data[k] + "</li>";
					break;
				default:
					console.log(">" + k + "<");
					break;
			}
		}
		return str;
	}
	toString() {
		var str = "<row";
		if (this.Id()) {
			str += " id=" + this.Id();
		}
		if (this.Title()) {
			str += " title=" + this.Title();
		}
		if (this.Pos()) {
			str += " pos=" + this.Pos();
		}
		return str + ">";
	}
}

class LatLong {
	constructor(lat, lng) {
		this.lat = lat;
		this.lng = lng;
	}
	toString() {
		return "<lat=" + this.lat + " lng=" + this.lng + ">"
	}
}


// EXPORTS
export { Data as default };
