// Description:
//   Make greetings great!
//   IRC listener for greetings words and reply to the sender.
//
// Commands:
//   None
//
// Author:
//   bartaz

const MORNING_GREETINGS = [
  "dzień dobry",
  "Howdy",
  "bună dimineaţa",
  "Now then",
  "Mlach thesan",
  "Alright",
  "Top of the morning to you",
  "Mōrena",
  "G'day"
];

const NIGHT_GREETINGS = [
  "dobranoc",
  "See ya later",
  "noapte bună",
  "Cheers then",
  "Mlach chutum",
  "Alright",
  "Toodle-oo",
  "Ka kite anō",
  "Hoo roo"
];

module.exports = function(robot) {
  robot.hear(/^(goo+d )?(mo+rning|night) ?(.*)?/i, function(res) {
    const user = res.envelope.user.name;
    // Get the text following the greeting.
    const remainder = res.match[3];
    // Check if the text after the greeting is another user's name.
    if (!remainder || robot.brain.usersForFuzzyName(remainder).length === 0) {
      // The user is probably not reciprocating another user's greeting so send
      // a reply.
      const greetings =
        res.match[2].toLowerCase() === "night"
          ? NIGHT_GREETINGS
          : MORNING_GREETINGS;
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      res.send(`${greeting} ${user}`);
    }
  });
};
