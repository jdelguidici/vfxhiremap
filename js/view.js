


////////////////////////////////////////////////////////////////////////////////
// CONSTANTS

// Map roles to colours. Empty key is default
const Palette  = {
    "": "carrot",
    "Production": "turquoise",
    "Executive": "peter-river",
    "Animation": "amethyst",
    "Art Direction": "alizarin",
    "Compositing": "sunflower",
    "VFX Supervision": "midnight-blue",
    "CG": "carrot",
    "FX": "carrot",
}

////////////////////////////////////////////////////////////////////////////////
// COUNTER VIEW

export class CounterView {
    constructor(id) {
        this.node = document.getElementById(id);
    }
    Set(value) {
        if(value == 1) {
            this.node.innerText = "Showing " + value + " role";
        } else if(value > 1) {
            this.node.innerText = "Showing " + value + " roles";
        } else {
            this.node.innerText = "";
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
// MARKER VIEW

export class MarkerView {
    constructor(baseurl) {
        this.baseurl = baseurl;
    }
    Cluster(cluster) {
        var img = document.createElement("img");
        img.src = this.baseurl + "/img/cluster-icon.svg";
        img.className = "cluster-icon";
        img.width = "30";
        img.height = "30";
        return L.divIcon({
            html: img.outerHTML + "<strong>" + cluster.getChildCount() + "</strong>",
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            className: "cluster-marker",
        })
    }

    Marker(row) {
        var color = colorForValue(row.Dept());
        return L.icon({
            iconUrl: this.baseurl + "/img/marker-icon-" + color + ".svg",
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -10],
            className: 'job-marker',
        });
    }
}


////////////////////////////////////////////////////////////////////////////////
// DROPDOWN VIEW

export class DropdownView {
    constructor(button,menu,title) {
        this.button = document.getElementById(button);
        this.menu = document.getElementById(menu);
        this.title = title;
    }

    // SetMenu will populate the menu
    Set(group) {
        this.menu.innerHTML = "";
        group.Keys().forEach((value) => {
            this.menu.appendChild(this.createDropdownItem(value, group));
        });
    }

    // Reset will remove active menu items
    Reset() {
        // Disable dropdown item active state for all menus
        this.menu.querySelectorAll("a.dropdown-item").forEach((node) => {
            node.classList.remove("active");
        });
        // Set the button text
        this.button.innerText = this.title;
    }

    // Select value
    Select(value) {
        if (value) {
            this.button.innerText = this.title + ": " + value;
        }
    }

    // createDropdownItem creates a menu item
    createDropdownItem(value, group) {
        var a = document.createElement("a");
        var li = document.createElement("li");
        li.appendChild(a);        
        a.className = "dropdown-item";
        a.href = "#";
        a.innerHTML = value;
        if(group.Id() == "nav-dept") {
            var color = colorForValue(value);
            a.className = "dropdown-item text-bullet bg-image-" + color;
        }
        a.addEventListener('click', () => {
            // Make active
            a.classList.add("active");

            // Fire event to filter markers to group
            group.onClick(value);
        })
        return li;
    } 
}

////////////////////////////////////////////////////////////////////////////////
// DETAIL VIEW

export class DetailView {
    constructor(baseurl,node) {
        this.baseurl = baseurl;
        this.node = document.getElementById(node);
    }

    // Set details from row
    Set(row) {
        // Set title, subtitle
        this.node.querySelector(".card-title").innerText = row.Title();
        this.SetSubtitle(this.node.querySelector(".card-subtitle"),row);
        this.SetDetails(this.node.querySelector(".card-list"),row);
    }
    SetDetails(node,row) {
        node.innerHTML = "";
        var dl = document.createElement("DL");
        dl.className = "row";
        row.Keys().forEach((k) => {
            switch (k) {
                // Exclude certain items
                case "Longitude":
                case "Latitude":
                case "Job Status":
                case "Country":
                case "Job":
                case "Studio":
                case "Company URL":
                    break;
                // Turn Glassdoor rating into rating item out of five
                case "Glassdoor Score (5)":
                    var value = parseFloat(row.Get(k));
                    if(value >= 0 && value <= 5) {
                        this.createRatingItem(dl,k,value);
                        break    
                    } else {
                        this.createListItem(dl,k,row.Get(k));
                        break    
                    }
                // Otherwise standard list item
                default:
                    this.createListItem(dl, k, row.Get(k));
            }
        });
        node.appendChild(dl);
        node.scrollTo(0,0);
    }

    SetSubtitle(node,row) {
        node.innerHTML = "";
        var url = row.StudioUrl();
        if(url) {
            var a = document.createElement("A");
            a.href = url
            a.innerText = row.Studio();
            a.className = "text-decoration-none fw-bold";
            a.style.color = "inherit";
            a.target = "_blank";
            node.appendChild(a);
            var img = document.createElement("IMG");
            img.src = this.baseurl + "/img/link-45deg.svg"
            a.appendChild(img);
        } else {
            node.innerText = row.Studio();
        }
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

    // Generate a rating item
    createRatingItem(node, key, value) {
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        var rating = new RatingView(this.baseurl,dd);
        dt.innerText = key;
        dt.className = "col-sm-4";
        dd.className = "col-sm-8";
        node.appendChild(dt);
        node.appendChild(dd);        
        rating.Set(value);
    }
}


////////////////////////////////////////////////////////////////////////////////
// RATING VIEW

export class RatingView {
    constructor(baseurl,node) {
        this.baseurl = baseurl;
        this.node = node;
        this.outof = 5;
    }  
    Set(value) {
        var rating = value
        this.node.innerHTML = "";     
        for(var i = 0; i < this.outof; i++) {
            if(value <= 0.0) {
                this.node.appendChild(this.createStar("",rating));
            } else if(value >= 1.0) {                
                this.node.appendChild(this.createStar("fill",rating));
            } else {
                this.node.appendChild(this.createStar("half",rating));
            }
            value = value - 1.0;
        }
    }
    createStar(value,text) {
        var img = document.createElement("img");
        if(value) {
            img.src = this.baseurl + "/img/star-" + value + ".svg";
        } else {
            img.src = this.baseurl + "/img/star" + ".svg";
        }
        img.className = "img-fluid";
        img.title = "" + text;
        return img;
    }
}

export class CollapseView {
    constructor(node) {
        this.node = node;
    }
    show() {
        this.node.style.visibility = "visible";
        this.node.style.width = "50%";
        this.node.dispatchEvent(new Event("show"));
    }
    hide() {
        this.node.style.visibility = "collapse";
        this.node.style.width = "0px";
        this.node.dispatchEvent(new Event("hide"));
    }
}

////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS

function colorForValue(value) {
    var color = Palette[value];
    if(color) {
        return color            
    } else {
        return Palette[""];
    }
}