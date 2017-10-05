// -- CONFIG
wifiStopHours = 22;
wifiStopMinutes = 30;
wifiStartHours = 6;
wifiStartMinutes = 15;
//-- END

var wifi = true;

function printInfo() {
    info();
    setTimeout(function () {
        printInfo();
    }, 60000);
}
printInfo();

var state_r = [0, 0, 0, 0, 0, 0, 0, 0];
var state_g = [0, 0, 0, 0, 0, 0, 0, 0];
var state_b = [0, 0, 0, 0, 0, 0, 0, 0];

function updateLed(num, r, g, b) {
    state_r[num] = r;
    state_g[num] = g;
    state_b[num] = b;
    setLedColor(num, r, g, b);
}

function getLedHtmlColor(num) {
    return '#' + (state_r[num] ? 'f' : '0') + (state_g[num] ? 'f' : '0') + (state_b[num] ? 'f' : '0')
}

function createLedTable() {
    return '<table><tr>' +
        '<td style="background-color:' + getLedHtmlColor(0) + '">&nbsp;</td>' +
        '<td style="background-color:' + getLedHtmlColor(1) + '">&nbsp;</td>' +
        '<td style="background-color:' + getLedHtmlColor(2) + '">&nbsp;</td>' +
        '<td style="background-color:' + getLedHtmlColor(3) + '">&nbsp;</td>' +
        '<td style="background-color:' + getLedHtmlColor(4) + '">&nbsp;</td>' +
        '<td style="background-color:' + getLedHtmlColor(5) + '">&nbsp;</td>' +
        '<td style="background-color:' + getLedHtmlColor(6) + '">&nbsp;</td>' +
        '<td style="background-color:' + getLedHtmlColor(7) + '">&nbsp;</td>' +
        '</tr></table>'
}

requestHandler.push(function handleRequest(req, res) {
    if (req.path === '/status') {
        res.end(page('Status', '<div>Time: ' + hours + ':' + minutes + ':' + seconds +
            '</div><div>StartTime: ' + startTime + '</div>' +
            createLedTable()));
    }
});

var dateIdx = complete.indexOf('Date: ');
var commaIdx = complete.indexOf(':', dateIdx + 5);
var hours = 2 + parseInt(complete.substr(commaIdx - 2, 2));
var minutes = parseInt(complete.substr(commaIdx + 1, 2));
var seconds = parseInt(complete.substr(commaIdx + 4, 2));
var startTime = hours + ':' + minutes + ':' + seconds;
var end = 6;

function update() {
    print("Time: " + hours + ":" + minutes + ":" + seconds);
    print("StartTime: " + startTime);
    if (hours >= 19 || hours < end) {
        updateLed(0, 1, 0, 0);
    }
    if (hours >= 21 || hours < end) {
        updateLed(1, 1, 0, 0);
    }
    if (hours >= 22 || hours < end) {
        updateLed(2, 1, 0, 0);
    }
    if (hours >= 0 && hours < end) {
        updateLed(3, 1, 0, 0);
    }
    if (hours >= 2 && hours < end) {
        updateLed(4, 1, 0, 0);
    }
    if (hours >= 3 && hours < end) {
        updateLed(5, 1, 0, 0);
    }
    if (hours >= 4 && hours < end) {
        updateLed(6, 1, 0, 0);
    }
    if (hours >= 5 && hours < end) {
        updateLed(7, 1, 0, 0);
    }
    if (hours >= end && hours < end + 2) {
        for (i = 0; i < 8; i++) {
            updateLed(i, 0, 1, 0);
        }
    }
    if (hours >= end + 2 && hours < 19) {
        for (i = 0; i < 8; i++) {
            updateLed(i, 0, 0, 1);
        }
    }

    if (wifi && hours >= wifiStopHours && minutes >= wifiStopMinutes) {
        print('Timebased wifi shutdown...')
        wifi = false;
        stopWifi();
    }

    if (!wifi && hours >= wifiStartHours && hours < wifiStopHours && minutes >= wifiStartMinutes) {
        print('Timebased wifi startup...')
        wifi = true;
        startWifi();
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
    loop();
}

init();