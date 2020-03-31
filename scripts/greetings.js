// Description:
//   Make greetings great!
//   IRC listener for greetings words and reply to the sender.
//
// Commands:
//   None
//
// Author:
//   bartaz

module.exports = function(robot) {
    robot.hear(/^(goo+d )?(mo+rning|night) ?(.*)?/i, function(res) {
        const user = res.envelope.user.name;
        // Get the text following the greeting.
        const remainder = res.match[3];
        // Check if the text after the greeting is another user's name.
        if (!remainder || robot.brain.usersForFuzzyName(remainder).length === 0) {
            // The user is probably not reciprocating a greeting so send
            // the greeting.
            res.send(`${res.match[1]}${res.match[2]} ${user}`);
        }
    });
};
