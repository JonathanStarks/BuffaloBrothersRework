const itemBox = document.getElementById("item_box");

let total = 0;

// For every different item in the cart this should make a new section to select the styles
cart.forEach((item, index) => 
{
    const optionsHTML = getOptionsHTML(item.id, index);
    const itemDiv = document.createElement("div");
    itemDiv.innerHTML = `
    <hr>
    <button id="remove_${index}">Delete Item</button>
    <h3>${item.name} X ${item.quantity}</h3>
    <!-- if the image isnt there or is corrupted use the default image -->
    <img src="${item.imageurl || '/images/default.png'}" alt="${item.name}" width="150">
    <div id="price_line_${index}">Price: $${item.price.toFixed(2)}</div>
    <br>
    ${optionsHTML}
    `;
    itemBox.appendChild(itemDiv);

    // This will have an item deleted corosponding to the button pressed
    const deleteOneButton = itemDiv.querySelector(`#remove_${index}`);
    deleteOneButton.addEventListener("click", () =>
    {
        if (cart[index].quantity > 1)
        {
            cart[index].quantity -= 1;
        }
        else
        {
            cart.splice(index, 1);
        }
        localStorage.setItem("shopping_cart", JSON.stringify(cart));
        location.reload();
    });

    // This function will be used to change the price of the item if a drop down option
    // with a premium cost is selected
    function premium_option_selected()
    {
        // This is a let as it can change, it is a running total for the premium options selected
        let extra_cost = 0;
        // This is the regular price of the item
        const reg_price = item.price;

        // These are the constants (or more acurately the immutables) that will set to the 
        // options that are chosen
        const color = document.getElementById(`color_${index}`);
        const finish = document.getElementById(`finish_${index}`);
        const backing = document.getElementById(`backing_${index}`);
        const strap = document.getElementById(`strap_${index}`);

        if (color && color.selectedOptions[0])
        {
            extra_cost += parseFloat(color.selectedOptions[0].dataset.price || 0);
        }
        if (finish && finish.selectedOptions[0])
        {
            extra_cost += parseFloat(finish.selectedOptions[0].dataset.price || 0);
        }
        if (backing && backing.selectedOptions[0])
        {
            extra_cost += parseFloat(backing.selectedOptions[0].dataset.price || 0);
        }
        if (strap && strap.selectedOptions[0])
        {
            extra_cost += parseFloat(strap.selectedOptions[0].dataset.price || 0);
        }

        // Adds the prices to the total to be updated on the page
        const final = reg_price + extra_cost;
        document.getElementById(`price_line_${index}`).textContent = `Item Total: $${final.toFixed(2)}`;
        item.calculated_price = final;

        const options = {};
        if (color) options.texture = color.value;
        if (finish) options.finish = finish.value;
        item.options = options;

        update_cart_total();
    }
    
    // updates the items in the cart
    const color = document.getElementById(`color_${index}`);
    const finish = document.getElementById(`finish_${index}`);
    const backing = document.getElementById(`backing_${index}`);
    const strap = document.getElementById(`strap_${index}`);
    if (color) color.addEventListener("change", premium_option_selected);
    if (finish) finish.addEventListener("change", premium_option_selected);
    if (backing) backing.addEventListener("change", premium_option_selected);
    if (strap) strap.addEventListener("change", premium_option_selected);
    premium_option_selected();
});

// This function will update the total of the cart
function update_cart_total()
{
    const subtotal = cart.reduce((sum, item) => {
        const price = item.calculated_price || item.price;
        return sum + price * item.quantity;
    }, 0);

    const shipping = 12.5;
    const total = subtotal + shipping;
    document.getElementById("cart_total").innerHTML = `Items: $${subtotal.toFixed(2)}`;
    document.getElementById("working_price").innerHTML = `Total: $${total.toFixed(2)}`;
}

