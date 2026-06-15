/**
 * Server-Sent Events Dispatcher
 */

const broadcastEvent = (req, event, payload) => {
  const sseClients = req.app.get('sseClients');
  if (!sseClients) return;

  const dataString = `data: ${JSON.stringify({ event, payload })}\n\n`;
  for (let [id, res] of sseClients.entries()) {
    try {
      res.write(dataString);
    } catch (e) {
      console.error('SSE Broadcast error:', e);
    }
  }
};

const sendEventToUser = (req, userId, event, payload) => {
  const sseClients = req.app.get('sseClients');
  if (!sseClients) return;

  const res = sseClients.get(userId.toString());
  if (res) {
    try {
      res.write(`data: ${JSON.stringify({ event, payload })}\n\n`);
    } catch (e) {
      console.error('SSE Send error:', e);
    }
  }
};

module.exports = {
  broadcastEvent,
  sendEventToUser
};
