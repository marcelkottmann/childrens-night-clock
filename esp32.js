// -- CONFIG
var start = {
};
var end = {
};
//-- END

function loadConfig() {
    var starthour = el_load('timer.startHour');
    var startmin = el_load('timer.startMin');
    start.hour = starthour ? parseInt(starthour) : 19;
    start.minute = startmin ? parseInt(startmin) : 0;

    var endhour = el_load('timer.endHour');
    var endmin = el_load('timer.endMinute');
    end.hour = endhour ? parseInt(endHour) : 6;
    end.minute = endmin ? parseInt(endmin) : 5;
}
loadConfig();

function between(now, start, end, divider) {
    var startTime = start.hour * 60 + start.minute;
    var endTime = end.hour * 60 + end.minute;
    var nowTime = now.hour * 60 + now.minute;

    if (startTime > endTime) {
        endTime += (24 * 60);
    }

    if (startTime > nowTime) {
        nowTime += (24 * 60);
    }

    if (nowTime >= startTime && nowTime <= endTime) {
        var sliceSize = (endTime - startTime) / divider;
        return slice = 1 + Math.floor((nowTime - startTime) / sliceSize);
    } else {
        return 0;
    }
}

/*
function printInfo() {
    info();
    setTimeout(function () {
        printInfo();
    }, 10000);
}
printInfo();
*/

var state_r = [0, 0, 0, 0, 0, 0, 0, 0];
var state_g = [0, 0, 0, 0, 0, 0, 0, 0];
var state_b = [0, 0, 0, 0, 0, 0, 0, 0];

function updateLed(num, r, g, b) {
    //print(num + ':' + r + ',' + g + ',' + b);
    state_r[num] = r;
    state_g[num] = g;
    state_b[num] = b;
    setLedColor(num, r, g, b);
}

function getLedHtmlColor(num) {
    return '#' + (state_r[num] ? 'f' : '0') + (state_g[num] ? 'f' : '0') + (state_b[num] ? 'f' : '0')
}

function createCell(col) {
    return '<td style="background-color:' + col + '">&nbsp;</td>';
}

function createLedTable() {
    return '<table><tr>' +
        createCell(getLedHtmlColor(0)) +
        createCell(getLedHtmlColor(1)) +
        createCell(getLedHtmlColor(2)) +
        createCell(getLedHtmlColor(3)) +
        createCell(getLedHtmlColor(4)) +
        createCell(getLedHtmlColor(5)) +
        createCell(getLedHtmlColor(6)) +
        createCell(getLedHtmlColor(7)) +
        '</tr></table>'
}

requestHandler.push(function handleRequest(req, res) {
    if (req.path === '/status') {
        if (req.method === 'GET') {
            res.end(page('Status', '<div>Time: ' + hours + ':' + minutes + ':' + seconds +
                '</div><div>Boot Time: ' + bootTime + '</div>' +
                createLedTable() +
                '<form action="/status" method="post">' +
                'Timer Start: <input type="text" name="timerStartHour" size="2" value="' + start.hour + '" />:' +
                '<input type="text" name="timerStartMinute" size="2" value="' + start.minute + '" /><br />' +
                'Timer End: <input type="text" name="timerEndHour" size="2" value="' + end.hour + '" />:' +
                '<input type="text" name="timerEndMinute" size="2" value="' + end.minute + '" /><br />' +
                '<input type="submit" value="Save" /></form>'
            ));
        } else {
            var config = parseQueryStr(req.body);
            el_store('timer.startHour', config.timerStartHour);
            el_store('timer.startMin', config.timerStartMinute);
            el_store('timer.endHour', config.timerEndHour);
            el_store('timer.endMinute', config.timerEndMinute);
            loadConfig();
            update();
            res.end(page('Saved', JSON.stringify(config) + '<br /><a href="status">Status</a>'));
        }
    }
});

var dateIdx = headers.indexOf('Date: ');
var commaIdx = headers.indexOf(':', dateIdx + 5);
var hours = 2 + parseInt(headers.substr(commaIdx - 2, 2));
var minutes = parseInt(headers.substr(commaIdx + 1, 2));
var seconds = parseInt(headers.substr(commaIdx + 4, 2));
var bootTime = hours + ':' + minutes + ':' + seconds;

var now = {};

function update() {
    print("Time: " + hours + ":" + minutes + ":" + seconds);
    print("Boot Time: " + bootTime);

    now.hour = hours;
    now.minute = minutes;

    var activeSlice = between(now, start, end, 8);
    if (activeSlice === 0) {
        // day mode
        activeSlice = between(now, end, start, 2);
        for (var led = 0; led < 8; led++) {
            if (activeSlice === 1) {
                updateLed(led, 0, 1, 0);
            } else if (activeSlice === 2) {
                updateLed(led, 0, 0, 1);
            }
        }
    } else {
        // night mode
        for (var led = 0; led < 8; led++) {
            if (led < activeSlice) {
                updateLed(led, 1, 0, 0);
            } else {
                updateLed(led, 0, 0, 1);
            }
        }
    }
}

function loop() {
    update();
    setTimeout(function () {
        minutes += 1;
        if (minutes > 59) {
            minutes = 0;
            hours += 1;
        }
        if (hours > 23) {
            hours = 0;
        }
        loop();
    }, 60000);
}

function init() {
    for (i = 0; i < 8; i++) {
        updateLed(i, 0, 0, i * 30);
    }
    for (i = 0; i < 8; i++) {
        updateLed(i, 0, i * 30, 0);
    }
    for (i = 0; i < 8; i++) {
        updateLed(i, i * 30, 0, 0);
    }
    for (i = 0; i < 8; i++) {
        updateLed(i, 0, 0, 1);
    }

    setTimeout(stopWifi, 15 * 60000);

    loop();
}

init();
