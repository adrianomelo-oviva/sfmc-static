define(["postmonger"], function (Postmonger) {
  "use strict";

  var connection = new Postmonger.Session();
  var payload = {};
  var lastStepEnabled = false;
  var currentOutArguments = [];
  var steps = [
    // initialize to the same value as what's set in config.json for consistency
    { label: "Step 1", key: "step1" },
    { label: "Step 2", key: "step2" },
    { label: "Step 3", key: "step3" },
    { label: "Step 4", key: "step4", active: false },
  ];
  var currentStep = steps[0].key;

  // Define different outArguments configurations
  var outArgumentsConfigs = {
    config1: [
      {
        "patient_id": {
          "dataType": "Text",
          "direction": "out",
          "access": "visible"
        },
        "patient_name": {
          "dataType": "Text",
          "direction": "out",
          "access": "visible"
        },
        "age": {
          "dataType": "Number",
          "direction": "out",
          "access": "visible"
        },
        "last_visit": {
          "dataType": "Date",
          "direction": "out",
          "access": "visible"
        }
      }
    ],
    config2: [
      {
        "session_count": {
          "dataType": "Number",
          "direction": "out",
          "access": "visible"
        },
        "conversion_rate": {
          "dataType": "Decimal",
          "direction": "out",
          "access": "visible"
        },
        "last_activity": {
          "dataType": "Date",
          "direction": "out",
          "access": "visible"
        },
        "is_active_user": {
          "dataType": "Boolean",
          "direction": "out",
          "access": "visible"
        }
      }
    ],
    config3: [
      {
        "custom_score": {
          "dataType": "Number",
          "direction": "out",
          "access": "visible"
        },
        "engagement_level": {
          "dataType": "Text",
          "direction": "out",
          "access": "visible"
        },
        "risk_factor": {
          "dataType": "Decimal",
          "direction": "out",
          "access": "visible"
        },
        "needs_followup": {
          "dataType": "Boolean",
          "direction": "out",
          "access": "visible"
        },
        "next_action_date": {
          "dataType": "Date",
          "direction": "out",
          "access": "visible"
        }
      }
    ]
  };

  $(window).ready(onRender);

  connection.on("initActivity", initialize);
  connection.on("requestedTokens", onGetTokens);
  connection.on("requestedEndpoints", onGetEndpoints);

  connection.on("clickedNext", onClickedNext);
  connection.on("clickedBack", onClickedBack);
  connection.on("gotoStep", onGotoStep);

  var schema = [];
  connection.on('requestedSchema', function (data) {
    console.log(data)
    schema = data;
  });
  connection.trigger('requestSchema');

  function onRender() {
    // JB will respond the first time 'ready' is called with 'initActivity'
    connection.trigger("ready");

    connection.trigger("requestTokens");
    connection.trigger("requestEndpoints");

    // Disable the next button if a value isn't selected
    $("#select1").change(function () {
      var message = getMessage();
      connection.trigger("updateButton", {
        button: "next",
        enabled: Boolean(message),
      });

      $("#message").html(message);
    });

    // Toggle step 4 active/inactive
    // If inactive, wizard hides it and skips over it during navigation
    $("#toggleLastStep").click(function () {
      lastStepEnabled = !lastStepEnabled; // toggle status
      steps[3].active = !steps[3].active; // toggle active

      connection.trigger("updateSteps", steps);
    });

    // Handle outArguments configuration buttons
    $("#config1").click(function () {
      setOutArguments('config1', 'Patient Data');
    });

    $("#config2").click(function () {
      setOutArguments('config2', 'Analytics Data');
    });

    $("#config3").click(function () {
      setOutArguments('config3', 'Custom Metrics');
    });

    // Initialize with default display
    updateConfigDisplay();
  }

  function initialize(data) {
    if (data) {
      payload = data;
    }

    // Initialize currentOutArguments from payload if available
    if (payload && payload.arguments && payload.arguments.execute && payload.arguments.execute.outArguments) {
      currentOutArguments = payload.arguments.execute.outArguments;
      updateConfigDisplay("Loaded from saved configuration");
    }

    var message;
    var hasInArguments = Boolean(
        payload["arguments"] &&
        payload["arguments"].execute &&
        payload["arguments"].execute.inArguments &&
        payload["arguments"].execute.inArguments.length > 0
    );

    var inArguments = hasInArguments
        ? payload["arguments"].execute.inArguments
        : {};

    $.each(inArguments, function (index, inArgument) {
      $.each(inArgument, function (key, val) {
        if (key === "message") {
          message = val;
        }
      });
    });



    // If there is no message selected, disable the next button
    if (!message) {
      showStep(null, 1);
      connection.trigger("updateButton", { button: "next", enabled: false });
      // If there is a message, skip to the summary step
    } else {
      $("#select1")
      .find("option[value=" + message + "]")
      .attr("selected", "selected");
      $("#message").html(message);
      showStep(null, 3);
    }
  }

  function onGetTokens(tokens) {
    // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
    console.log(tokens);
  }

  function onGetEndpoints(endpoints) {
    // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
    console.log(endpoints);
  }

  function onClickedNext() {
    if (
        (currentStep.key === "step3" && steps[3].active === false) ||
        currentStep.key === "step4"
    ) {
      save();
    } else {
      connection.trigger("nextStep");
    }
  }

  function onClickedBack() {
    connection.trigger("prevStep");
  }

  function onGotoStep(step) {
    showStep(step);
    connection.trigger("ready");
  }

  function showStep(step, stepIndex) {
    if (stepIndex && !step) {
      step = steps[stepIndex - 1];
    }

    currentStep = step;

    $(".step").hide();

    switch (currentStep.key) {
      case "step1":
        $("#step1").show();
        connection.trigger("updateButton", {
          button: "next",
          enabled: Boolean(getMessage()),
        });
        connection.trigger("updateButton", {
          button: "back",
          visible: false,
        });
        break;
      case "step2":
        $("#step2").show();
        connection.trigger("updateButton", {
          button: "back",
          visible: true,
        });
        connection.trigger("updateButton", {
          button: "next",
          text: "next",
          visible: true,
        });
        break;
      case "step3":
        $("#step3").show();
        connection.trigger("updateButton", {
          button: "back",
          visible: true,
        });
        if (lastStepEnabled) {
          connection.trigger("updateButton", {
            button: "next",
            text: "next",
            visible: true,
          });
        } else {
          connection.trigger("updateButton", {
            button: "next",
            text: "done",
            visible: true,
          });
        }
        break;
      case "step4":
        $("#step4").show();
        break;
    }
  }

  function save() {
    // var name = $("#select1").find("option:selected").html();
    // var value = getMessage();

    // 'payload' is initialized on 'initActivity' above.
    // Journey Builder sends an initial payload with defaults
    // set by this activity's config.json file.  Any property
    // may be overridden as desired.
    // payload.name = name;

    payload["arguments"].execute.inArguments = [{
        query_id: '7df0a6ea-c1f5-48cf-8a6d-5b9c68b6484a',
        patient_user_id: 'ddabbb91-f256-4748-9d69-453f82ccc942',
        '7df0a6ea-c1f5-48cf-8a6d-5b9c68b6484a': '{{Event.DEAudience-a145fcce-6a7e-127d-04a9-4c2aa6c46242.OCS_PathwayState__c:PatientUUID__c}}',
        days_since: 12,
        days_until: 2,
        // anotherTest: '{{Interaction.REST-4.value}}',
        // schema
    }];

    // Ensure current outArguments are saved
    if (currentOutArguments && currentOutArguments.length > 0) {
      payload["arguments"].execute.outArguments = currentOutArguments;
      
      // Also update the schema
      if (payload.schema && payload.schema.arguments && payload.schema.arguments.execute) {
        payload.schema.arguments.execute.outArguments = currentOutArguments;
      }
    }

    payload["metaData"].isConfigured = true;

    connection.trigger("updateActivity", payload);
  }

  function getMessage() {
    return $("#select1").find("option:selected").attr("value").trim();
  }

  function setOutArguments(configKey, configName) {
    currentOutArguments = outArgumentsConfigs[configKey];
    
    // Update the payload with new outArguments
    if (payload && payload.arguments && payload.arguments.execute) {
      payload.arguments.execute.outArguments = currentOutArguments;
    }

    // Update the schema as well
    if (payload && payload.schema && payload.schema.arguments && payload.schema.arguments.execute) {
      payload.schema.arguments.execute.outArguments = currentOutArguments;
    }

    // Update the display
    updateConfigDisplay(configName);

    // Trigger activity update
    if (payload && payload.metaData) {
      connection.trigger("updateActivity", payload);
    }

    console.log("Updated outArguments to:", configName, currentOutArguments);
  }

  function updateConfigDisplay(configName) {
    var displayText = configName ? 
      "Current outArguments: " + configName + "\n\n" + JSON.stringify(currentOutArguments, null, 2) :
      "Current outArguments: (none selected)";
    
    $("#currentConfig").text(displayText);
  }
});
