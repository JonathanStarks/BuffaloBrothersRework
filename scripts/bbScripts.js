// This is the shopping cart
const cart = JSON.parse(localStorage.getItem("shopping_cart")) || [];

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

// This will be the google sheet that the item info comes from
const sheet_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmc0A0mQd3XZFCgCUQZV6S-zV8OAN0nz8v2YKTFhnbPc2t5ujOkoNra7MMDKEnTnuB3XxfEy2z7QVM/pub?gid=0&single=true&output=csv";

// This function uses the info from the google sheet and interperets it for the website to use
function load_product_info_sheets(sheet_url, callback)
{
    fetch(sheet_url)
        .then(res => res.text())
        .then(csv => 
        {
            const rows = csv.trim().split('\n').map(row => row.split(','));
            const headers = rows.shift().map(h => h.trim());
            const products = rows.map(row => 
            {
                const item = {};
                row.forEach((val, i) => 
                {
                    item[headers[i]] = val?.trim();
                });
                return item;
            });
            callback(products);
        })
        .catch(err => console.error("Something went wrong with the Google Sheet:", err));
}

// This function will load the corosponding items to what the user selects on the website.
function load_items_by_category(categoryName)
{
    load_product_info_sheets(sheet_url, function(products)
    {
        const list = document.getElementById("items_for_sale");

        // This clears the list
        list.innerHTML = "";

        // This filters the items depending on what the user selects.
        const filtered = products.filter(p => p.Category?.toLowerCase().trim() === categoryName.toLowerCase().trim());

        console.log("Category to filter by:", categoryName);
        console.log("Total products:", products.length);
        console.log("Matching products:", filtered.length);

        // This will make sections for the items
        filtered.forEach(product => 
        {
            // This is the container for the item and the style of it
            const container = document.createElement("div");
            container.style.marginBottom = "20px";
            container.style.width = "100%";

            // This is the image of the item and the style for it
            const img = document.createElement("img");
            img.src = product.ImageURL;
            img.alt = product.Name;
            img.style.width = "15%";
            console.log("Rendering:", product.ID, product.ImageURL);


            // This will create the elements that display the products' name, price, and description
            const name = document.createElement("h2");
            name.textContent = product.Name;
            const description = document.createElement("p");
            description.textContent = product.Description;
            const price = document.createElement("p");
            price.textContent = `$${parseFloat(product.Price).toFixed(2)}`;

            // Adds a horizontal ruling to make the site pretty
            const horizontal = document.createElement("hr");

            // Adds the button for the user to add an item to their cart
            const buy_it = document.createElement("button");
            buy_it.textContent = "Add to cart";
            buy_it.addEventListener("click", () => 
            {
                const item = 
                {
                    id: product.ID,
                    name: product.Name,
                    price: parseFloat(product.Price),
                    imageurl: product.ImageURL,
                    quantity: 1,
                    options: {}
                };

                // If there is a duplicate item the cart will up the quatity of the item presant, not add a new item.
                const dupe_item = cart.find(i => i.id === item.id);
                if (dupe_item)
                {
                    dupe_item.quantity += 1;
                }
                else
                {
                    cart.push(item);
                }

                // This will show a message that slide into the screen informing the user that the item was added to their cart.
                localStorage.setItem("shopping_cart", JSON.stringify(cart));
                show_slide_message(`${product.Name} was added to the cart.`);
                update_cart();
                if (item.id.startsWith("CNG"))
                {
                    alert("Due to the number of backstrap variations on '51 navies, the best way to determine which of our navy grips will fit your gun is to trace around either the backstrap or the grip that is currently on your gun and MAIL that tracing to us. There will still be fitting required (see the \"Fitting Information\" on the Grip home page). At the very least, you should include information about your gun such as, maker, year of manufacture if possible, and any other markings that may be on the gun; however the tracing is the only sure way of getting the correct grip. Please contact us for more information.");
                }
                if (item.id.startsWith("RUG"))
                {
                    alert("Grips for the Ruger Vaquero and various other Ruger models. Note: These are NOT applicable to the Ruger NEW Vaquero. Please see the SAA selections for grips for your Ruger New Vaqueros");
                }
            });

            // Actually adds the things to the website
            container.appendChild(horizontal);
            container.appendChild(name);
            container.appendChild(img);
            container.appendChild(description);
            container.appendChild(price);
            container.appendChild(buy_it);
            list.appendChild(container);
        });
    });
}

// This function shows a popup when an item is added to the cart
function show_slide_message(message)
{
    const popup = document.getElementById("popup");
    popup.textContent = message;

    popup.classList.remove("show");
    void popup.offsetWidth;
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, 3000);
}

// This code will run the load items function only when the items for sale element and the cat parameter is in the url
const item_parameters = new URLSearchParams(window.location.search);
const category = item_parameters.get("cat");
if (category && document.getElementById("items_for_sale")) 
{
    load_items_by_category(category);
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

            update_cart();
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

