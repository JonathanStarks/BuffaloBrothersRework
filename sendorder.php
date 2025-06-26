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
    $headers = "From: orders@s1055231436.onlinehome.us\r\n";
    $headers ="Reply-To: sta21019@byui.edu\r\n";
    $headers = "Content-Type: text/plain; charset=UTF-8\r\n";

    // This is the start of the body of the email
    $body = "New order recieved from PayPal:\n\n";

    // This is the order summary
    $body .= "Order ID: ".$order["id"]."\n";
    $body .= "Payer: ".$order["payer"]["name"]["given_name"]." ".$order["payer"]["name"]["surname"]."\n";
    $body .= "Email: ".$order["payer"]["email_address"]."\n";

    // This is the shipping information
    $body = "🧾 Buffalo Brothers Order Summary\n\n";
    $body .= "Order ID: " . ($order['id'] ?? 'N/A') . "\n";
    $body .= "Payer: " . ($order['payer']['name']['given_name'] ?? '') . " " . ($order['payer']['name']['surname'] ?? '') . "\n";
    $body .= "Email: " . ($order['payer']['email_address'] ?? '') . "\n";
    $body .= "Shipping Address:\n";
    $body .= ($order['shipping']['address']['address_line_1'] ?? '') . "\n";
    $body .= ($order['shipping']['address']['admin_area_2'] ?? '') . ", ";
    $body .= ($order['shipping']['address']['admin_area_1'] ?? '') . " ";
    $body .= ($order['shipping']['address']['postal_code'] ?? '') . "\n\n";

    // This is the items that the customer bought
    $body .= "Items Ordered:\n";

    foreach ($order['items'] as $item) {
        $body .= "- " . $item['name'] . " x" . $item['quantity'] . " | $" . $item['unit_amount']['value'] . "\n";
        if (!empty($item['description'])) {
            $body .= "  Description: " . $item['description'] . "\n";
        }
    }

    // Adds the total amount
    $body .= "\nTotal Paid: $" . ($order['total'] ?? 'N/A') . "\n";
    $body .= "\nThank you for your order!";

    // Sends the email
    if (mail($to, $subject, $body, $headers)) {
        http_response_code(200);
        echo "Email sent successfully.";
        exit;
    } else {
        http_response_code(500);
        echo "Failed to send email.";
        exit;
    }
} else {
    // Blocks andy non-POST requests
    http_response_code(403);
    echo "Unauthorized access.";
    exit;
}