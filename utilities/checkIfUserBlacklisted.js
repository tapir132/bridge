const fetch = require("node-fetch");
const blacklist = require("./../resources/blacklist.json");

module.exports = async function checkIfUserBlacklisted(user) {
  const MojangAPI = fetch(`https://api.ashcon.app/mojang/v2/user/${user}`).then(
    (res) => res.json()
  );
  for (var i in blacklist) {
    if (blacklist[i].uuid === MojangAPI.uuid) {
      console.log(
        blacklist[i] + "is equal to " + MojangAPI.uuid + ", returning true."
      );
      return true;
    }
  }
  return false;
};