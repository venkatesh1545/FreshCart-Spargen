
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Resend with error handling for missing API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("RESEND_API_KEY is not configured. Emails will not be sent.");
}
const resend = new Resend(resendApiKey);

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request
    const { orderId, userId } = await req.json() as OrderConfirmationRequest;
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    console.log(`Processing order confirmation for order: ${orderId} ${userId ? `and user: ${userId}` : ''}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Log the query we're about to make for debugging
    console.log(`Querying order with ID: ${orderId}`);
    
    // First attempt: Get order details by exact ID match
    let { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();
    
    if (orderError) {
      console.error("Error fetching order:", orderError.message);
      throw new Error(`Database error: ${orderError.message}`);
    }
    
    // If order not found, try additional queries
    if (!order) {
      console.log(`Order not found with exact ID match. Trying additional queries...`);
      
      // Second attempt: Check if userId is provided, get user's most recent order
      if (userId) {
        console.log(`Trying to find most recent order for user: ${userId}`);
        const { data: userOrders, error: userOrderError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);
          
        if (userOrderError) {
          console.error("Error fetching user orders:", userOrderError.message);
        } else if (userOrders && userOrders.length > 0) {
          console.log(`Found most recent order for user: ${userOrders[0].id}`);
          order = userOrders[0];
        }
      }
      
      // Third attempt: Try a different approach - looking for partial UUID match
      if (!order && orderId.length >= 8) {
        console.log(`Trying to find order starting with: ${orderId.slice(0, 8)}`);
        
        // This query looks for orders where id begins with the first 8 characters of the provided orderId
        const { data: partialOrders, error: partialOrderError } = await supabase
          .rpc('find_order_by_prefix', { prefix: orderId.slice(0, 8) });
          
        if (partialOrderError) {
          console.error("Error in partial ID search:", partialOrderError.message);
        } else if (partialOrders && partialOrders.length > 0) {
          console.log(`Found order with partial ID match: ${partialOrders[0].id}`);
          order = partialOrders[0];
        }
      }
      
      // If still no order found, throw error
      if (!order) {
        const errorMsg = `Order not found for ID: ${orderId}${userId ? ` and user ID: ${userId}` : ''}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    }
    
    console.log("Order found:", order);
    
    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    
    if (itemsError) {
      console.error("Error fetching order items:", itemsError.message);
      throw new Error(`Error fetching order items: ${itemsError.message}`);
    }
    
    if (!orderItems || orderItems.length === 0) {
      console.log("No items found for this order");
    } else {
      console.log("Order items found:", orderItems);
    }
    
    // Get user details if userId is provided
    let userProfile = null;
    let userEmail = null;
    
    if (userId) {
      // Get user profile
      const { data: profile, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (userError) {
        console.error("Error fetching user profile:", userError.message);
        // Continue without profile data
      } else {
        userProfile = profile;
      }
      
      // Get user email from auth
      const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError || !user) {
        console.error("Error fetching user:", authError?.message || "User not found");
        // Continue without user email
      } else {
        userEmail = user.email;
      }
    } else if (order.user_id) {
      // Try to get user info from the order's user_id
      const { data: profile, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", order.user_id)
        .maybeSingle();
      
      if (!userError) {
        userProfile = profile;
      }
      
      // Get user email from auth using order's user_id
      const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(order.user_id);
      
      if (!authError && user) {
        userEmail = user.email;
      }
    }
    
    if (!userEmail) {
      console.error("Could not determine user email for order confirmation");
      throw new Error("User email not found - cannot send confirmation");
    }
    
    console.log(`Sending email to: ${userEmail}`);
    
    // Format items for email display
    const formattedItems = (orderItems || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${item.product_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join("");
    
    // Generate order confirmation email HTML
    const emailHtml = generateOrderConfirmationEmail({
      orderNumber: order.id.slice(0, 8),
      orderDate: new Date(order.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      customerName: userProfile?.full_name || "Valued Customer",
      shippingAddress: order.shipping_address || "No address provided",
      paymentMethod: formatPaymentMethod(order.payment_method || ""),
      orderStatus: formatOrderStatus(order.status),
      orderItems: formattedItems,
      subtotal: (order.total * 0.93).toFixed(2), // Approximating subtotal as 93% of total
      shipping: order.total > 50 ? "0.00" : "4.99",
      tax: (order.total * 0.07).toFixed(2), // Approximating tax as 7% of total
      total: order.total.toFixed(2),
      storeUrl: `${new URL(req.url).origin.replace("/functions/v1/order-confirmation", "")}`
    });

    if (!resendApiKey) {
      console.error("Cannot send email: RESEND_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send the order confirmation email
    const emailResponse = await resend.emails.send({
      from: "FreshCart <no-reply@freshcart.com>",
      to: [userEmail],
      subject: `FreshCart Order Confirmation #${order.id.slice(0, 8)}`,
      html: emailHtml,
    });

    console.log("Order confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ message: "Order confirmation email sent successfully", orderId: order.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in order-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Format payment method for display
function formatPaymentMethod(method: string): string {
  switch (method) {
    case "card": return "Credit/Debit Card";
    case "paypal": return "PayPal";
    case "apple": return "Apple Pay";
    case "phonepe": return "PhonePe UPI";
    case "paytm": return "Paytm UPI";
    case "googlepay": return "Google Pay UPI";
    case "cash": return "Cash on Delivery";
    default: return method.charAt(0).toUpperCase() + method.slice(1);
  }
}

// Format order status for display
function formatOrderStatus(status: string): string {
  switch (status) {
    case "pending_cod": return "Pending (Cash on Delivery)";
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

// Generate HTML for order confirmation email
function generateOrderConfirmationEmail(data: {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  shippingAddress: string;
  paymentMethod: string;
  orderStatus: string;
  orderItems: string;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  storeUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your FreshCart Order Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #eaeaea;
          border-radius: 5px;
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo h1 {
          color: #22c55e;
          margin: 0;
        }
        .order-header {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .order-details {
          margin-bottom: 30px;
        }
        .order-details h4 {
          margin-bottom: 5px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background-color: #f0f0f0;
          text-align: left;
          padding: 10px;
          border-bottom: 2px solid #ddd;
        }
        .order-summary {
          margin-top: 20px;
          text-align: right;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .button {
          display: inline-block;
          background-color: #22c55e;
          color: white;
          padding: 10px 20px;
          margin: 20px 0;
          text-decoration: none;
          border-radius: 4px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>FreshCart</h1>
        </div>
        <p>Hello ${data.customerName},</p>
        <p>Thank you for your order! We've received your order and will process it right away.</p>
        
        <div class="order-header">
          <p><strong>Order Number:</strong> #${data.orderNumber}</p>
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Status:</strong> ${data.orderStatus}</p>
        </div>
        
        <div class="order-details">
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 250px; margin-bottom: 15px;">
              <h4>Shipping Information</h4>
              <p>${data.shippingAddress}</p>
            </div>
            <div style="flex: 1; min-width: 250px; margin-bottom: 15px;">
              <h4>Payment Method</h4>
              <p>${data.paymentMethod}</p>
            </div>
          </div>
        </div>
        
        <h3>Order Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.orderItems}
          </tbody>
        </table>
        
        <div class="order-summary">
          <p><strong>Subtotal:</strong> ₹${data.subtotal}</p>
          <p><strong>Shipping:</strong> ₹${data.shipping}</p>
          <p><strong>Tax:</strong> ₹${data.tax}</p>
          <p style="font-size: 18px;"><strong>Total:</strong> ₹${data.total}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p>Want to buy more products? Don't worry, we've got you covered!</p>
          <a href="${data.storeUrl}" class="button">Continue Shopping</a>
        </div>
        
        <p>Thank you for shopping with FreshCart!</p>
        <p>If you have any questions about your order, please contact our customer service team.</p>
        
        <p>Best regards,<br>The FreshCart Team</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} FreshCart. All rights reserved.</p>
          <p>Fresh groceries delivered to your doorstep.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
