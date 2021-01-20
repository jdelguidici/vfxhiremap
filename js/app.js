
import Data from "./data.js";
import { CounterView, DropdownView } from "./view.js";

/////////////////////////////////////////////////////////////////////
// CONSTANTS

const SPREADSHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTf6raNW5a9rdQ0HThuTnVAssnSxe3ZWDGDoz3CaAkC8g-fGRZBWOk5_7_3lqGVsiaeIxe5of8r38L1/pub?gid=1805947673&single=true&output=csv";
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
        this.data = new Data(SPREADSHEET_CSV, this.onSelectDropdownItem.bind(this));
        this.markers = null;        // L.markerClusterGroup()
        this.details = null;        // bootstrap.Collapse()

        // Views
        this.counterView = new CounterView("nav-counter");
        this.countryView = new DropdownView("nav-country","nav-country-menu","Country");
        this.deptView = new DropdownView("nav-dept","nav-dept-menu","Department");
        this.studioView = new DropdownView("nav-studio","nav-studio-menu","Studio");
    }

    // Main function
    Main() {
        // Load scripts
        this.importScript(ROOT_URL + "/js/papaparse.min.js", this.loadData.bind(this));
        this.importScript(ROOT_URL + "/js/leaflet.js", function () {
            this.importScript(ROOT_URL + "/js/leaflet.markercluster.js", this.loadCluster.bind(this));
        }.bind(this));
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
            iconCreateFunction: this.clusterIcon.bind(this),
        });
        this.map.addLayer(this.markers);
    }

    // Return the icon for a job
    jobIcon(row) {
        return L.icon({
            iconUrl: ROOT_URL + "/img/geo-alt-fill.svg",
            iconSize: [30, 75],
            iconAnchor: [15, 45],
            popupAnchor: [0, -10],
            className: 'job-icon',
        });
    }

    // Return the cluster icon with the number of jobs the
    // cluster represents
    clusterIcon(cluster) {
        var img = document.createElement("img");
        img.src = ROOT_URL + "/img/geo-alt-fill.svg";
        img.className = "cluster-icon";
        return L.divIcon({
            html: img.outerHTML + "<strong>" + cluster.getChildCount() + "</strong>",
            iconSize: [30, 75],
            iconAnchor: [15, 45],
            className: "cluster-marker",
        })
    }

    // Load the CSV data
    loadData() {
        this.data.Download(this.loadRow.bind(this));
    }

    // Place marker when a row is loaded
    loadRow(row) {
        if (row) {
            var latlng = row.LatLng();
            if (latlng) {
                var marker = L.marker(latlng, {
                    icon: this.jobIcon(row),
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
        this.updateDetails(row);
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
        // Reset all views
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
        } 
        
        // Update counter
        this.counterView.Set(rows.length);
    }

    // Update details
    updateDetails(row) {
        // Scroll pane to top
        document.querySelector("#details .card-list").parentNode.scrollTop = 0;
        // Set title, subtitle
        document.querySelector("#details .card-title").innerText = row.Title();
        document.querySelector("#details .card-subtitle").innerText = row.Studio();
        // List of details
        document.querySelector("#details .card-list").innerHTML = "";
        row.Keys().forEach((k) => {
            // Exclude certain items
            switch (k) {
                case "Longitude":
                case "Latitude":
                case "Job Status":
                case "Country":
                case "Job":
                case "Studio":
                    break;
                default:
                    this.createListItem(document.querySelector("#details .card-list"), k, row.Get(k));
            }
        });
    }

    // Generate a list item
    createListItem(node, key, value) {
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.innerText = key;
        dt.className = "col-sm-4";
        dd.innerText = value;
        dd.className = "col-sm-8";
        node.appendChild(dt);
        node.appendChild(dd);
    }

    // Populate dropdowns
    populateDropdown(q, group) {
        var node = document.querySelector(q);
        if (node) {
            node.innerHTML = "";
            group.Values().forEach((value) => {
                node.appendChild(this.createDropdownItem(q, value, group));
            });
        }
    }

    // Create a dropdown item
    createDropdownItem(q, value, group) {
        var a = document.createElement("a");
        var li = document.createElement("li");
        li.appendChild(a);
        a.className = "dropdown-item";
        a.href = "#";
        a.innerText = value;
        a.addEventListener('click', () => {
            // Fire event to filter markers to group
            group.onClick(value);
            // Add in one active
            a.className = "dropdown-item active";
        })
        return li;
    }
}