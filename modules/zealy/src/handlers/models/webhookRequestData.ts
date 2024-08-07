export interface WebhookCommunityPayload {
  id: string;
  name: string;
  subdomain: string;
  blockchain: string;
  discord: string | null;
  twitter: string | null;
  website: string | null;
}

export interface WebhookUserPayload {
  id: string;
  name: string | null;
  twitter: {
    id: string;
    username: string | null;
  } | null;
  discord: {
    id: string;
    handle: string | null;
  } | null;
  email: string | null;
  addresses: {
    [key: string]: string;
  };
}

export interface WebhookQuestPayload {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string | null;
  xp: number | null;
  published: boolean | null;
  autoValidate: boolean | null;
  tasks: TaskPayload[];
  lastReviewerId: string;
}

export interface TaskPayload {}

export type WebhookQuestTaskInputPayload =
  | {}
  | { value: string }
  | { value: number }
  | { values: string[] }
  | { fileUrls: string[] }
  | { tweetId?: string };

export interface JoinedCommunityEventData {
  community: WebhookCommunityPayload;
  user: WebhookUserPayload;
}

export interface LeftCommunityEventData {
  community: WebhookCommunityPayload;
  user: WebhookUserPayload;
}

export interface QuestSucceededEventData {
  community: WebhookCommunityPayload;
  user: WebhookUserPayload;
  quest: WebhookQuestPayload;
  taskInputs?: {
    taskId: string;
    taskType:
      | 'number'
      | 'date'
      | 'api'
      | 'text'
      | 'discord'
      | 'url'
      | 'telegram'
      | 'quiz'
      | 'invites'
      | 'visitLink'
      | 'file'
      | 'poll'
      | 'opinion'
      | 'twitterFollow'
      | 'twitterSpace'
      | 'twitterReact'
      | 'tweet';
    input: WebhookQuestTaskInputPayload;
  }[];
}

export type WebhookRequestData =
  | JoinedCommunityEventData
  | LeftCommunityEventData
  | QuestSucceededEventData;
