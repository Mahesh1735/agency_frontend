import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  QueryCommand,
  PutCommand,
  QueryCommandInput,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Validate environment variables
const requiredEnvVars = [
  'VITE_AWS_REGION',
  'VITE_AWS_ACCESS_KEY_ID',
  'VITE_AWS_SECRET_ACCESS_KEY'
] as const;

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const client = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export interface Thread {
  id: string;
  userId: string;
  title: string;
  date: string;
}

export const getUserThreads = async (userId: string): Promise<Thread[]> => {
  if (!userId) {
    throw new Error('userId is required');
  }

  try {
    const params: QueryCommandInput = {
      TableName: 'agency-thread_ids',
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // This will sort by the sort key in descending order
    };

    const command = new QueryCommand(params);
    const result = await docClient.send(command);
    
    if (!result.Items) {
      return [];
    }

    return result.Items as Thread[];
  } catch (error) {
    console.error('Error fetching threads:', error);
    throw new Error('Failed to fetch threads from DynamoDB');
  }
};

export const createThread = async (userId: string, title: string): Promise<Thread> => {
  if (!userId) throw new Error('userId is required');
  
  const thread: Thread = {
    id: uuidv4(),
    userId,
    title,
    date: new Date().toISOString(),
  };

  try {
    const params = {
      TableName: 'agency-thread_ids',
      Item: thread
    };

    await docClient.send(new PutCommand(params));
    return thread;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error('Failed to create thread in DynamoDB');
  }
};

export const updateThread = async (threadId: string, updates: Partial<Thread>): Promise<void> => {
  if (!threadId) throw new Error('threadId is required');
  
  try {
    let updateExpression = 'set';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Add date update
    updateExpression += ' #date = :date';
    expressionAttributeNames['#date'] = 'date';
    expressionAttributeValues[':date'] = new Date().toISOString();

    // Add title update if provided
    if (updates.title !== undefined) {
      updateExpression += ', #title = :title';
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = updates.title;
    }

    const params = {
      TableName: 'agency-thread_ids',
      Key: { id: threadId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    };

    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error('Error updating thread:', error);
    throw new Error('Failed to update thread in DynamoDB');
  }
}; 