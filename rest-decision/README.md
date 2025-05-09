# Customer Score Split Activity

This is a custom Journey Builder split activity that allows you to split contacts based on different scoring criteria.

## Overview

This custom activity demonstrates how to create a RestDecision activity type in Journey Builder with multiple outcomes. The activity UI allows users to select a score type, and the backend will route contacts through different paths based on this selection.

## Features

- Multiple outcome paths (High Score, Medium Score, Low Score, Remainder)
- Dynamic UI that changes based on selected score type
- Configurable outcomes in config.json
- Custom icon and styling

## Implementation Details

### config.json

The `config.json` file defines:

1. Activity metadata (name, type, icon, etc.)
2. Multiple outcomes with their respective branchResult values
3. Input and output arguments
4. Endpoint configurations

The key part is the `outcomes` array which defines the multiple paths:

```json
"outcomes": [
  {
    "key": "OUTCOME-1",
    "arguments": {
      "branchResult": "high_score"
    },
    "metaData": {
      "label": "High Score"
    }
  },
  ...
]
```

### User Interface

The activity provides a multi-step configuration process:
1. Introduction to the split activity
2. Selection of score type
3. Review of configuration

### Backend Implementation

For this to work in a production environment, you would need to implement a server that:

1. Receives the execution request with inArguments (including scoreType)
2. Determines which path the contact should follow
3. Returns a response with the appropriate `branchResult` value

## How It Works

- When a contact reaches this activity in a journey, the execute endpoint is called
- The backend determines which scoring criteria to apply based on the configured score type
- The backend returns a `branchResult` value matching one of the defined outcomes
- Journey Builder routes the contact to the corresponding path

## Based On

This implementation follows the Salesforce Marketing Cloud documentation on [Defining Custom Split Activities with Multiple Outcomes](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/extending-activities.html). 