//created by Qi on Jan 13 2024
////////////////////////////////////////////////////////////////////////////////
function getCurrentNewYorkTimestamp() {
  // Create a new Date object for the current time
  const currentDate = new Date();

  // Account for the New York time zone offset (Eastern Time Zone)
  const nyOffset = -5; // UTC-5 standard time offset
  const daylightSavingTime = currentDate.getMonth() > 2 && currentDate.getMonth() < 10; // Check if daylight saving time is in effect (March to October)
  if (daylightSavingTime) {
    nyOffset = -4; // UTC-4 during daylight saving time
  }

  // Adjust the time with the New York offset
  currentDate.setUTCHours(currentDate.getUTCHours() + nyOffset);

  // Format the date to ISO-8601 format
  const iso8601DateTime = currentDate.toISOString();
  return iso8601DateTime;
}

class performanceTimer {
  constructor(info) {
    if (debugMode < 2) return;
    this.startTime = process.uptime();
    this.checkPoint = [`performance timer time unit - seconds, ${info}`];

    // this.checkpoint = [`performance timer -stack-${function_info.slice(13)}\n- time unit - seconds`];
  }
  addTick(tick_name) {
    if (debugMode < 2) return;
    this.checkPoint.push({
      name: tick_name,
      time: (process.uptime() - this.start_time)
    })
  }
  done() {
    if (debugMode < 2) return;
    this.addTick("end task");
    console.log(this.checkPoint);
  }
}
////////////////////////////////////////////////////////////////////////////////
module.exports = { getCurrentNewYorkTimestamp };
