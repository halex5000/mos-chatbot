import { PythonLayerVersion, PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { RemovalPolicy } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MosChatbotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const runtime = lambda.Runtime.PYTHON_3_9;
    const timeout = cdk.Duration.seconds(3);
    const memorySize = 2048;

    const openAILayer = new PythonLayerVersion(this, 'openai-launchdarkly-layer', {
      removalPolicy: RemovalPolicy.DESTROY,
      entry: './openai-launchdarkly-layer',
      compatibleRuntimes: [Runtime.PYTHON_3_9]
    })

    const openAIAsker = new PythonFunction(this, "mos-fancy-chatbot", {
      memorySize,
      timeout,
      runtime,
      description:
        "used to handle questions incoming questions for the chatbot",
      handler: 'handler',
      entry: './open-ai-asker-function',
      layers: [openAILayer]
    });

    const messageTable = new Table(this, 'mos-message-table', {
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      encryption: TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    messageTable.grantReadWriteData(openAIAsker);
  }
}
