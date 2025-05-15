const custom_cart = JSON.parse(localStorage.getItem("shopping_cart")) || [];
const itemBox = document.getElementById("item_box");

let total = 0;

// console.log(cart);

// For every different item in the cart this should make a new section to select the styles
cart.forEach((item, index) => 
{
    const optionsHTML = getOptionsHTML(item.name, index);
    // console.log("optionsHTML:", optionsHTML);
    const itemDiv = document.createElement("div");
    itemDiv.innerHTML = `
    <hr>
    <button id="remove_${index}">Delete Item</button>
    <h3>${item.name} X ${item.quantity}</h3>
    <!-- if the image isnt there or is corrupted use the default image -->
    <img src="${item.imageurl || '/images/default.png'}" alt="${item.name}" width="150">
    <p>Base price: $${item.price.toFixed(2)}</p>
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

    total += item.price * item.quantity;
});



// Changes the working price to be the total reguardless of what item is chosen
// If the cart total is greater than zero there is somthing in your cart and therefore canot be 0
if (total > 0)
{
    document.getElementById("working_price").innerHTML = `Total: $${(total + 12.5).toFixed(2)}`;
}
else
{
    document.getElementById("working_price").innerHTML = "Your cart is empty.";
}


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
                <option value="white">White</option>
                <option value="ivory">Ivory</option>
                <option value="old_ivory">Old Ivory</option>
                <option value="black">Black</option>
            </select>
        </label>
        <br>
        <label> Finish Style:
            <select id="finish_${index}">
                <option value="streaked">Streaked</option>
                <option value="antiqued">Antiqued</option>
                <option value="heavy_antiqued">Heavy Antiqued</option>
                <option value="with_black">With Black</option>
                <option value="none">Plane</option>
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
                <option value="unpolished">Antiqued/Unpolished (+$0)</option>
                <option value="polished" additional_price="4">Polished (+$4)</option>
                <option value="gold" additional_price="15">Gold Plated (+$15)</option>
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

cart.forEach((item, index) => {
    console.log(`${item.name} x${item.quantity}`);
    console.log("Options:", item.options);
});
