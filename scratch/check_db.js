const Database = require('better-sqlite3');
const { join } = require('path');

const dbPath = join(__dirname, '..', 'sqlite.db');
const db = new Database(dbPath);

console.log("=== DB CHECKS ===");

const settingsCount = db.prepare("SELECT COUNT(*) as count FROM Settings").get();
console.log("Settings rows:", settingsCount.count);
if (settingsCount.count > 0) {
  const settings = db.prepare("SELECT * FROM Settings").get();
  console.log("Settings details:", JSON.stringify(settings, null, 2));
}

const bannerCount = db.prepare("SELECT COUNT(*) as count FROM Banner").get();
console.log("Banner rows:", bannerCount.count);
if (bannerCount.count > 0) {
  const banners = db.prepare("SELECT * FROM Banner").all();
  console.log("Banners details:", JSON.stringify(banners, null, 2));
}

const announcementCount = db.prepare("SELECT COUNT(*) as count FROM Announcement").get();
console.log("Announcement rows:", announcementCount.count);
if (announcementCount.count > 0) {
  const announcements = db.prepare("SELECT * FROM Announcement").all();
  console.log("Announcements details:", JSON.stringify(announcements, null, 2));
}
