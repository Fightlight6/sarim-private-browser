const { app, BrowserWindow, session } = require('electron');

app.whenReady().then(() => {
  // 1. Create an in-memory private session (no browsing history saved)
  const privateSession = session.fromPartition('incognito-session', { cache: false });

  // 2. Block third-party trackers
  privateSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;
    if (url.includes('google-analytics.com') || url.includes('facebook.net') || url.includes('doubleclick.net')) {
      return callback({ cancel: true });
    }
    callback({ cancel: false });
  });

  // 3. Launch window with DuckDuckGo as homepage
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      session: privateSession
    }
  });

  win.loadURL('https://duckduckgo.com');
});
