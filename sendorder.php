<!-- Automation for sending emails -->
<?php

// Checks for POST data, only does requests
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Gets the raw data from paypal
    $json = file_get_contents("php://input");
    // Turns that data into a readable format
    $order = json_decode($json, true);

    // Sets up the information for sending emails
    $to = "sta21019@byui.edu";
    $subject = "New Order Recieved";
    $headers = "Content-Type: text/plain; charset=UTF-8";

    // This is the start of the body of the email
    $body = "New order recieved from PayPal:\n\n";

    // This is the order summary
    $body .= "Order ID: ".$order["id"]."\n";
    $body .= "Payer: ".$order["payer"]["name"]["given_name"]." ".$order["payer"]["name"]["surname"]."\n";
    $body .= "Email: ".$order["payer"]["email_address"]."\n";

    // This is the shipping information
    $body .= "Shipping Address:\n";
    $body .= $order["purchase_units"][0]["shipping"]["address"]["address_line_1"]."\n";
    $body .= $order["purchase_units"][0]["shipping"]["address"]["admin_area_2"].", ";
    $body .= $order["purchase_units"][0]["shipping"]["address"]["admin_area_1"]." ";
    $body .= $order["purchase_units"][0]["shipping"]["address"]["postal_code"]."\n\n";

    // This is the items that the customer bought
    $bosy .= "Items:\n";
    foreach ($order["purchase_units"][0]["items"] as $item) {
        $body .= "- ".$item["name"]." x".$item["quantity"]." | $".$item["unit_amount"]["value"]."\n";
        if (isset($item["description"])) {
            $body .= " Description: ".$item["description"]."\n";
        }
    }

    // Adds the total amount
    $body .= "\nTotal: $".$order["purchase_units"][0]["amount"]["value"];

    // Sends the email
    if (mail($to, $subject, $body, $headers)) {
        http_response_code(200);
        echo "Email sent successfully.";
    } else {
        http_response_code(500);
        echo "Failed to sendemail.";
    }
} else {
    // Blocks andy non-POST requests
    http_response_code(403);
    echo "Unauthorized access.";
}