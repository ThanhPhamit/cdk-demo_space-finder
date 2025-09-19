#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SpaceFinderStack } from '../lib/space-finder-stack';

const app = new cdk.App();
new SpaceFinderStack(app, 'SpaceFinderStack');
