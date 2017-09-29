function printInfo() {
    info();
    setTimeout(function () {
        printInfo();
    }, 60000);
}
printInfo();

function page(headline, text) {
    return 'HTTP/1.1 200 OK\r\n' +//
        'Connection: close\r\n' +//
        'Content-type: text/html\r\n\r\n' +//
        '<!doctype html>' +//
        '<html>' +//
        '<head><title>esp32-javascript</title></head>' +//
        '<body>' +//
        '<h1>' + headline + '</h1>' + text +//
        '</body>' +//
        '</html>\r\n\r\n';
}


function httpServer(port, cb) {
    sockListen(9999,
        function (socket) {
            var complete = '';
            socket.onData = function (data) {
                complete = complete + data;
                if (complete.length >= 4 && complete.substring(complete.length - 4) === '\r\n\r\n') {
                    var startOfPath = complete.indexOf(' ');
                    var path = complete.substring(startOfPath + 1, complete.indexOf(' ', startOfPath + 1))
                    cb({
                        method: complete.substring(0, startOfPath),
                        raw: complete,
                        path: path
                    },
                        {
                            end: function (data) {
                                writeSocket(socket.sockfd, data);
                                closeSocket(socket.sockfd);
                                removeSocketFromSockets(socket.sockfd);
                            }
                        }
                    );
                }
            };
            socket.onError = function () {
                print('NEW SOCK: ON ERROR');
            };
        },
        function () {
            print('ON ERROR');
        },
        function () {
            print('SOCKET WAS CLOSED!');
        });
}

httpServer(9999, function (req, res) {
    if (req.path === '/restart') {
        if (req.method === 'GET') {
            res.end(page('Request restart', '<form action="/restart" method="post"><input type="submit" value="Restart" /></form>'));
        } else {
            res.end(page('Restarting...', ''));
            restart();
        }
    } else {
        res.end(page('Request summary', req.method + '<br />' + req.path + '<br />' + req.raw));
    }
});

var dateIdx = complete.indexOf('Date: ');
var commaIdx = complete.indexOf(':', dateIdx + 5);
var hours = 2 + parseInt(complete.substr(commaIdx - 2, 2));
var minutes = parseInt(complete.substr(commaIdx + 1, 2));
var seconds = parseInt(complete.substr(commaIdx + 4, 2));

var end = 6;

function update() {
    print("Time: " + hours + ":" + minutes + ":" + seconds);
    if (hours >= 19 || hours < end) {
        setLedColor(0, 1, 0, 0);
    }
    if (hours >= 21 || hours < end) {
        setLedColor(1, 1, 0, 0);
    }
    if (hours >= 22 || hours < end) {
        setLedColor(2, 1, 0, 0);
    }
    if (hours >= 0 && hours < end) {
        setLedColor(3, 1, 0, 0);
    }
    if (hours >= 2 && hours < end) {
        setLedColor(4, 1, 0, 0);
    }
    if (hours >= 3 && hours < end) {
        setLedColor(5, 1, 0, 0);
    }
    if (hours >= 4 && hours < end) {
        setLedColor(6, 1, 0, 0);
    }
    if (hours >= 5 && hours < end) {
        setLedColor(7, 1, 0, 0);
    }
    if (hours >= end && hours < end + 2) {
        for (i = 0; i < 8; i++) {
            setLedColor(i, 0, 1, 0);
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
        setLedColor(i, 0, 0, i * 30);
    }
    for (i = 0; i < 8; i++) {
        setLedColor(i, 0, i * 30, 0);
    }
    for (i = 0; i < 8; i++) {
        setLedColor(i, i * 30, 0, 0);
    }
    for (i = 0; i < 8; i++) {
        setLedColor(i, 0, 0, 1);
    }

    setTimeout(function () {
        loop();
    }, 1000);
}

init();