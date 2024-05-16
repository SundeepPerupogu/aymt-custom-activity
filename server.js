const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to parse and convert timezone offset
function parseTimeZoneOffset(tz) {
  const matches = tz.match(/UTC([+-]\d{2}):(\d{2})/);
  if (matches) {
    const hours = parseInt(matches[1], 10);
    const minutes = parseInt(matches[2], 10);
    return (hours * 60 + minutes) * 60 * 1000;
  }
  return null;
}

// Define the execute endpoint
app.post('/execute', (req, res) => {
  const { futureUtcTime, userTimeZone } = req.body.inArguments[0];

  try {
    // Get the current date in UTC
    const currentDateUtc = moment.utc().format('YYYY-MM-DD');
    
    // Combine the current date with the future time to create a future datetime object in UTC
    const futureUtcDatetime = moment.utc(`${currentDateUtc} ${futureUtcTime}`, 'YYYY-MM-DD HH:mm:ss');
    
    // Convert user's timezone offset to milliseconds
    const timezoneOffset = parseTimeZoneOffset(userTimeZone);

    if (timezoneOffset === null) {
      throw new Error('Invalid time zone format.');
    }

    // Get the current time in the user's timezone
    const currentTimeUserTz = moment().utcOffset(timezoneOffset / 60000);
    
    // Calculate the time difference
    const timeDifference = futureUtcDatetime.diff(currentTimeUserTz);

    res.status(200).send({
      timeDifference: moment.duration(timeDifference).humanize()
    });
  } catch (error) {
    res.status(400).send({
      error: error.message
    });
  }
});

// Define the publish endpoint
app.post('/publish', (req, res) => {
  res.status(200).send();
});

// Define the validate endpoint
app.post('/validate', (req, res) => {
  const inArguments = req.body.arguments.execute.inArguments;

  if (inArguments.length === 0) {
    return res.status(400).send({
      error: 'No configuration data provided'
    });
  }

  const { futureUtcTime, userTimeZone } = inArguments[0];

  if (!futureUtcTime || !userTimeZone) {
    return res.status(400).send({
      error: 'Configuration data is missing required fields'
    });
  }

  res.status(200).send();
});

// Define the stop endpoint
app.post('/stop', (req, res) => {
  res.status(200).send();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