// This function displays different options based on the item type
function getOptionsHTML(id, index)
{
    // If the id is missing return nothing
    if (!id)
        {
            alert("Uh oh, somthing went wrong with the ID of the item!");
            return "";
        }
    // If the id corosponds to a grip the site will have these options
    if (id.startsWith("1911") || id.startsWith("CNG") || id.startsWith("CAG") || id.startsWith("BDE") || id.startsWith("SAA") || id.startsWith("SAB") || id.startsWith("DER") || id.startsWith("PPG") || id.startsWith("HER") || id.startsWith("RUG") || id.startsWith("SCH") || id.startsWith("SWG") || id.startsWith("REM"))
    {
        return`
        <label> Grip Color:
            <select id="color_${index}">
                <option value="white" data-price="0">White</option>
                <option value="ivory" data-price="0">Ivory</option>
                <option value="old_ivory" data-price="0">Old Ivory</option>
                <option value="black" data-price="0">Black</option>
                <option value="john_yellow" data-price="0">John Wayne Yellow</option>
            </select>
        </label>
        <br>
        <label> Finish Style:
            <select id="finish_${index}">
                <option value="streaked" data-price="0">Streaked</option>
                <option value="antiqued" data-price="0">Antiqued</option>
                <option value="heavy_antiqued" data-price="0">Heavy Antiqued</option>
                <option value="with_black" data-price="0">With Black</option>
                <option value="none" data-price="0">Plain</option>
            </select>
        </label>
        `;
    }

    // If the id corosponds to a badge, have these options, some prices have higher values
    else if (id.startsWith("BDG"))
    {
        return `
        <label> Finish Style:
            <select id="finish_${index}">
                <option value="unpolished" data-price="0">Antiqued/Unpolished (+$0)</option>
                <option value="polished" data-price="4">Polished (+$4)</option>
                <option value="gold" data-price="15">Gold Plated (+$15)</option>
            </select>
        </label>
        `;
    }

    // If the id corosponds to a concho, these options will show
    else if (id.startsWith("CON"))
    {
        return `
        <label> Back Fastener:
            <select id="backing_${index}">
                <option value="flatback" data-price="0">Flatback/Smash Rivet</option>
                <option value="pushnut" data-price="0">Pushnut</option>
            </select>
        </label>
        `;
    }

    // If the id is for a watch fob, these options will show
    else if (id.startsWith("FOB"))
    {
        return `
        <label> Strap:
            <select id="strap_${index}">
                <option value="no" data-price="0">No (+$0)</option>                
                <option value="yes" data-price="5">Yes (+5$)</option>
            </select>
        </label>
        <br>
        <label> Finish:
            <select id="finish_${index}">
                <option value="tin" data-price="0">Tin (+$0)</option>
                <option value="gold" data-price="5">Gold Plated (+$5)</option>
            </select>
        </label>
        `;
    }

    // If the id is for the medallion section, display these options
    else if (id.startsWith("MED"))
    {
        return `
        <label> Finish:
            <select id="finish_${index}">
                <option value="tin" data-price="0">Tin/Silver (+$0)</option>
                <option value="gold" data-price="10">Gold Plated (+$10)</option>
            </select>
        </label>
        <br>
        <label> Backing:
            <select id="backing_${index}">
                <option value="none" data-price="0">None (+$0)</option>
                <option value="chicago_screw" data-price="2">Chicago Screw (+$2)</option>
            </select>
        </label>
        `;
    }
    return "";
}

// When this button is pressed the local storage is cleared and the cart is thus emptied
const deleteAllButton = document.getElementById("remove_all");
deleteAllButton.addEventListener("click", () =>
{
    localStorage.removeItem("shopping_cart");

    location.reload();
});

// Stores the options that the user has selected 
cart.forEach((item, index) => 
{
    // An empty object to store the information about the items in the cart
    const selected_options = {};

    if (item.id.startsWith("1911") || item.id.startsWith("SAA") || item.id.startsWith("SAB") || item.id.startsWith("BDE") || item.id.startsWith ("CNG") || item.id.startsWith("CAG") || item.id.startsWith("DER") || item.id.startsWith("PPG") || item.id.startsWith("HER") || item.id.startsWith("RUG") || item.id.startsWith("SCH") || item.id.startsWith("SWG") || item.id.startsWith("REM"))
    {
        selected_options.texture = document.getElementById("color_" + index).value;
        selected_options.finish = document.getElementById("finish_" + index).value;
    }
    else if (item.id.startsWith("BDG"))
    {
        selected_options.finish = document.getElementById("finish_" + index).value;
    }
    else if (item.id.startsWith("CON"))
    {
        selected_options.backing = document.getElementById("backing_" + index).value;
    }
    else if (item.id.startsWith("FOB"))
    {
        selected_options.strap = document.getElementById("strap_" + index).value;
        selected_options.finish = document.getElementById ("finish_" + index).value;
    }
    else if (item.id.startsWith("MED"))
    {
        selected_options.finish = document.getElementById("finish_" + index).value;
        selected_options.backing = document.getElementById("backing_" + index).value;
    }
    item.options = selected_options;
});

