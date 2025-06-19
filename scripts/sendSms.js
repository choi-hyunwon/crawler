// Node.js (AWS SDK v3 예시)
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "ap-northeast-2" }); // 서울 리전

async function sendSms(phoneNumber, message) {
  const params = {
    Message: message,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Promotional' // 또는 'Promotional'
      }
    }
  };

  try {
    const data = await snsClient.send(new PublishCommand(params));
    console.log("SMS sent:", data.MessageId);
  } catch (err) {
    console.error("SMS sending error:", err);
  }
}

export default sendSms;

    