

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
            node.className = "dropdown-item";
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

////////////////////////////////////////////////////////////////////////////////
// DETAIL VIEW

export class DetailView {
    constructor(node) {
        this.node = document.getElementById(node);
    }

    // Set details from row
    Set(row) {
        // Scroll pane to top
        this.node.querySelector(".card-list").parentNode.scrollTop = 0;
        // Set title, subtitle
        this.node.querySelector(".card-title").innerText = row.Title();
        this.node.querySelector(".card-subtitle").innerText = row.Studio();
        // List of details
        this.node.querySelector(".card-list").innerHTML = "";
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
                    this.createListItem(this.node.querySelector(".card-list"), k, row.Get(k));
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
}

