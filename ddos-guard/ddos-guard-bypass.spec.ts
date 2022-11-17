import config from "../kdmid-checker.config";

const dg = require("@cantfindkernel/ddos-guard-bypass");
const axios = require("axios");

// To remove additional logging, make remove the "true" argument from line 16!

(async function() {
    let ddgu = await dg.bypass(config.link_to_kdmid, true);
    console.log("Result:", ddgu);
    console.log("Requesting page...");
    let resp = await axios({
        url: config.link_to_kdmid,
        headers: ddgu.headers,
        cookie: ddgu.cookie,
        validateStatus: function() {return true;},
        throwHttpErrors: false
    });
    if (resp.status == 200 && resp.data.split("<title>")[1].split("</title>")[0] == "DDoS Protection | DDoS-Guard Security Service Provider") console.log(`Passed test!`);
    else if (resp.status !== 200) console.log(`Failed test! Got status code that was not 200.`, resp.status);
    else console.log("Possibly incorrect bypass, doesn't have expected title, says: ", resp.data.split("<title>")[1].split("</title>")[0]);
})();