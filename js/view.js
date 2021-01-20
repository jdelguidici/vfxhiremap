

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
