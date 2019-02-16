
Date.prototype.format = function(fmt) {
    var o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        'S': this.getMilliseconds()
    };

    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1,
            (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp('('+ k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1,
                RegExp.$1.length == 1
                ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
         }
    }

    return fmt;
}

function log(data) {
    var timeStr = '[' + new Date().format('hh:mm:ss.S') + '] ';
    console.log(timeStr + data);
}

function setPlayerSize(id, height) {
    var player = document.getElementById(id);
    if (self != top) {
        player.height = document.body.clientWidth / 1.5;
    } else {
        player.width = document.body.clientWidth;
        player.height = document.body.clientHeight - height;
    }
}

function playerOnClick(player) {
    //var player = document.getElementById('player');
    //if (player.paused) {
    //    player.play();
    //} else {
    //    player.pause();
    //}
}

function forceRTMP() {
    var ua = navigator.userAgent;
    console.log(ua);

    if (ua.indexOf('Mobile') != -1
        //|| (ua.indexOf('Chrome') != -1 && ua.indexOf('PR/') != -1)
        || (ua.indexOf('Chrome') == -1 && ua.indexOf('Safari') != -1))
    {
        return false;
    }

    return true;
}

function forceFlash() {
    return forceRTMP();
}

function getRTMPUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) {
            return;
        } else if (xhr.status == 200) {
            var rtmpUrl = JSON.parse(xhr.responseText);
            console.log(rtmpUrl);
            callback(rtmpUrl);
        }
    };
    xhr.open('GET', url, true);
    xhr.send();
}

function getLastCurTime(key) {
    if (typeof(Storage) !== 'undefined' && sessionStorage[key]) {
        return sessionStorage[key];
    } else {
        return 0;
    }
}

function setLastCurTime(key, val) {
    if (typeof(Storage) !== 'undefined') {
        sessionStorage[key] = val;
    }
}

function isKantvClient() {
    var ua = navigator.userAgent;
    if (ua.indexOf('KANTV') == -1) {
        return false;
    }

    if (top != self) {
        window.qt = top.getQt();

    } else {
        window.qt = navigator.qt;
    }

    return true;
}

function initKantvClient(url, url2) {
    if (!isKantvClient()) {
        return false;
    }

    var data = {
        url: url,
        url2: url2
    };
    data = JSON.stringify(data);

    try {
        window.qt.onmessage = function(ev) {
            console.log(ev.data);
            //alert(ev.data);
        };

        window.qt.postMessage(data);
        return true;
    } catch (ex) {
        console.log(ex);
        alert(ex);
        return false;
    }
}

