const fs = require("fs");
const p = "D:/CampusPilot/CampusPilot/src/pages/RegisterPage.tsx";
let s = fs.readFileSync(p, "utf8");
s = s
  .replace(/Password must be at least 6 characters\./g, "Password must be at least 8 characters.")
  .replace(/Min 6 characters/g, "Min 8 characters")
  .replace(/min_length=6/g, "min_length=8");
fs.writeFileSync(p, s, "utf8");
console.log("REGISTRATION_PASSWORD_POLICY_UPDATED");