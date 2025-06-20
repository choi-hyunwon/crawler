const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function uploadToNotion({ label, rsi_value, fetched_at, signal }) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Label': {
          title: [
            {
              text: {
                content: label,
              },
            },
          ],
        },
        'RSI Value': {
          number: rsi_value,
        },
        'Fetched At': {
          date: {
            start: fetched_at,
          },
        },
        'Signal': {
          rich_text: [
            {
              text: {
                content: signal || '',
              },
            },
          ],
        },
      },
    });
    console.log(`${label} RSI(14) Notion 업로드 성공`);
  } catch (error) {
    console.error('Notion 업로드 오류:', error.body);
  }
}

module.exports = { uploadToNotion }; 