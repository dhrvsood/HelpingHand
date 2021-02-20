/**
 * Estimates the number of trees in a certain area
 * Data from http://lahubcom.maps.arcgis.com/home/item.html?id=3ac3c0dc510a4581bb7f2c879f15ede5
 */
module.exports = async function (...arguments) {
  return new Promise(async (resolve, reject) => {
    let getPythonData = new Promise((success, nosuccess) => {
      const { spawn } = require("child_process");
      const pyprog = spawn("python", [
        "./modules/myaithingy/main.py",
        ...arguments,
      ]);

      pyprog.stdout.on("data", function (data) {
        success(data);
      });

      pyprog.stderr.on("data", (data) => {
        nosuccess(data);
      });
    });

    try {
      let data = (await getPythonData).toString();
      resolve({
        data: data,
      });
    } catch (err) {
      console.log(err);
      resolve({
        failure: true,
        err: err.toString(),
      });
      console.log("Something went wrong");
      console.log(err.toString());
    }
  });
};
