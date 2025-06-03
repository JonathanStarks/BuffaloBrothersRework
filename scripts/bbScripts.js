// This is the shopping cart
const cart = JSON.parse(localStorage.getItem("shopping_cart")) || [];

// This is the lookup table, it will make changing the base price of item types 
// easier than having to edit each item in the json file, but I will need to change
// this to be located in the backend so it won't be accessable from the frontend
const base_price_by_type =
{
    "1911": 79.00,
    "BDG": 19.95,
    // The button price below will need to be different, not all buttons will be the 
    // same price.
    "BTN": 1.00,
    "SAAP": 0
};

// Runs the update cart function
update_cart();

// This will expand the store menu when clicked and then if clicked again it will colapse it
const store_menu = document.querySelector(".store_menu");
const store = document.getElementById("store_submenu");
store_menu.addEventListener("click", function() {
    if (store.classList == "hidden") 
    {
        // Removes the hidden attribute and makes the submenu visable
        store.classList.remove("hidden");
        // Changes the store menu button to show there are items to colapse
        document.getElementById("store_menu_button").innerHTML = "Store ↑";
    }
    else
    {
        // Applies the hidden attribute to hide the submenu
        store.classList.add("hidden");
        // Changes the store menu button to show there are items that can be expanded
        document.getElementById("store_menu_button").innerHTML = "Store ↓";
    }
});

// This will reduce the code that I need to write by letting each section use the code that hides and shows the contained text
document.querySelectorAll(".about_section").forEach(section => {
    section.addEventListener("click", () => {
        const target = section.getAttribute("about_info");
        const targetElement = document.getElementById(target);
        if (targetElement)
        {
            targetElement.classList.toggle("hidden");
        }
    });
});

// This function determines what to set the base price for the item to 
// depending on its price in the lookup table
function find_baseprice(id)
{
    if (!id || typeof id !== "string")
    {
        console.warn("Invalid or missing ID: ", id);
        return 0;
    }
    for (const prefix in base_price_by_type)
    {
        if (id.startsWith(prefix))
        {
            return base_price_by_type[prefix];
        }
    }
    // If the price can't be found, throw an error
    alert("Uh oh! Somthing went wrong with figuring out the base price for ID: " + id);
    return 0;
}

// For the shop pages I want to have each of the items in a json file and then when the button is clicked the corosponding items will be loaded.
function load_items(json_file)
{
    // This will go through the json file and make sections for each of the items there
    fetch(`iteminfo/${json_file}`)
        .then(Response => Response.json())
        .then(data => {
            const list = document.getElementById("items_for_sale");

            data.forEach(product => 
            {
                // This is the container for the item and the style of it
                const container = document.createElement("div");
                container.style.marginBottom = "20px";
                container.style.width = "100%";

                // This is the image of the item
                const img = document.createElement("img");
                img.src = product.imageurl;
                img.alt = product.name;
                img.style.width = "150px";

                // This is the product name, price, and description
                const name = document.createElement("h2");
                name.textContent = product.name;

                const description = document.createElement("p");
                description.textContent = product.description;

                const price = document.createElement("p");
                price.textContent = `$${parseFloat(find_baseprice(product.name)).toFixed(2)}`;

                const horizontal = document.createElement("hr");

                // This creates the button for the item so the user can select the item
                const buy_it = document.createElement("button");
                buy_it.textContent = "Add to cart";

                buy_it.addEventListener("click", () => 
                {
                    const item =
                    {
                        id: product.name,
                        name: product.name,
                        price: find_baseprice(product.name),
                        imageurl: product.imageurl,
                        quantity: 1,
                        options: {}
                    }

                    // Checks if the item is already in the cart, if it is then the quantity will increase
                    const dupe_item = cart.find(i => i.id === item.name);
                    if (dupe_item)
                    {
                        dupe_item.quantity += 1;
                    }
                    else
                    {
                        cart.push(item);
                    }

                    // This saves the cart to the local storage
                    localStorage.setItem("shopping_cart", JSON.stringify(cart));
                    show_slide_message(`${product.name} was added to the cart.`);
                    location.reload();

                });
                

                // Actually adds the items to the site
                container.appendChild(horizontal)
                container.appendChild(name);
                container.appendChild(img);
                container.appendChild(description);
                container.appendChild(price);
                container.appendChild(buy_it);
                list.appendChild(container);
            });
        })
        .catch(error => console.error("Error loading the json file:", error));
}

// This function shows a popup when an item is added to the cart
function show_slide_message(message)
{
    const popup = document.getElementById("popup");
    popup.textContent = message;

    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, 3000 + 500);
}

// This code will run the load items function only when the items for sale element and the cat parameter is in the url
const item_parameters = new URLSearchParams(window.location.search);
const category = item_parameters.get("cat");
if (category && document.getElementById("items_for_sale")) 
{
    load_items(`${category}.json`)
}

// This function will handle updating the cart
function update_cart()
{
    // Creates the summary and sets it to a default of no text
    const summary = document.getElementById("cart_summary");
    const stored_cart = JSON.parse(localStorage.getItem("shopping_cart")) || [];
    summary.innerHTML = "";

    // Checks to see if there is anything in the cart, if there is nothing the function inserts text that says thusly
    if (stored_cart.length === 0)
    {
        summary.textContent = "The cart is empty";
        return;
    }

    // This is the cart total, it will start at $0
    let cart_total = 0;
    stored_cart.forEach((item, index) => 
    {
        // This creates the total of the prices for the items that are in the cart
        const p = document.createElement("p");
        const final_price = item.calculated_price || item.price;
        const item_total = final_price * item.quantity;
        p.textContent = `${item.name} - $${final_price.toFixed(2)} x ${item.quantity}`;
        summary.appendChild(p);

        // Has an image to go with the item in the small cart below the menu
        const item_image = document.createElement("img");
        item_image.src = item.imageurl;
        item_image.style.width = "100px";
        summary.appendChild(item_image);

        // This will have an item deleted corosponding to the button pressed
        const deleteOneButton = document.createElement("button");
        deleteOneButton.textContent = "Delete Item";
        deleteOneButton.addEventListener("click", () =>
        {

            cart.splice(index, 1);
            localStorage.setItem("shopping_cart", JSON.stringify(cart));

            location.reload();
        });
        summary.appendChild(deleteOneButton);

        summary.appendChild(document.createElement("hr"));


        // Adds the next total to the running total
        cart_total += item_total;
    });

    // This actually adds the total to the web page
    const total_line = document.createElement("p");
    total_line.innerHTML = `<strong>SubTotal: $${((cart_total)).toFixed(2)}</strong>`;
    summary.appendChild(total_line);
    
    // Below the total for the cart will be the button to checkout, it will take the user to the 
    // review and customize page
    const checkoutButton = document.createElement("a");
    checkoutButton.textContent = "Checkout";
    checkoutButton.href = "reviewandcustomize.html";
    checkoutButton.style.border = "solid";
    checkoutButton.style.borderWidth = "1px";
    checkoutButton.style.padding = "2px";
    summary.appendChild(checkoutButton);
}

