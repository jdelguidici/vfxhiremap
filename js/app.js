
import Data from "/js/data.js";
import GoogleMaps from "/js/maps.js";

/////////////////////////////////////////////////////////////////////
// CONSTANTS

const SPREADSHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTf6raNW5a9rdQ0HThuTnVAssnSxe3ZWDGDoz3CaAkC8g-fGRZBWOk5_7_3lqGVsiaeIxe5of8r38L1/pub?gid=728960864&single=true&output=csv";
const CLUSTER_MARKER = "/img/m";

////////////////////////////////////////////////////////////////////////////////
// Bootstrap

window.addEventListener("DOMContentLoaded", (event) => {
	new App().Run();
});

/////////////////////////////////////////////////////////////////////
// APP

class App extends GoogleMaps {
	constructor() {
		super();
		this.data = new Data(SPREADSHEET_CSV);
	}

	Run() {
		this.LoadMaps();
		this.data.Download(this.LoadedRow.bind(this));

		// Event listener
		document.getElementById("btn-reset").addEventListener("click",() => {
			this.ResetPosition();
		});
	}

	LoadedRow(row) {
		// When row is undefined, parsing has finished
		if(!row) {
			// Collect the studios
			var node = document.getElementById("btn-studio");
			for(var value of this.data.Studios()) {
				console.log(value);
				var li = document.createElement("li");				
				li.innerHTML = "<a class=\"dropdown-item\" href=\"#\">" + value + "</a>";
				node.appendChild(li);
			}
			return
		}
		// Place marker
		this.PlaceMarker(row);
	}
}

/////////////////////////////////////////////////////////////////////
// EXPORTS

export { App as default };
