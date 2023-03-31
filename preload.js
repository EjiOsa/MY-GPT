const { contextBridge, ipcRenderer } = require("electron");
const keytar = require('keytar');

contextBridge.exposeInMainWorld('keytar', {
  setPassword: async (service, account, password) => {
    return await keytar.setPassword(service, account, password);
  },
  getPassword: async (service, account) => {
    return await keytar.getPassword(service, account);
  },
  deletePassword: async (service, account) => {
    return await keytar.deletePassword(service, account);
  }
});
