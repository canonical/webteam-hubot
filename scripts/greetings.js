module.exports = function(robot) {
    robot.hear(/^(goo+d )?(mo+rning|night)/, function(res) {
        const user = res.envelope.user.name;
        res.send(`${res.match[0]} ${user}`);
    });
};
