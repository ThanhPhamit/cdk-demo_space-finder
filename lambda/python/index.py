import json
import os
import boto3
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Python Lambda function handler
    """
    print(f"Event: {json.dumps(event, indent=2)}")
    print(f"Context: {context}")

    # Access environment variables
    table_name = os.environ.get("SPACES_TABLE_NAME", "")

    # Example: Initialize DynamoDB client if table name is provided
    if table_name:
        try:
            dynamodb = boto3.resource("dynamodb")
            table = dynamodb.Table(table_name)
            print(f"Connected to table: {table_name}")
            print(f"DynamoDB table resource: {table}")
        except Exception as e:
            print(f"Error connecting to DynamoDB: {str(e)}")

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        "body": json.dumps(
            {
                "message": "Hello from Python Lambda!",
                "table_name": table_name,
                "runtime": "Python 3.12",
                "event_info": {
                    "http_method": event.get("httpMethod", "Unknown"),
                    "path": event.get("path", "Unknown"),
                    "query_params": event.get("queryStringParameters", {}),
                },
            }
        ),
    }
