let textFile = "../backup/birthday-bk.txt";

let fs = require("fs");

// Or
// fs.writeFileSync("/tmp/test-sync", "Hey there!");
export const writeFile = () => {
  fs.writeFile("/tmp/test", "Hey there!", function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
};
