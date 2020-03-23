module.exports = function(robot) {
    robot.hear(/^(goo+d )?(mo+rning|night)/i, function(res) {
        const user = res.envelope.user.name;
        res.send(`${res.match[0]} ${user}`);
    });
};
