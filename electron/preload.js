const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke: (channel, ...args) => {
    const validChannels = ['generate-video', 'select-output-folder'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid IPC channel: ${channel}`);
  },
});
