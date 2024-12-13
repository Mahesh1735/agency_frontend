import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from './threadService';

export interface UserActivity {
  userId: string;
  lastActive: string;
  threadCount: number;
}

export const getAllUsersActivity = async (): Promise<UserActivity[]> => {
  try {
    const params = {
      TableName: 'agency-thread_ids',
      ProjectionExpression: 'userId, #date',
      ExpressionAttributeNames: {
        '#date': 'date'
      }
    };

    const command = new ScanCommand(params);
    const result = await docClient.send(command);

    if (!result.Items) {
      return [];
    }

    // Group by userId and get latest activity
    const userActivityMap = result.Items.reduce((acc: Record<string, UserActivity>, item: any) => {
      const userId = item.userId;
      const date = item.date;

      if (!acc[userId] || date > acc[userId].lastActive) {
        acc[userId] = {
          userId,
          lastActive: date,
          threadCount: 1
        };
      } else {
        acc[userId].threadCount++;
      }

      return acc;
    }, {});

    return Object.values(userActivityMap).sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw new Error('Failed to fetch user activity from DynamoDB');
  }
}; 