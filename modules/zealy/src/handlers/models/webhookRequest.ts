import { WebhookRequestData } from './webhookRequestData';

export type WebhookRequestType =
  | 'JOINED_COMMUNITY'
  | 'LEFT_COMMUNITY'
  | 'QUEST_SUCCEEDED'
  | 'QUEST_CLAIMED'
  | 'QUEST_FAILED'
  | 'QUEST_CLAIM_STATUS_UPDATED'
  | 'SPRINT_STARTED'
  | 'SPRINT_ENDED'
  | 'USER_BANNED';

export interface WebhookRequest {
  id: string;
  type: WebhookRequestType;
  data: WebhookRequestData;
  time: number; // Timestamp, in milliseconds
  secret: string;
}
