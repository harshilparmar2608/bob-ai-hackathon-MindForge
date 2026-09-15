const fs = require("fs");
const lines = fs.readFileSync("D:/CampusPilot/CampusPilot/backend/app/services/auth.py", "utf8").split("\n");
console.log(lines.slice(100, 150).map((l, i) => String(i + 101).padStart(3) + " | " + l).join("\n"));