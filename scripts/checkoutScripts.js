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
    // If the id corosponds to a 1911 grip have these options
    if (id.startsWith("1911"))
    {
        return`
        <label> Grip Texture:
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

    if (item.id.startsWith("1911"))
    {
        selected_options.texture = document.getElementById("color_" + index).value;
        selected_options.finish = document.getElementById("finish_" + index).value;
    }
    else if (item.id.startsWith("BDG"))
    {
        selected_options.finish = document.getElementById("finish_" + index).value
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
        });

        // The array to send to paypal
        const items = cart.map((item, index) => 
        {
            const description = Object.entries(item.options || {})
                .map(([key, val]) => `${key}: ${val}`)
                .join(", ");
        
            // This will run the get additional cost function
            const added_cost = get_additional_cost(item.name, item.options);
            const unit_price = (item.price + added_cost).toFixed(2);

            // This is what will be put into the array.
            return {
                name: item.name,
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
        return actions.order.capture().then(function (details) {
            alert('transaction completed by ' + details.payer.name.given_name);
            localStorage.removeItem("shopping_cart");
            location.reload();
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

    return premium_cost;
}