// This code should send an order to paypal and charge the customer after they log in
paypal.Buttons({
    createOrder: function (data, actions)
    {
        const cart = JSON.parse(localStorage.getItem("shopping_cart")) || [];

        // Updates the items in the cart so that they are correct when they are sent to paypal
        cart.forEach((item, index) => 
        {
            const options = {};
            const color = document.getElementById(`color_${index}`);
            const finish = document.getElementById(`finish_${index}`);
            const backing = document.getElementById(`backing_${index}`);
            const strap = document.getElementById(`strap_${index}`);

            if (color) options.texture = color.value;
            if (finish) options.finish = finish.value;
            if (backing) options.backing = backing.value;
            if (strap) options.strap = strap.value;

            item.options = options;

            // Calculates the premium price
            const added_cost = get_additional_cost(item.id, options);
            item.calculated_price = item.price + added_cost;
        });

        // The array to send to paypal
        const items = cart.map((item, index) => 
        {
            const description = Object.entries(item.options || {})
                .map(([key, val]) => `${key}: ${val}`)
                .join(", ");
        
            const unit_price = (item.calculated_price || item.price).toFixed(2);

            // This is what will be put into the array.
            return {
                name: `${item.id} - ${item.name}`,
                description: description,
                unit_amount: {currency_code: "USD", value: unit_price},
                quantity: item.quantity
            };
        });

        // sum is the accumulator, it will use a callback function to go through each item and 
        // will find the total price of the cart's items.
        const subtotal = items.reduce((sum, item) => sum + item.quantity * parseFloat(item.unit_amount.value), 0);

        // This is the total with shipping
        const shipping = 12.5;
        const total = subtotal + shipping;

        return actions.order.create({
            purchase_units: [{
                amount: {
                    currency_code: "USD",
                    value: total.toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: subtotal.toFixed(2)
                        },
                        shipping: {
                            currency_code: "USD",
                            value: shipping.toFixed(2)
                        }
                    }
                },
                items: items
            }]
        });
    },

    onApprove: function(data, actions)
    {
        return actions.order.capture().then(details => {
            // Gets the cart for the email
            const cart = JSON.parse(localStorage.getItem("shopping_cart")) || [];

            // Sets the items with their final prices
            const final_items = cart.map((item, index) => {
                const options = item.options || {};
                const description = Object.entries(options).map(([key, val]) => `${key}: ${val}`).join(", ");

                const added_cost = get_additional_cost(item.id, options);
                const unit_price = (item.price + added_cost).toFixed(2);

                return {
                    name: `${item.id} - ${item.name}`,
                    quantity: item.quantity,
                    unit_amount: {currency_code: "USD", value: unit_price },
                    description: description
                };
            });

            const total = final_items.reduce((sum, item) => sum + item.quantity * parseFloat(item.unit_amount.value), 0);
            const captured_unit = details.purchase_units?.[0];
            const captured_items = captured_unit?.items || [];

            // Makes the info for the email with the right data
            const custom_order = {
                orderID: details.id,
                payer: details.payer,
                shipping: captured_unit?.shipping || {},
                items: final_items,
                total: final_items.reduce((sum, item) => sum + item.quantity * parseFloat(item.unit_amount.value), 0).toFixed(2)
            };

            console.log("Sending custom order to the server:", custom_order);
            // Sends the order detail to the server
            fetch("sendorder.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(custom_order)
            }).then(response => {
                if (!response.ok) {
                    console.error("Email Failed to send:", response.statusText);
                } else {
                    // clears the cart and sends the user to the thank you page
                    localStorage.removeItem("shopping_cart");
                    window.location.href = "thankyou.html";
                }
            }).catch(err => {
                console.error("Network error sending order to backend:", err);
            });
        });
    }
}).render('#paypal_button_section');

// If an item has added costs for a finish the function will run and add the premium to the total
function get_additional_cost(id, options)
{
    // Sets the base of the additional price to 0
    let premium_cost = 0;

    // These are the different price increases to the product.
    if (id.startsWith("BDG"))
    {
        if (options.finish === "polished") premium_cost += 4;
        if (options.finish === "gold") premium_cost += 15;
    }
    else if (id.startsWith("FOB"))
    {
        if (options.strap === "yes") premium_cost += 5;
        if (options.finish === "gold") premium_cost += 5;
    }
    else if (id.startsWith("MED"))
    {
        if (options.finish === "gold") premium_cost += 10;
        if (options.backing === "chicago_screw") premium_cost += 2;
    }

    return premium_cost;
}