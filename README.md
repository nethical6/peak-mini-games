# BRYTE: Mini-Games

This repository contains the code for the games in BRYTE. Contributions are welcome! Feel free to open pull requests and submit your custom games for approval.

## Sending the Final Score to BRYTE

All games must send their final scores back to BRYTE. You can do this using the following function:

```javascript
const androidInterfaceExists = typeof AndroidInterface !== 'undefined';

function sendGameOverUpdate(score) {
  if (androidInterfaceExists) {
    AndroidInterface.onGameOver(score);
  }
}