function initH5Player(id, url, isLiveMode, origUrl) {
    if (initKantvClient(url)) {
        return;
    }

    var path = window.location.pathname;
    var player = document.getElementById(id);
    var duration = -1, lastCurTime = getLastCurTime(path);
    var inited = false, playInited = false, playing = false;
    var replayCount = 0, lastUpdateTime = -1;

    log('path: ' + path + ', lastCurTime: ' + lastCurTime);

    var playUrl = function(url) {
        playing = false;

        log(url);
        player.src = url;
    };

    if (isLiveMode) {
        setInterval(function() {
            var curTime = new Date().getTime();

            if (playing && curTime - lastUpdateTime > 3000) {
                log(lastUpdateTime + '====================================');
                playUrl(url);
            }
        }, 1000);
    }

    player.addEventListener('loadedmetadata', function() {
        log('loadedmetadata() duration: ' + player.duration);
    });

    player.addEventListener('loadstart', function() {
        log('loadstart');
    });
    player.addEventListener('emptied', function() {
        log('emptied');
    });
    player.addEventListener('canplaythrough', function() {
        log('canplaythrough');

        //if (!isLiveMode && !inited) {
        //    inited = true;

        //    if (duration >= player.duration) {
        //        player.currentTime = duration - 1;
        //    } else {
        //        player.currentTime = lastCurTime;
        //    }

        //    lastCurTime = 0;
        //}
    });
    player.addEventListener('ratechange', function() {
        log('ratechange');
    });
    player.addEventListener('progress', function() {
        //log('progress');
    });
    player.addEventListener('stalled', function() {
        //log('stalled');
    });
    player.addEventListener('play', function() {
        log('play');
    });
    player.addEventListener('playing', function() {
        log('playing');
    });
    player.addEventListener('pause', function() {
        log('pause');
        playing = false;
    });
    player.addEventListener('durationchange', function() {
        log('durationchange');
    });
    player.addEventListener('resize', function() {
        log('resize');
    });
    player.addEventListener('suspend', function() {
        log('suspend');
    });
    player.addEventListener('waiting', function() {
        log('waiting');
    });
    player.addEventListener('volumechange', function() {
        log('volumechange');
    });
    player.addEventListener('abort', function() {
        log('abort');
    });
    player.addEventListener('loadeddata', function() {
        log('loadeddata');
    });
    player.addEventListener('seeking', function() {
        log('seeking');
    });
    player.addEventListener('canplay', function() {
        log('canplay');
    });
    player.addEventListener('seeked', function() {
        log('seeked');

        //if (!isLiveMode && !playInited) {
        //    playInited = true;

        //    if (duration >= player.duration) {
        //        player.pause();
        //    } else {
        //        player.play();
        //    }
        //}
    });

    player.addEventListener('timeupdate', function() {
        lastUpdateTime = new Date().getTime();
        playing = true;

        var remainingTime = player.duration - player.currentTime;

        if (lastCurTime == 0 || player.currentTime - lastCurTime > 5) {
            //log('timeupdate() duration: ' + player.duration
            //    + ', currentTime: ' + player.currentTime
            //    + ', remainingTime: ' + remainingTime);

            if (inited && playInited) {
                lastCurTime = player.currentTime;
            }
        }
    });
    player.addEventListener('ended', function() {
        playing = false;

        setLastCurTime(path, 0);

        var remainingTime = player.duration - player.currentTime;

        log('ended() duration: ' + player.duration
            + ', currentTime: ' + player.currentTime
            + ', remainingTime: ' + remainingTime);

        duration = player.duration;
        lastCurTime = player.currentTime;
        inited = false;
        playInited = false;

        //if (++replayCount < 30) {
        //    playUrl(url);
        //}
    });
    player.addEventListener('error', function() {
        log('error() ' + player.error);

        //if (isLiveMode || ++replayCount < 30) {
        //    setTimeout(function () {
        //        if (url.indexOf('82ucc') == -1) {
        //            playUrl(url);
        //        } else {
        //            //setLastCurTime(path, player.currentTime);
        //            window.location.reload(true);
        //        }
        //    }, 1000);
        //}
    }, false);

    playUrl(url);
    //player.play();
}

function initHlsPlayer(id, url) {
    if (initKantvClient(url)) {
        return;
    }

    if (!Hls.isSupported()) {
        // TODO
        alert('HLS not supported');
        return;
    }

    var player = document.getElementById(id);
    var hls = new Hls();

    hls.loadSource(url);
    hls.attachMedia(player);

    hls.on(Hls.Events.MANIFEST_PARSED,function() {
        player.play();
    });
}

