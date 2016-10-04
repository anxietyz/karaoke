jQuery(document).ready(function() {
    window.empty = jQuery('.jp-type-single')[0].outerHTML;

    // class "active" switcher
    var listOfLis = jQuery('.playlist-container .playlist-item');
    listOfLis.each(function(){
       jQuery(this).on("click",function(){
           listOfLis.filter('li.active').removeClass('active');
           jQuery(this).addClass('active');
       });
    });
});

// calculation of delay time for countdown screen saver
var arrayOfCountdown = ['GO',1,2,3];
function delayTime(){
    var time = (jQuery(karaoke).find('karaoke add:first-child').attr('startTime') - (arrayOfCountdown.length + 1)) * 1000;
    return Math.round(time);
}
// start screen saver with proper delay
function startSong(timeBefore){
    clearTimeout(window.timeoutForCountdown);
        window.timeoutForCountdown = setTimeout(function(){
        new Countdown(jQuery('#jplayer_player_1'));
    }, timeBefore);
}
// Object for countdown
function Countdown(parentNode){
    this.parentNode = parentNode;
    this.countdownData = arrayOfCountdown;
    this.background = jQuery('<div class="countdown-bg">');
    this.coundownNumbers = jQuery('<div class="wrapper-for-numbers"><span class="numbers"></span></div>');
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
    var num = jQuery('.numbers');
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
    jQuery(parentNode).find(jQuery(".countdown-bg")).remove();
    jQuery(parentNode).find(jQuery('.wrapper-for-numbers')).remove();
};

window.itoe = 0;
function itoe(i) {
    debugger
    if (window.itoe === i){
        return false;
    } else {
        return true;
    }
}

function run(title, jpg, poster, lyrics) {
    (function ($) {
        jQuery(".jp-type-single").replaceWith(window.empty);

        jQuery("#jplayer_player_1").jPlayer({
            ready: function (event) {
                window.flag = true;
                var self = this;
                var $this = jQuery(this);
                $this.jPlayer("setMedia", {
                    title: title,
                    mp3: jpg,
                    poster: poster
                });
                $this.append(jQuery('<div id="karaoke_lyrics" data-index="-1"><span class="word">jPlayer, HTML, CSS3 Karaoke</span></div>'));

                $.post($this.jPlayer("option", "lyrics"), {}, function (data) {
                    window.karaoke_text = [];
                    window.karaoke_current_index = -1;
                    window.karaoke = jQuery(data);

                    var maxSymbols = 16;
                    var karaoke_text_temp = [];
                    var currentAmountOfSymbols = null;

                    jQuery(data).find('word').each(function (index) {
                        var word = jQuery(this).text().trim();
                        currentAmountOfSymbols += word.length;
                        var startTime = parseFloat(jQuery(this).attr('position'));
                        var color = jQuery(this).attr('color');
                        var endTime = parseFloat(jQuery(karaoke.find('word')[index+1]).attr('position'));
                        if (isNaN(endTime)){var endTime = parseFloat(jQuery(karaoke.find('word')[index]).attr('position'))+0.5};
                        var duration = (endTime - startTime).toFixed(4);
                        karaoke_text_temp.push({word :word, color: color, startTime: startTime, endTime: endTime, duration: duration});
                        if (jQuery(this).attr('position') === jQuery(karaoke.find('word')[karaoke.find('word').length-1]).attr('position') || currentAmountOfSymbols > maxSymbols){
                            var tempAll = [];
                            var tempTimes = [];
                            var times = {};
                            times.arrayStart = parseFloat(karaoke_text_temp[0].startTime);
                            // debugger
                            times.arrayEnd = parseFloat(startTime) + 0.5;
                            tempTimes.push(times);
                            tempAll.push(times);
                            tempAll.push(karaoke_text_temp);
                            window.karaoke_text.push(tempAll);
                            karaoke_text_temp = [];
                            currentAmountOfSymbols = 0;
                        }
                    });
                    $this.jPlayer("play");
                    // startSong(delayTime());

                    // var jp = jQuery('#jplayer_player_1');
                    // var jpData = jp.data('jPlayer');
                    // console.log('adf',jpData.status.currentTime);
                    window.itoe = 0;
                    setTimeout(function () {
                        jQuery('#karaoke_lyrics').html(jQuery(data).find('details singer').text() + ' - ' + jQuery(data).find('details name').text());
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
                var karaoke = window.karaoke_text;
                var currentTime = parseFloat(event.jPlayer.status.currentTime.toFixed(3));
                // console.log(currentTime);
                if (karaoke !== null && window.karaoke_text) {
                    var size = karaoke.length;
                    for (var i = 0; i < size; i++) {
                        (function(i){
                            // debugger
                            if (karaoke[i-1] !== undefined && currentTime >= karaoke[i-1][0].arrayEnd && currentTime <= karaoke[i][0].arrayStart) {
                                // jQuery('#karaoke_lyrics').html("");
                                // jQuery(karaoke[i]).each(function(){
                                //     var $layer = jQuery('<span></span>').text(this.word);
                                //     var $text = jQuery('<span class="word"></span>').text(this.word).append($layer);
                                //     jQuery('#karaoke_lyrics').append($text);
                                // });
                            } else if (currentTime >= karaoke[i][0].arrayStart && currentTime <= karaoke[i][0].arrayEnd && window.itoe === i) {
                                window.itoe = i+1 ;
                                jQuery('#karaoke_lyrics').html("");
                                var sumDuration = 0;
                                jQuery(karaoke[i][1]).each(function(index) {
                                    var $layer = jQuery('<span></span>').text(this.word);
                                    var $text = jQuery('<span class="word"></span>').text(this.word).append($layer);
                                    // debugger
                                    var duration = this.duration;
                                    $layer.css({
                                        "-webkit-transition-duration": duration + "s",
                                        "-moz-transition-duration": duration + "s",
                                        "-ms-transition-duration": duration + "s",
                                        "-o-transition-duration": duration + "s",
                                        "transition-duration": duration + "s",
                                        "color": this.color
                                    });
                                    setTimeout(function () {
                                        $layer.addClass('animate');
                                    }, sumDuration);
                                    sumDuration += duration * 1000;
                                    jQuery('#karaoke_lyrics').append($text);
                                });
                            }
                        })(i);
                    }
                }
            }
        });
    })(jQuery);
}
