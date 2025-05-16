
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("HOOK_SECRET") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);
    
    let event;
    try {
      event = wh.verify(payload, headers) as any;
    } catch (error) {
      console.error("Failed to verify webhook:", error);
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Process the email request based on type
    const { type } = event;
    const { email } = event.user || event.user_email || {};
    
    if (!email) {
      throw new Error("Email address not provided");
    }

    let emailHtml;
    let subject;
    let actionUrl;
    const webUrl = new URL(req.url).origin;

    if (type === "SIGNUP") {
      // Handle signup confirmation email
      const { token_hash, redirect_to } = event.email_data || {};
      actionUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to || `${webUrl}/verification-success?type=signup`}`;
      
      subject = "Welcome to FreshCart - Please Confirm Your Email";
      emailHtml = generateConfirmationEmail(actionUrl);
    } 
    else if (type === "MAGIC_LINK") {
      // Handle magic link email
      const { token_hash, redirect_to } = event.email_data || {};
      actionUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=magiclink&redirect_to=${redirect_to || `${webUrl}/verification-success?type=magiclink`}`;
      
      subject = "Your FreshCart Login Link";
      emailHtml = generateMagicLinkEmail(actionUrl);
    } 
    else if (type === "RECOVERY") {
      // Handle password recovery email
      const { token_hash, redirect_to } = event.email_data || {};
      actionUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to || `${webUrl}/verification-success?type=recovery`}`;
      
      subject = "Reset Your FreshCart Password";
      emailHtml = generatePasswordResetEmail(actionUrl);
    } 
    else {
      // Unknown email type
      throw new Error(`Unsupported email type: ${type}`);
    }

    // Send the email via Resend
    const emailResponse = await resend.emails.send({
      from: "FreshCart <no-reply@freshcart.com>",
      to: [email],
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in custom-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Generate HTML for email confirmation
function generateConfirmationEmail(confirmationUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirm Your Email</title>
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
        .button {
          display: inline-block;
          background-color: #22c55e;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>FreshCart</h1>
        </div>
        <p>Hello,</p>
        <p>Thank you for signing up with FreshCart! <strong>Please confirm your email address by clicking the button below to activate your account:</strong></p>
        
        <div style="text-align: center;">
          <a href="${confirmationUrl}" class="button">Confirm My Email</a>
        </div>
        
        <p>If you didn't create an account with us, you can safely ignore this email.</p>
        
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

// Generate HTML for magic link email
function generateMagicLinkEmail(magicLinkUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Log In to FreshCart</title>
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
        .button {
          display: inline-block;
          background-color: #22c55e;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>FreshCart</h1>
        </div>
        <p>Hello,</p>
        <p>Click the button below to log in to your FreshCart account:</p>
        
        <div style="text-align: center;">
          <a href="${magicLinkUrl}" class="button">Log In to FreshCart</a>
        </div>
        
        <p>If you didn't request this link, you can safely ignore this email.</p>
        
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

// Generate HTML for password reset email
function generatePasswordResetEmail(resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
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
        .button {
          display: inline-block;
          background-color: #22c55e;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>FreshCart</h1>
        </div>
        <p>Hello,</p>
        <p>We received a request to reset your FreshCart password. Click the button below to set a new password:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset My Password</a>
        </div>
        
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        
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