function initVideoJSPlayer(id, url, isM3U8, isRTMP) {
    if (initKantvClient(url)) {
        return;
    }

    var techOrder = ['html5', 'flash'];
    var source = {
        src: url
    };

    if (isRTMP) {
        techOrder = ['flash'];
        source.type = 'rtmp/mp4';
    } else if (isM3U8) {
        source.type = 'application/x-mpegURL';
    } else {
        source.type = 'video/mp4';
    }

    var vplayer = document.getElementById(id);
    var player = window.player = window.videojs(id, {
        techOrder: techOrder
        //techOrder: ['html5', 'flash']
        //techOrder: ['html5']
        //techOrder: ['flash', 'html5']
        //techOrder: ['flash']
    });
    var duration = -1, lastCurTime = 0;
    var replayCount = 0;

    player.on('loadedmetadata', function() {
        console.log('loadedmetadata() duration: ' + player.duration());

        if (duration >= player.duration()) {
            player.currentTime(duration);
            player.pause();
        } else {
            player.currentTime(lastCurTime);
        }
    });
    player.on('timeupdate', function() {
        if (lastCurTime == 0 || player.currentTime() - lastCurTime > 5) {
            console.log('timeupdate() duration: ' + player.duration()
                + ', currentTime: ' + player.currentTime()
                + ', remainingTime: ' + player.remainingTime());
            lastCurTime = player.currentTime();
        }
    });
    player.on('ended', function() {
        console.log('ended() duration: ' + player.duration()
            + ', currentTime: ' + player.currentTime()
            + ', remainingTime: ' + player.remainingTime());

        duration = player.duration();
        lastCurTime = player.currentTime();

        if (++replayCount < 30) {
            player.src(source);
        }
    });
    player.on('error', function() {
        console.log('error() ' + player.error());
        if (++replayCount < 30) {
            setTimeout(function () {
                player.src(source);
            }, 1000);
        }
    });
    var toggleFullScreen = function(player, toggleMode) {
        if (toggleMode
            && !document.fullscreenElement
            && !document.mozFullScreenElement
            && !document.webkitFullscreenElement
            && !document.msFullscreenElement)
        {
            if (player.requestFullscreen) {
                player.requestFullscreen();
            } else if (player.msRequestFullscreen) {
                player.msRequestFullscreen();
            } else if (player.mozRequestFullScreen) {
                player.mozRequestFullScreen();
            } else if (player.webkitRequestFullscreen) {
                player.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };
    vplayer.addEventListener('keydown', function(ev) {
        var key = ev.which;
        if (key == 37) { // left
            player.currentTime(Math.max(player.currentTime() - 5, 0));
        } else if (key == 39) { // right
            player.currentTime(Math.min(player.currentTime() + 5,
                player.duration()));
        } else if (key == 38) { // up
        } else if (key == 40) { // down
        } else if (key == 32) { // space
        } else if (key == 70) { // F
            toggleFullScreen(vplayer, true);
        } else if (key == 70) {
        } else {
            console.log('ev.key: ' + key);
        }
    });

    player.src(source);
    //player.play();
}

var flashPlayer = false;
var flashPlayerRtmpUrl = false;
var flashPlayerUrl = false;
var flashPlayerCount = 0;

function reloadFlashPlayer() {
    //flashPlayer.pause();
    flashPlayer.stop2();

    getRTMPUrl(flashPlayerUrl, function(rtmpUrl) {
        flashPlayerRtmpUrl = rtmpUrl;
        flashPlayer.setMediaResourceURL(flashPlayerRtmpUrl);
    });
}

function onFlashJsBridge(playerId, event, data) {
    switch (event) {

    case 'onJavaScriptBridgeCreated':
        flashPlayer = document.getElementById(playerId);
        flashPlayer.addEventListener('mediaError', 'onFlashMediaError');
        log(event + ', ' + data);
        break;

    case 'timeChange':
        if (isNaN(data.currentTime)) {
            if (flashPlayerCount == 0) {
                log('-----------------------');
            }

            log(event + ', ' + data);

            if (flashPlayerCount++ > 4) {
                flashPlayerCount = 0;
                reloadFlashPlayer();
            }
        } else {
            flashPlayerCount = 0;
        }
        break;

    case 'durationChange':
    case 'volumeChange':
    case 'playing':
    case 'buffering':
        //log(event + ', ' + data);
        break;

    case 'complete':
        log('-----------------------');
        log(event + ', ' + data);
        reloadFlashPlayer();
        break;

    case 'advertisement':
        log(event + ', ' + data);
        break;

    default:
        log(event + ', ' + data);
        break;
    }
}

function onFlashMediaError() {
    log(arguments.callee.name + ', ' + arguments);
    reloadFlashPlayer();
}

function initFlashRtmpPlayer(id, rtmpUrl, url) {
    if (initKantvClient(rtmpUrl, url)) {
        return;
    }

    flashPlayerRtmpUrl = rtmpUrl;
    flashPlayerUrl = url;

    var flashvars = {
        autoPlay: false,
        src: escape(rtmpUrl),
        streamType: 'live',
        scaleMode: 'letterbox',
        javascriptCallbackFunction: 'onFlashJsBridge'
    };
    var params = {
        allowFullScreen: true,
        allowScriptAccess: 'always',
        wmode: 'opaque'
    };
    var attrs = {
        id: id,
        name: id
    };

    // 854, 480
    // 640, 480
    swfobject.embedSWF('/plug/flash/GrindPlayer.swf', id, '99%', '99%',
        '10.2', null, flashvars, params, attrs);
}

function initFlashHlsPlayer(id, url) {
    if (initKantvClient(url)) {
        return;
    }

    if (url.indexOf('.m3u8') == -1) {
        url += '#.m3u8';
    }

    var flashvars = {
        autoPlay: false,
        src: escape(url),
        scaleMode: 'letterbox',
        plugin_hls: '/plug/flash/flashlsOSMF.swf',
        hls_debug: false,
        hls_debug2: false,
        hls_minbufferlength: -1,
        hls_lowbufferlength: 2,
        hls_maxbufferlength: 60,
        hls_startfromlowestlevel: false,
        hls_seekfromlowestlevel: false,
        hls_live_flushurlcache: false,
        hls_seekmode: 'ACCURATE',
        hls_capleveltostage: false,
        hls_maxlevelcappingmode: 'downscale'
    };
    var params = {
        allowFullScreen: true,
        allowScriptAccess: 'always',
        wmode: 'opaque'
    };
    var attrs = {
        id: id,
    };

    // 854, 480
    // 640, 480
    swfobject.embedSWF('/plug/flash/GrindPlayer.swf', id, '99%', '99%',
        '10.2', null, flashvars, params, attrs);
}

var ckplayerId = false;

function initCKPlayer(id, url) {
    ckplayerId = 'ckplayer_' + id;

    var flashVars = {
        f: '/plug/ckplayer/m3u8.swf',
        a: url,
        c: 0,
        p: 1,
        s: 4,
        lv: 0,
        v: 100,
        b: 1,
        loaded: 'initCKPlayerHandlers'
    };
    var video = [url];
    var params = {
        bgcolor: '#FFF',
        allowFullScreen: true,
        allowScriptAccess: 'always',
        wmode: 'transparent'
    };

    CKobject.embed('/plug/ckplayer/ckplayer.swf', id, ckplayerId,
        '100%', '100%', false, flashVars, video, params);
}

function initCKPlayerHandlers() {
    console.log('initCKPlayerHandlers() start');

    //var player = document.getElementById(ckplayerId);
    //var player = CKobject.getObjectById(ckplayerId);
    //console.log(player);
    //if (!player) {
    //    console.log('CKobject.getObjectById() return null');
    //    return;
    //}

    //player.addEventListener('play', ckplayerPlayHandler);
    //player.addEventListener('time', ckplayerTimeHandler);
    CKobject.getObjectById(ckplayerId).addEventListener('play', ckplayerPlayHandler);
    //player.addListener('error', 'ckplayerErrorHandler');

    console.log('initCKPlayerHandlers() done');
}

function ckplayerPlayHandler() {
    console.log('ckplayerPlayHandler');
}

function ckplayerTimeHandler(t) {
    console.log('ckplayerTimeHandler() t:' + t);
}

function ckplayerErrorHandler() {
    console.log('ckplayerErrorHandler');
}