const UPX = require("upx")({ best: true });
const path = require("path");

UPX(path.join(__dirname, "dist/knife4j-swagger.exe"))
  .output("./compressed.exe")
  .start()
  .then(function (stats) {
    console.log(stats);
  })
  .catch(function (err) {
    console.log(err);
  });
