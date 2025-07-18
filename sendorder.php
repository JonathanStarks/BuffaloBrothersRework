<!-- Automation for sending emails -->
<?php

// Checks for POST data, only does requests
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Gets the raw data from paypal
    $json = file_get_contents("php://input");
    // Turns that data into a readable format
    $order = json_decode($json, true);

    // These are the keys from the js file
    $order_id = $order['orderID'] ?? 'N/A';
    $payer = $order['payer'] ?? [];
    $items = $order['items'] ?? [];
    $total = $order['total'] ?? 'N/A';

    // Sets up the information for sending emails
    $to = "sta21019@byui.edu";
    $subject = "New Order Recieved";
    $headers = "From: orders@s1055231436.onlinehome.us\r\n";
    $headers .= "Reply-To: sta21019@byui.edu\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // This is the start of the body of the email
    $body = "New order recieved from PayPal:\n\n";
    // This is the shipping information
    $body .= "Buffalo Brothers Order Summary\n\n";
    $body .= "Order ID: {$order_id}\n";
    $body .= "Payer: " . ($payer['name']['given_name'] ?? '') . " " . ($payer['name']['surname'] ?? '') . "\n";
    $body .= "Email: " . ($payer['email_address'] ?? '') . "\n\n";

    $address = $order['shipping']['address'] ?? [];

    $body .= "Shipping Address:\n";
    $body .= ($address['address_line_1'] ?? '') . "\n";
    $body .= ($address['admin_area_2'] ?? '') . ", ";
    $body .= ($address['admin_area_1'] ?? '') . " ";
    $body .= ($address['postal_code'] ?? '') . "\n\n";

    // This is the items that the customer bought
    $body .= "Items Ordered:\n";
    $totalAmount = 0;

    foreach ($items as $item) {
        $name = $item['name'] ?? 'Unnamed';
        $qty = $item['quantity'] ?? 1;
        $price = floatval($item['unit_amount']['value'] ?? '0.00');
        $desc = $item['description'] ?? '';
        
        $body .= "- $qty x $name @ $" . number_format($price, 2) . " each\n";

        if (!empty($desc)) {
            $body .= "  Customizations: $desc\n";
        }

        $lineTotal = $price * $qty;
        $body .= "  Total: $" . number_format($lineTotal, 2) . "\n\n";

        $totalAmount += $lineTotal;
    }



    // Adds the total amount
    $body .= "Total Paid (including customization options and $12.50 for shipping): $" . number_format(floatval($total), 2) . "\n";
    $body .= "\nThank you for your order!";

    // Sends the email
    if (mail($to, $subject, $body, $headers)) {
        // Makes an email to send to the customer
        $customer_email = $payer['email_address'] ?? '';
        if (filter_var($customer_email, FILTER_VALIDATE_EMAIL)) {
            $customer_subject = "Thank you for your order - Buffalo Brothers";

            // Message to the customer
            $customer_body = "Hello " . ($payer['name']['given_name'] ?? 'Customer') . ",\n\n";
            $customer_body .= "Thank you for your order, here is a summary of the order info:\n\n";
            $customer_body .= $body;

            // These are the headders for the customer's email
            $customer_headers = "From: orders@s1055231436.onlinehome.us\r\n";
            $customer_headers .= "Reply-To: orders@s1055231436.onlinehome.us\r\n";
            $customer_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

            // Sends the email to the customer
            mail($customer_email, $customer_subject, $customer_body, $customer_headers);
        }

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
?>