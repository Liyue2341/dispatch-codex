export type TelegramConversationKind =
  | 'private_chat'
  | 'private_topic'
  | 'group_chat'
  | 'group_topic';

export type TelegramRendererKind = 'draft_stream' | 'segmented_stream';

export interface TelegramRenderRoute {
  conversationKind: TelegramConversationKind;
  preferredRenderer: TelegramRendererKind;
  currentRenderer: TelegramRendererKind;
  supportsDraftStreaming: boolean;
  usesMessageThread: boolean;
}

export function resolveTelegramRenderRoute(chatType: string, topicId: number | null): TelegramRenderRoute {
  const conversationKind = resolveTelegramConversationKind(chatType, topicId);
  const supportsDraftStreaming = chatType === 'private';
  return {
    conversationKind,
    preferredRenderer: supportsDraftStreaming ? 'draft_stream' : 'segmented_stream',
    currentRenderer: supportsDraftStreaming ? 'draft_stream' : 'segmented_stream',
    supportsDraftStreaming,
    usesMessageThread: topicId !== null,
  };
}

function resolveTelegramConversationKind(chatType: string, topicId: number | null): TelegramConversationKind {
  const isPrivate = chatType === 'private';
  if (isPrivate) {
    return topicId === null ? 'private_chat' : 'private_topic';
  }
  return topicId === null ? 'group_chat' : 'group_topic';
}
