const chalk = require("chalk")
const fs = require("fs")

global.botName = "Arc-Base"
global.ownerName = "XXX"
global.owner = ["628998052763"]
global.thumb = "https://files.catbox.moe/y8xsxf.jpg"

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.yellowBright(`[ UPDATE ] File ${__filename} telah diubah, memuat ulang...`));
    delete require.cache[file];
    require(file);
});