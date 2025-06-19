// Node.js (AWS SDK v3 예시)
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "ap-northeast-2" }); // 서울 리전

async function sendEmail({ to, subject, body, from }) {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    },
    Source: from, // Verified email address in SES
  };

  try {
    const data = await sesClient.send(new SendEmailCommand(params));
    console.log("Email sent:", data.MessageId);
  } catch (err) {
    console.error("Email sending error:", err);
  }
}

export default sendEmail;