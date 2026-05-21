export function renderPrivacyPolicyHtml(): string {
  const updated = "May 21, 2026";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Privacy Policy | Qikobot for WhatsApp</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #102033;
      --muted: #526173;
      --line: #d8e0ea;
      --accent: #0f766e;
      --bg: #f8fafc;
      --panel: #ffffff;
    }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--ink);
      line-height: 1.6;
    }

    main {
      max-width: 820px;
      margin: 0 auto;
      padding: 40px 20px 64px;
    }

    article {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 28px;
    }

    h1, h2 {
      line-height: 1.25;
      margin: 0 0 12px;
    }

    h1 {
      font-size: 32px;
    }

    h2 {
      font-size: 20px;
      margin-top: 28px;
    }

    p, li {
      color: var(--muted);
    }

    a {
      color: var(--accent);
    }

    .updated {
      color: var(--muted);
      margin-top: 0;
    }
  </style>
</head>
<body>
  <main>
    <article>
      <h1>Privacy Policy</h1>
      <p class="updated">Last updated: ${updated}</p>

      <p>
        Qikobot for WhatsApp connects WhatsApp messages with Qiko AI workers so users can sign in,
        select an available worker, and exchange messages through the WhatsApp Business Platform.
      </p>

      <h2>Information We Collect</h2>
      <p>When you use this WhatsApp integration, we may process:</p>
      <ul>
        <li>Your WhatsApp phone number and message text sent to the business account.</li>
        <li>Login information you provide in chat to connect your Qiko account.</li>
        <li>Conversation context needed to route your request to the selected Qiko worker.</li>
        <li>Technical logs such as webhook delivery status, request timestamps, and error details.</li>
      </ul>

      <h2>How We Use Information</h2>
      <p>We use this information to provide the WhatsApp chat service, authenticate users, deliver messages to Qiko AI workers, respond to support or reliability issues, and protect the service from misuse.</p>

      <h2>Sharing and Service Providers</h2>
      <p>
        Messages are processed through Meta's WhatsApp Business Platform and Qiko backend services.
        We do not sell personal information. We only share information with service providers where
        needed to operate, secure, and improve the integration.
      </p>

      <h2>Data Retention</h2>
      <p>
        We keep session and technical data only as long as needed to provide the service, troubleshoot
        issues, comply with legal obligations, or protect the platform. Users can request account
        disconnection by sending <strong>logout</strong> in the WhatsApp chat.
      </p>

      <h2>Security</h2>
      <p>
        We use reasonable administrative and technical safeguards, including webhook verification and
        access-controlled environment secrets, to help protect data handled by this integration.
      </p>

      <h2>Your Choices</h2>
      <p>
        You may stop using the service at any time. You can also delete the WhatsApp chat from your
        device, send <strong>logout</strong> to disconnect your Qiko session, or contact us for privacy
        questions and deletion requests.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions, contact the Qiko team at
        <a href="mailto:support@qiko.ai">support@qiko.ai</a>.
      </p>
    </article>
  </main>
</body>
</html>`;
}
