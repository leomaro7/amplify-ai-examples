import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */

const backend = defineBackend({
  auth,
  data,
});

const accountId = cdk.Stack.of(backend.data).account;
const region = cdk.Stack.of(backend.data).region;

const KnowledgeBaseDataSource =
  backend.data.resources.graphqlApi.addHttpDataSource(
    "KnowledgeBaseDataSource",
    `https://bedrock-runtime.${region}.amazonaws.com`,
    {
      authorizationConfig: {
        signingRegion: region,
        signingServiceName: "bedrock",
      },
    },
  );

KnowledgeBaseDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    resources: [
      `arn:aws:bedrock:${region}:${accountId}:knowledge-base/L3ENSK42QL`
    ],
    actions: ["bedrock:Retrieve"],
  }),
);
