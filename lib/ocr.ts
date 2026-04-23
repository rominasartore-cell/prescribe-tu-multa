import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { TextractClient, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';
import { readFile } from 'fs/promises';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const textractClient = new TextractClient({ region: process.env.AWS_REGION });

export async function uploadToS3(buffer: Buffer, fileName: string): Promise<string> {
  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf',
  });

  await s3Client.send(command);
  return key;
}

export async function extractTextFromPDF(s3Key: string): Promise<string> {
  const command = new AnalyzeDocumentCommand({
    Document: {
      S3Object: {
        Bucket: process.env.AWS_S3_BUCKET,
        Name: s3Key,
      },
    },
    FeatureTypes: ['TABLES', 'FORMS'],
  });

  const response = await textractClient.send(command);
  let text = '';

  if (response.Blocks) {
    for (const block of response.Blocks) {
      if (block.BlockType === 'LINE' || block.BlockType === 'TABLE') {
        if (block.Text) {
          text += block.Text + '\n';
        }
      }
    }
  }

  return text;
}

export async function getPdfFromS3(s3Key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
  });

  const response = await s3Client.send(command);
  const chunks = [];

  if (response.Body) {
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
  }

  return Buffer.concat(chunks);
}
