// Description:
//  A script that returns a random person in the team
//
// Commands
//   webbot colleague [number]: sends a or number colleagues
//
// Authors
//   Masterclass

module.exports = function(robot) {
    robot.respond(/colleague ?(.*)?/, function (res) {
        var people = Number(res.match[1]) | 1;
        res            
            .http('http://random.webteam.space/')
            .header('Content-Type', 'application/json')
            .get()(function(err, _, body) {
                var data = JSON.parse(body)
                for (var i=1 ; i<people ; i++) {
                    var number = Math.floor(Math.random() * data.length);
                    res.send(data[number]);
                }
            });
    });
}