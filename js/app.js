
import Data from "./data.js";
import { CounterView, DropdownView, DetailView, MarkerView } from "./view.js";

/////////////////////////////////////////////////////////////////////
// CONSTANTS

const SPREADSHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTf6raNW5a9rdQ0HThuTnVAssnSxe3ZWDGDoz3CaAkC8g-fGRZBWOk5_7_3lqGVsiaeIxe5of8r38L1/pub?gid=1805947673&single=true&output=csv";
const MAPBOX_TOKEN = "pk.eyJ1IjoiZGp0aG9ycGUiLCJhIjoiY2tqeTZ2MXptMGFqYTJvbW5veXN6ZzdmNyJ9.LDOhC3y0Py3W7P1bQ5Vbeg";
const TILE_URL = "//api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";
const ROOT_URL = "/vfxhiremap";
const DEFAULT_LAT = 15.017689139787977;
const DEFAULT_LNG = 26.233512501537124;
const DEFAULT_ZOOM = 2;
const MAX_ZOOM = 12;

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

        // Models
        this.data = new Data(SPREADSHEET_CSV, this.onSelectDropdownItem.bind(this));
        this.markers = null;        // L.markerClusterGroup()
        this.details = null;        // bootstrap.Collapse()

        // Views
        this.counterView = new CounterView("nav-counter");
        this.countryView = new DropdownView("nav-country","nav-country-menu","Country");
        this.deptView = new DropdownView("nav-dept","nav-dept-menu","Department");
        this.studioView = new DropdownView("nav-studio","nav-studio-menu","Studio");
        this.detailView = new DetailView(ROOT_URL,"details");
        this.markerView = new MarkerView(ROOT_URL);
    }

    // Main function
    Main() {
        // Load scripts
        this.importScript(ROOT_URL + "/js/papaparse.min.js", this.loadData.bind(this));
        this.importScript(ROOT_URL + "/js/leaflet.js", function () {
            this.importScript(ROOT_URL + "/js/leaflet.markercluster.js", this.loadCluster.bind(this));
        }.bind(this));
    }

    // SelectMarkers makes visible markers and then
    // zooms the map to those markers
    SelectMarkers(rows) {
        var group = new L.featureGroup();
        this.markers.clearLayers();
        rows.forEach((row) => {
            var layer = this.loadRow(row);
            if(layer) {
                group.addLayer(layer);
            }
        });
        if(rows.length) {
            this.map.fitBounds(group.getBounds(),{
                padding: [20,20],

                maxZoom: MAX_ZOOM,
            });      
        }
    }

    // import script into document and callback when done
    importScript(url, cb) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.addEventListener('load', () => {
            if (cb) {
                cb();
            }
        });
        document.body.append(script);
    }

    // initialise buttons and details. Map is invalidated (redrawn)
    // whenever the details window is open or closed
    loadButtons() {
        this.details = new bootstrap.Collapse(document.getElementById('details'), {
            toggle: false,
        });
        document.getElementById('details').addEventListener('shown.bs.collapse', () => {
            // Reset map state
            this.map.invalidateSize();
        });
        document.getElementById('details').addEventListener('hidden.bs.collapse', () => {
            // Reset map state
            this.map.invalidateSize();
        });
        document.getElementById("nav-reset").addEventListener("click", () => {
            // Reset map state
            this.map.setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);

            // Hide details pane
            this.details.hide();

            // Reset data
            this.data.Reset();

            // Select all rows
            this.SelectMarkers(this.data.Values());

            // Update counter view
            this.counterView.Set(this.data.Counter());
        });
        document.getElementById("nav-close").addEventListener("click", () => {
            // Hide details pane
            this.details.hide();
        });
    }

    // Create the map and all associated marker icons
    createMap() {
        this.map = L.map(this.mapId).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
        L.tileLayer(TILE_URL, {
            tileSize: 512,
            minZoom: DEFAULT_ZOOM,
            maxZoom: MAX_ZOOM,
            zoomOffset: -1,
            id: 'mapbox/light-v10',
            accessToken: MAPBOX_TOKEN,
        }).addTo(this.map);

        // Nasty hack oops
        document.getElementsByClassName('leaflet-control-attribution')[0].style.fontSize = '0px';
    }

    // Loaded cluster library, assume this means everything is
    // loaded and map can be drawn
    loadCluster() {
        this.createMap();
        this.loadButtons();
        this.markers = L.markerClusterGroup({
            maxClusterRadius: 25,
            iconCreateFunction: this.markerView.Cluster.bind(this.markerView),
        });
        this.map.addLayer(this.markers);
    }

    // Load the CSV data
    loadData() {
        this.data.Download(this.loadRow.bind(this));
    }

    // Place marker when a row is loaded and return the
    // marker if it has been added to the map
    loadRow(row) {
        if (row) {
            var latlng = row.LatLng();
            if (latlng) {
                var marker = L.marker(latlng, {
                    icon: this.markerView.Marker(row),
                    title: row.Label(),
                });
                marker.bindPopup(row.Label());
                marker.addEventListener('click', () => {
                    this.onClickMarker(marker, row);
                });
                this.markers.addLayer(marker);
                marker.addEventListener('popupclose', () => {
                    this.onPopupClose(marker, row);
                });
                return marker
            }
        } else {
            // When all the rows have been loaded, populate dropdowns
            this.countryView.Set(this.data.CountryGroup());
            this.deptView.Set(this.data.DeptGroup());
            this.studioView.Set(this.data.StudioGroup());

            // Update counter view
            this.counterView.Set(this.data.Counter());
        }
    }

    // Marker clicked
    onClickMarker(marker, row) {
        // Update card with details
        this.detailView.Set(row);
        // Show details
        this.details.show();
        // Update map size
        this.map.invalidateSize();
        // Center the marker in the map
        this.map.panTo(marker.getLatLng());
    }

    // Popup closed, close details pane
    onPopupClose(marker, row) {
        // TODO: We may have selected a different popup, this
        // logic needs to be developed with cancellation of hide
        // if other job is selected
        //this.details.hide();
    }

    // Update filtering display
    onSelectDropdownItem(id,value,rows) {
        // Reset dropdown views
        this.countryView.Reset();
        this.deptView.Reset();
        this.studioView.Reset();

        // Select a value
        switch(id) {
        case "nav-country":
            this.countryView.Select(value);
            break
        case "nav-studio":
            this.studioView.Select(value);
            break
        case "nav-dept":
            this.deptView.Select(value);
            break  
        default:
            rows = this.data.Values();
        }

        // SelectMarkers from rows
        this.SelectMarkers(rows);

        // If there's a single row then show details pane or else hide
        if(rows && rows.length == 1) {
            this.detailView.Set(rows[0]);
            this.details.show();
        } else {
            this.details.hide();
        }
        
        // Update counter
        this.counterView.Set(rows.length);
    }
}