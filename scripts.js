$(document).ready(function() {
    window.empty = $('.jp-type-single')[0].outerHTML;

    // class "active" switcher
    var listOfLis = $('.playlist-container .playlist-item');
    listOfLis.each(function(){
       $(this).on("click",function(){
           listOfLis.filter('li.active').removeClass('active');
           $(this).addClass('active');
       });
    });




});

// calculation of delay time minus 6 seconds for countdown screen saver
function delayTime(){
    var time = ($(karaoke).find('karaoke add:first-child').attr('startTime') - 6) * 1000;
    return Math.round(time);
}
// start screen saver with proper delay
function startSong(timeBefore){
    clearTimeout(window.timeoutForCountdown);
        window.timeoutForCountdown = setTimeout(function(){
        new Countdown($('#jplayer_player_1'));
    }, timeBefore);
}
// Object for countdown
function Countdown(parentNode){
    this.parentNode = parentNode;
    this.countdownData = ['GO',1,2,3,4];
    this.background = $('<div class="countdown-bg">');
    this.coundownNumbers = $('<div class="wrapper-for-numbers"><span class="numbers"></span></div>');
    this.interval = null;
    this.timeout = null;
    this._buildHTML(this.parentNode);
    this._numbersIterate();
}
Countdown.prototype._buildHTML = function (parentNode) {
    parentNode.append(this.background);
    parentNode.append(this.coundownNumbers);
};
Countdown.prototype._numbersIterate = function () {
    var _this = this;
    var num = $('.numbers');
    this.interval = setInterval(function(){
        if (_this.countdownData.length === 0){
            _this._destroyHTML(_this.parentNode);
            clearInterval(_this.interval);
        }
        num.removeClass('show-number');
        num.text(_this.countdownData.pop());
        setTimeout(function () {
            num.addClass('show-number');
        },20);
    }, 1000);
};
Countdown.prototype._destroyHTML = function (parentNode){
    $(parentNode).find($(".countdown-bg")).remove();
    $(parentNode).find($('.wrapper-for-numbers')).remove();
};

function run(title, jpg, poster, lyrics) {
    (function ($) {
        $(".jp-type-single").replaceWith(window.empty);

        $("#jplayer_player_1").jPlayer({
            ready: function (event) {
                var self = this;
                var $this = $(this);
                $this.jPlayer("setMedia", {
                    title: title,
                    mp3: jpg,
                    poster: poster
                });
                $this.append($('<div id="karaoke_lyrics" data-index="-1"><span class="word">jPlayer, HTML, CSS3 Karaoke</span></div>'));

                $.post($this.jPlayer("option", "lyrics"), {}, function (data) {
                    window.karaoke_stimes = [];
                    window.karaoke_etimes = [];
                    window.karaoke_current_index = -1;
                    window.karaoke = $(data);


                    $(data).find('karaoke > add').each(function (index) {
                        var st = $(this).attr('startTime');
                        var et = $(this).attr('endTime');

                        var sts = st.split(':');
                        st = parseFloat(sts[0], 10) * 60 * 60 + parseFloat(sts[1], 10) * 60 + parseFloat(sts[2]);
                        $(this).attr('startTime', st);
                        window.karaoke_stimes.push(st);

                        var ets = et.split(':');
                        et = parseFloat(ets[0], 10) * 60 * 60 + parseFloat(ets[1], 10) * 60 + parseFloat(ets[2]);
                        $(this).attr('endTime', et);
                        window.karaoke_etimes.push(et);
                    });

                    $this.jPlayer("play");
                    startSong(delayTime());
                    setTimeout(function () {
                        $('#karaoke_lyrics').html($(data).find('details singer').text() + ' - ' + $(data).find('details name').text());
                    }, 3000);
                });
            },
            lyrics: lyrics,
            swfPath: "jplayer/",
            supplied: "mp3",
            size: {
                width: "570px",
                height: "340px",
                cssClass: "jp-video-360p"
            },
            useStateClassSkin: true,
            autoBlur: false,
            smoothPlayBar: true,
            keyEnabled: true,
            remainingDuration: true,
            toggleDuration: true,
            timeupdate: function (event) {
                var $karaoke = window.karaoke;
                var currentTime = event.jPlayer.status.currentTime;
                if ($karaoke !== null && window.karaoke_stimes) {
                    var md = parseInt(window.karaoke_stimes.length / 2);
                    var si = 0;
                    if (currentTime > window.karaoke_stimes[md]) {
                        si = md;
                        md = window.karaoke_stimes.length;
                    }
                    else {
                        si = 0;
                        md = md + 1;
                    }

                    for (var i = si; i < md; i++) {
                        if (currentTime >= window.karaoke_stimes[i] && currentTime <= window.karaoke_etimes[i] && i > window.karaoke_current_index) {
                            $('#karaoke_lyrics').html("");
                            var sumDuration = 0;
                            $karaoke.find('karaoke > add').eq(i).find('entry').each(function () {
                                var $layer = $('<span></span>').text($(this).text());
                                var $text = $('<span class="word"></span>').text($(this).text()).append($layer);
                                var duration = parseInt($(this).attr('duration')) / 1000;
                                $text.css({
                                    '-webkit-animation-duration': duration + "s",
                                    '-moz-animation-duration': duration + "s",
                                    '-ms-animation-duration': duration + "s",
                                    '-o-animation-duration': duration + "s",
                                    'animation-duration': duration + "s"
                                });
                                setTimeout(function () {
                                    $text.addClass('animate');
                                }, sumDuration);
                                sumDuration += duration * 1000;
                                $('#karaoke_lyrics').append($text);
                            });
                            window.karaoke_current_index = i;
                        }
                    }

                }
            }
        });
    })(jQuery);
}
