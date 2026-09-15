# Contact Form Webhook & Gmail Setup Guide

This guide explains how to connect the contact form on `index.html` to a webhook that automatically forwards submissions to your Gmail inbox and applies a custom label (e.g. `Portfolio Contact`).

---

## Solution 1: Google Apps Script Web App (Recommended)

This solution is **100% free forever**, requires **zero external third-party subscriptions**, and natively manages Gmail labels directly via Google's official API.

### Step-by-Step Setup:

1. **Open Google Apps Script**:
   - Go to [script.google.com](https://script.google.com) while signed into your Gmail account.
   - Click **New Project** and name it `Portfolio Contact Handler`.

2. **Paste the Script Code**:
   Replace any existing code in `Code.gs` with the following:

   ```javascript
   function doGet(e) {
     return handleRequest(e);
   }

   function doPost(e) {
     return handleRequest(e);
   }

   function handleRequest(e) {
     try {
       var data = {};
       
       // 1. Extract parameters from POST (urlencoded or JSON) or GET
       if (e && e.parameter && Object.keys(e.parameter).length > 0) {
         data = e.parameter;
       } else if (e && e.postData && e.postData.contents) {
         try {
           data = JSON.parse(e.postData.contents);
         } catch (err) {
           var raw = e.postData.contents;
           raw.split("&").forEach(function(pair) {
             var kv = pair.split("=");
             data[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || "").replace(/\+/g, " "));
           });
         }
       }

       // Return ready status if visited in browser without parameters
       if (!data.name && !data.email && !data.message) {
         return ContentService.createTextOutput(JSON.stringify({
           status: "ready",
           message: "Portfolio Contact Webhook is active and ready to receive submissions."
         })).setMimeType(ContentService.MimeType.JSON);
       }

       var name = data.name || "Anonymous";
       var surname = data.surname || "";
       var email = data.email || "No email provided";
       var telephone = data.telephone || "Not provided";
       var message = data.message || "No message content";

       var fullName = (name + " " + surname).trim();
       var subject = "[Portfolio Contact] New message from " + fullName;

       var body = "You received a new message from your portfolio website:\n\n" +
                  "Name: " + fullName + "\n" +
                  "Email: " + email + "\n" +
                  "Telephone: " + telephone + "\n\n" +
                  "Message:\n" + message + "\n\n" +
                  "--\nSent from Andrew Stanwix's Portfolio";

       // 2. Set recipient explicitly to your Gmail
       // Note: Session.getActiveUser().getEmail() returns "" for anonymous public traffic!
       var recipient = "andrewstanwix@gmail.com";

       MailApp.sendEmail({
         to: recipient,
         replyTo: email,
         subject: subject,
         body: body
       });

       // 3. Optional: apply "Portfolio Contact" label safely without failing email delivery
       try {
         var labelName = "Portfolio Contact";
         var label = GmailApp.getUserLabelByName(labelName);
         if (!label) {
           label = GmailApp.createLabel(labelName);
         }
         Utilities.sleep(2000);
         var threads = GmailApp.search('to:' + recipient + ' subject:"' + subject + '"', 0, 1);
         if (threads && threads.length > 0) {
           label.addToThread(threads[0]);
         }
       } catch (labelErr) {
         console.warn("Label assignment skipped: " + labelErr);
       }

       return ContentService.createTextOutput(JSON.stringify({
         status: "success",
         message: "Message sent successfully!"
       })).setMimeType(ContentService.MimeType.JSON);

     } catch (err) {
       console.error("Error sending message: " + err);
       return ContentService.createTextOutput(JSON.stringify({
         status: "error",
         message: err.toString()
       })).setMimeType(ContentService.MimeType.JSON);
     }
   }

   // Direct test function to verify email sending inside the Apps Script editor:
   function testSendEmail() {
     var dummyEvent = {
       parameter: {
         name: "Andrew",
         surname: "Stanwix",
         email: "andrewstanwix@gmail.com",
         telephone: "+41 00 000 00 00",
         message: "Test message sent directly from Google Apps Script editor."
       }
     };
     var output = handleRequest(dummyEvent);
     Logger.log("Result: " + output.getContent());
   }
   ```

3. **Deploy as Web App**:
   - Click the blue **Deploy** button (top right) -> **New deployment**.
   - Select type: **Web app** (click the gear icon).
   - Configuration:
     - **Execute as**: `Me (<your-email>@gmail.com)`
     - **Who has access**: `Anyone` (this allows your public portfolio to post to it).
   - Click **Deploy** and grant permissions when prompted.
   - Copy the generated **Web App URL** (e.g. `https://script.google.com/macros/s/AKfycb.../exec`).

4. **Updating Your Script & Fixing "Script function not found: doGet"**:
   - Whenever you test by opening the Web App URL directly in a browser, Google Apps Script sends an HTTP **GET** request.
   - If you update your script code, Google Apps Script requires a **New Version** deployment to update the live endpoint:
     1. Click **Deploy** -> **Manage deployments**.
     2. Click the **Pencil (Edit)** icon next to your active deployment.
     3. Under **Version**, click the dropdown and select **New version**.
     4. Click **Deploy**.
   - Your Web App URL remains the same, but it will now execute the updated code!

5. **Connect to Your Website**:
   - Place this URL into the `action` attribute of your `<form id="contact-form" method="post">` on `index.html`.
   - `components.js` automatically intercepts submissions via AJAX, preventing page redirects and providing in-page status feedback.

---

## Solution 2: Self-Hosted n8n Workflow

If you run an `n8n` instance (self-hosted on a VPS, Raspberry Pi, or Docker):

1. Add a **Webhook** node (`HTTP Method: POST`, `Path: /portfolio-contact`).
2. Add a **Gmail** node:
   - Resource: `Message`
   - Operation: `Send`
   - To: `your-email@gmail.com`
   - Subject: `[Portfolio Contact] New message from {{ $json.body.name }}`
   - Body: `{{ $json.body.message }}`
3. Add a second **Gmail** node (or Gmail label action):
   - Resource: `Label`
   - Add label: `Portfolio Contact` to the message thread.
4. Activate the workflow and use the Production Webhook URL in your form.

---

## Solution 3: Formspree / Web3Forms + Gmail Filter Rule

If you prefer an external form gateway:

1. Register a free account at [Web3Forms](https://web3forms.com/) or [Formspree](https://formspree.io/).
2. Get your Access Key / endpoint URL.
3. In Gmail:
   - Go to **Settings** -> **Filters and Blocked Addresses** -> **Create a new filter**.
   - In "Subject", type: `[Portfolio Contact]`
   - Click **Create filter**.
   - Check **Apply the label:** -> Choose or create `Portfolio Contact`.
   - Check **Never send it to Spam**.
