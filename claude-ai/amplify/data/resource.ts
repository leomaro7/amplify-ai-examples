import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({

  knowledgeBase: a
    .query()
    .arguments({ input: a.string() })
    .handler(
      a.handler.custom({
        dataSource: "KnowledgeBaseDataSource",
        entry: "./resolvers/kbResolver.js",
      }),
    )
    .returns(a.string())
    .authorization((allow) => allow.authenticated()),

  chat: a.conversation({
    aiModel: a.ai.model("Claude 3.5 Sonnet"),
    systemPrompt: `あなたはsearchDocumentationを参考に質問に回答します。<searchDocumentation>{context}</searchDocumentation>documentsを参考にせずに回答する場合は、「資料にありませんが、私の知識では」と言う言葉の後に、知識で回答します。`,
    inferenceConfiguration: {
      temperature: 0.1,
      topP: 0.9,
      maxTokens: 2000,
    },
    tools: [
      a.ai.dataTool({
        name: 'searchDocumentation',
        description: 'ドキュメントに対して検索を行います。',
        query: a.ref('knowledgeBase'),
      }),
    ]
  })
    .authorization((allow) => allow.owner()),

  chatNamer: a
    .generation({
      aiModel: a.ai.model("Claude 3 Haiku"),
      systemPrompt: `あなたは会話にタイトルをつけるアシスタントです。タイトルの長さは2〜10語です。`,
      inferenceConfiguration: {
        temperature: 0.1,
        topP: 0.9,
        maxTokens: 100,
      },
    })
    .arguments({
      content: a.string(),
    })
    .returns(
      a.customType({
        name: a.string(),
      })
    )
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
