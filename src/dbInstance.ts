import localforage from "localforage";

const db = localforage.createInstance({
  name: "DashboardMakerDB",
  storeName: "DashboardMakerStore",
});

export default db;
