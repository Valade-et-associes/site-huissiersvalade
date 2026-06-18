import { loadLocalEnv } from "./_env.mjs";

loadLocalEnv();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function sanitizeEmail(value) {
  return String(value || "").trim();
}

async function getAccessToken() {
  const tenantId = requireEnv("GRAPH_TENANT_ID");
  const clientId = requireEnv("GRAPH_CLIENT_ID");
  const clientSecret = requireEnv("GRAPH_CLIENT_SECRET");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Microsoft token request failed: ${data.error_description || data.error || response.status}`);
  }

  return data.access_token;
}

export async function sendGraphMail({ to, replyTo, subject, text }) {
  const sender = requireEnv("GRAPH_SENDER_USER");
  const token = await getAccessToken();
  const toAddress = sanitizeEmail(to);
  const replyToAddress = sanitizeEmail(replyTo);

  const message = {
    message: {
      subject,
      body: {
        contentType: "Text",
        content: text
      },
      toRecipients: [
        {
          emailAddress: {
            address: toAddress
          }
        }
      ]
    },
    saveToSentItems: true
  };

  if (replyToAddress) {
    message.message.replyTo = [
      {
        emailAddress: {
          address: replyToAddress
        }
      }
    ];
  }

  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  if (response.status !== 202) {
    const error = await response.text();
    throw new Error(`Microsoft Graph sendMail failed: ${response.status} ${error}`);
  }
}
