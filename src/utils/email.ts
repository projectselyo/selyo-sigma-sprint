// Require:
import * as postmark from 'postmark';

const mailTemplate = (params: { code: string; email: string; }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Your Subject Here]</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .email-content h2 {
            color: #0056b3;
        }
        .email-content a {
            color: #007bff;
            text-decoration: none;
        }
        .email-content a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="email-content">
        <h2>Project Selyo</h2>
        <p>GM!</p>
        <p>Please click on the link below to login to Selyo.</p>
        <p><a href="https://selyo.quest/magic-login?code=${encodeURI(params.code)}&email=${encodeURI(params.email)}">Login to Project Selyo</a></p>
        <br />
        <p>Best regards,</p>
        <p>Team Selyo</p>
    </div>
</body>
</html>
`;

export function sendEmail(params: {
  postmarkApiKey: string;
  email: string;
  subject: string;
  code: string;
}) {
  const client = new postmark.ServerClient(params.postmarkApiKey);

  client.sendEmail({
    From: 'no-reply@selyo.quest',
    To: params.email,
    Subject: params.subject,
    HtmlBody: mailTemplate(params),
    // TextBody: 'Hello from Postmark!',
    MessageStream: 'outbound',
  });
}

// Send an email:
