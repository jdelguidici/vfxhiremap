
import Data from "./data.js";

/////////////////////////////////////////////////////////////////////
// CONSTANTS

const SPREADSHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTf6raNW5a9rdQ0HThuTnVAssnSxe3ZWDGDoz3CaAkC8g-fGRZBWOk5_7_3lqGVsiaeIxe5of8r38L1/pub?gid=728960864&single=true&output=csv";
const MAPBOX_TOKEN = "pk.eyJ1IjoiZGp0aG9ycGUiLCJhIjoiY2tqeTZ2MXptMGFqYTJvbW5veXN6ZzdmNyJ9.LDOhC3y0Py3W7P1bQ5Vbeg";
const TILE_URL = "//api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";
const ROOT_URL = "/vfxhiremap";
const DEFAULT_LAT = 15.017689139787977;
const DEFAULT_LNG = 26.233512501537124;
const DEFAULT_ZOOM = 2;
const MAX_ZOOM = 20;

////////////////////////////////////////////////////////////////////////////////
// BOOTSTRAP APP

window.addEventListener("DOMContentLoaded", (event) => {
	new App("map").Main();
});

////////////////////////////////////////////////////////////////////////////////
// APP CLASS

class App {
    constructor(mapId) {
        this.map = null;
        this.mapId = mapId;
        this.data = new Data(SPREADSHEET_CSV);
        this.markers = null;        // L.markerClusterGroup()
        this.details = null;        // bootstrap.Collapse()
    }
    // Main function
    Main() {
        // Load scripts
        this.importScript(ROOT_URL + "/js/papaparse.min.js",this.loadData.bind(this));        
        this.importScript(ROOT_URL + "/js/leaflet.js",function() {            
            this.importScript(ROOT_URL + "/js/leaflet.markercluster.js",this.loadCluster.bind(this));   
        }.bind(this));
    }
    // import script into document and callback when done
    importScript(url,cb) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.addEventListener('load',() => {
            if(cb) {
                cb();

            }
        });
        document.body.append(script);
    }
    // initialise buttons and details. Map is invalidated (redrawn)
    // whenever the details window is open or closed
	loadButtons() {
        this.details = new bootstrap.Collapse(document.getElementById('details'),{
            toggle: false,
        });
        document.getElementById('details').addEventListener('shown.bs.collapse',() => {
            this.map.invalidateSize();
        });
        document.getElementById('details').addEventListener('hidden.bs.collapse',() => {
            this.map.invalidateSize();
        });
		document.getElementById("nav-reset").addEventListener("click",() => {
            this.map.setView([DEFAULT_LAT,DEFAULT_LNG],DEFAULT_ZOOM);
            this.details.hide();
		});
		document.getElementById("nav-close").addEventListener("click",() => {
            this.details.hide();
		});
    }
    // Create the map and all associated marker icons
    createMap() {
        this.map = L.map(this.mapId).setView([DEFAULT_LAT,DEFAULT_LNG],DEFAULT_ZOOM);
        this.icon = L.divIcon({
            className: 'cluster-icon bg-danger text-light',
            html: '<span class="dot"></span>',
            popupAnchor: [ 6, 6 ],
        });
        L.tileLayer(TILE_URL,{
            tileSize: 512,
            maxZoom: MAX_ZOOM,
            zoomOffset: -1,
            id: 'mapbox/light-v10',
            accessToken: MAPBOX_TOKEN,
        }).addTo(this.map);
    }
    // Loaded cluster library, assume this means everything is
    // loaded and map can be drawn
    loadCluster() {
        this.createMap();
        this.loadButtons();
        this.markers = L.markerClusterGroup({
            maxClusterRadius: 25,
            iconCreateFunction: this.clusterIcon.bind(this),
        });
        this.map.addLayer(this.markers);
    }
    // Return the cluster icon with the number of clusters displayed
    clusterIcon(cluster) {
        return L.divIcon({
            className: 'cluster-icon bg-danger text-light',
            html: "<strong>" + cluster.getChildCount() + "</strong>",
            iconAnchor: [ 6,6 ],
            popupAnchor: [ 6, 6 ],
        });
    }
    // Load the CSV data
    loadData() {
        this.data.Download(this.loadRow.bind(this));
    }
    // Place marker when a row is loaded
    loadRow(row) {
        if(row) {
            var latlng = row.LatLng();
            if(latlng) {
                var marker = L.marker(latlng,{
                    icon: this.icon,
                    title: row.Label(),
                });
                marker.bindPopup(row.Label());
                marker.addEventListener('click',() => {
                    this.clickMarker(marker,row);
                });
                this.markers.addLayer(marker);    
            }
        } else {
            console.log("All data loaded");
        }
    }
    // Marker clicked
    clickMarker(marker,row) {
        // Update card with details
        this.updateDetails(row);
        // Show details
        this.details.show();        
        // Update map size
        this.map.invalidateSize();
        // Center the marker in the map
        this.map.panTo(marker.getLatLng());
    }
    // Update details
    updateDetails(row) {
        document.querySelector("#details .card-title").innerText = row.Title();
        document.querySelector("#details .card-subtitle").innerText = row.Studio();
        document.querySelector("#details .card-text").innerText = row.Description();
    }
}