import { NotificationObserver } from "lergins-bot-framework";
import * as fetch from "node-fetch";

export class Push implements NotificationObserver {
  private APIKEY;

  constructor(settings) {
    this.APIKEY = settings.APIKEY;
  }

  async update(key, message) {
    switch (key) {
      case 'push': return this.push(message.to, message.data);
    }
  }

  push(to, notification){
    fetch(`https://fcm.googleapis.com/fcm/send`, {
      method: "POST",
      headers: {
        'Authorization': `key=${this.APIKEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'notification': notification,
        'to': to,
      }),
    });
  }
}

function formatDate(date) {
  return new Date(date).toISOString().replace('T', ' ').substr(0, 19) + ' UTC'
}
