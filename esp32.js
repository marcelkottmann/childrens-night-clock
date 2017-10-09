// -- CONFIG
var wifiStart = {
    hour: 6,
    minute: 15
};
var wifiStop = {
    hour: 22,
    minute: 30
};

var start = {
    hour: 19,
    minute: 0
};
var end = {
    hour: 6,
    minute: 5
};
//-- END

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
        return slice = Math.ceil((nowTime - startTime) / sliceSize);
    } else {
        return 0;
    }
}

var wifi = true;

function printInfo() {
    info();
    setTimeout(function () {
        printInfo();
    }, 10000);
}
printInfo();

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
        res.end(page('Status', '<div>Time: ' + hours + ':' + minutes + ':' + seconds +
            '</div><div>Boot Time: ' + bootTime + '</div>' +
            createLedTable()));
    }
});

var dateIdx = headers.indexOf('Date: ');
var commaIdx = headers.indexOf(':', dateIdx + 5);
var hours = 2 + parseInt(headers.substr(commaIdx - 2, 2));
var minutes = parseInt(headers.substr(commaIdx + 1, 2));
var seconds = parseInt(headers.substr(commaIdx + 4, 2));
var bootTime = hours + ':' + minutes + ':' + seconds;

function update() {
    print("Time: " + hours + ":" + minutes + ":" + seconds);
    print("Boot Time: " + bootTime);

    var now = {
        hour: hours,
        minute: minutes
    }

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

    if (wifi && between(now, wifiStop, wifiStart, 1)) {
        print('Timebased wifi shutdown...')
        wifi = false;
        stopWifi();
    }

    if (!wifi && between(now, wifiStart, wifiStop, 1)) {
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