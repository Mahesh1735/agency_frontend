import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  QueryCommand,
  PutCommand,
  QueryCommandInput,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { docClient } from './threadService';

export interface Resource {
  id: string;
  userId: string;
  title: string;
  url: string;
  lastUsed: string;
  type: 'link' | 'file';  // to distinguish between uploaded files and URLs
}

export const getUserResources = async (userId: string): Promise<Resource[]> => {
  if (!userId) {
    console.warn('getUserResources called with no userId');
    return [];
  }

  try {
    console.log('Fetching resources for userId:', userId);
    const params: QueryCommandInput = {
      TableName: 'agency-resources',
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    };

    const command = new QueryCommand(params);
    const result = await docClient.send(command);
    
    console.log('Resources fetched:', result.Items);
    
    if (!result.Items) {
      return [];
    }

    return result.Items as Resource[];
  } catch (error) {
    console.error('Error fetching resources:', error);
    return [];  // Return empty array instead of throwing
  }
};

export const createResource = async (
  userId: string, 
  title: string, 
  url: string, 
  type: 'link' | 'file' = 'link'
): Promise<Resource> => {
  if (!userId) throw new Error('userId is required');
  if (!title) throw new Error('title is required');
  if (!url) throw new Error('url is required');
  
  const resource: Resource = {
    id: uuidv4(),
    userId,
    title,
    url,
    type,
    lastUsed: new Date().toISOString(),
  };

  try {
    const params = {
      TableName: 'agency-resources',
      Item: resource
    };

    await docClient.send(new PutCommand(params));
    return resource;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw new Error('Failed to create resource in DynamoDB');
  }
};

export const updateResourceLastUsed = async (resourceId: string): Promise<void> => {
  if (!resourceId) throw new Error('resourceId is required');
  
  try {
    const params = {
      TableName: 'agency-resources',
      Key: { id: resourceId },
      UpdateExpression: 'set lastUsed = :lastUsed',
      ExpressionAttributeValues: {
        ':lastUsed': new Date().toISOString()
      }
    };

    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error('Error updating resource:', error);
    throw new Error('Failed to update resource in DynamoDB');
  }
}; 