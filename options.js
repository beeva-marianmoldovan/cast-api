var cronSchedule = [

  {
    "startTime": "12:30",
    "endTime": "14:00",
    "content": {
      "type": "web",
      "content": "http://blue-indico-tvs-manager.s3-website-eu-west-1.amazonaws.com/"
    }
  },

  {
    "startTime": "16:00",
    "endTime": "18:00",
    "content": {
      "type": "web",
      "content": "https://bee-on-time-92bd5.firebaseapp.com/"
    }
  }
]

var defaultContent = {
  "type": "web",
  "content": "http://blue-indico-tvs-manager.s3-website-eu-west-1.amazonaws.com/logo.html"
}


exports.cronSchedule = cronSchedule;
exports.defaultContent = defaultContent;