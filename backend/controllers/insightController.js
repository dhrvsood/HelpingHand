const runPython = require("../insights/runPython");

exports.handle_get_insight = async (req, res) => {
    const data = await runPython(req.body.data);
    res.json(data);
};