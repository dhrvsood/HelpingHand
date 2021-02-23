/**
 * Runs incredible python code
 */
module.exports = async function (...arguments) {
  return new Promise(async (resolve, reject) => {
    let getPythonData = new Promise((success, nosuccess) => {
      const { spawn } = require("child_process");
      const pyprog = spawn("python", [
        "./modules/image_rec/text_loc_data.py",
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
      resolve((data));
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
