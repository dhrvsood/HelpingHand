const runPython = require("../insights/runPython");

exports.handle_get_insight = async (req, res) => {
    const data = await runPython();
    res.json({
        "status" : data
    })
}