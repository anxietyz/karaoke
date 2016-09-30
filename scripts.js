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
                    window.karaoke_words = {};
                    window.karaoke_current_index = -1;
                    window.karaoke = jQuery(data);

                    jQuery(data).find('word').each(function (index) {
                        var word = jQuery(this).text().trim();
                        var time = jQuery(this).attr('position');
                        var color = jQuery(this).attr('color');
                        window.karaoke_words[index] = {word :word, color: color, time: time};

                    });

                    $this.jPlayer("play");
                    startSong(delayTime());
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
                var $karaoke = window.karaoke;
                var currentTime = event.jPlayer.status.currentTime.toFixed(3);
                if ($karaoke !== null && window.karaoke_stimes) {
                    var md = parseInt(window.karaoke_stimes.length);
                    for (var i = 0; i < md; i++) {
                        (function(i){
                            console.log(window.flag);

                            if (currentTime >= window.karaoke_etimes[i-1] && currentTime <= window.karaoke_stimes[i]) {
                                window.flag = true;
                                jQuery('#karaoke_lyrics').html("");
                                $karaoke.find('karaoke > add').eq(i).find('entry').each(function(){
                                    var $layer = jQuery('<span></span>').text( jQuery(this).text() );
                                    var $text = jQuery('<span class="word"></span>').text( jQuery(this).text() ).append($layer);
                                    jQuery('#karaoke_lyrics').append($text);
                                });
                            } else if (currentTime >= window.karaoke_stimes[i] && currentTime <= window.karaoke_etimes[i] && window.flag) {
                                window.flag = false;
                                jQuery('#karaoke_lyrics').html("");
                                var sumDuration = 0;
                                $karaoke.find('karaoke > add').eq(i).find('entry').each(function(){
                                    var $layer = jQuery('<span></span>').text( jQuery(this).text() );
                                    var $text = jQuery('<span class="word"></span>').text( jQuery(this).text() ).append($layer);
                                    var duration = parseInt(jQuery(this).attr('duration'))/1000;
                                    $text.css({
                                        '-webkit-animation-duration': duration+"s",
                                        '-moz-animation-duration': duration+"s",
                                        '-ms-animation-duration': duration+"s",
                                        '-o-animation-duration': duration+"s",
                                        'animation-duration': duration+"s"
                                    });
                                    setTimeout(function(){$text.addClass('animate');}, sumDuration);
                                    sumDuration += duration*1000;
                                    jQuery('#karaoke_lyrics').append($text);
                                });
                            } else if (currentTime >= window.karaoke_etimes[i] && currentTime <= window.karaoke_stimes[i+1]) {
                                window.flag = true;
                                jQuery('#karaoke_lyrics').html("");
                                $karaoke.find('karaoke > add').eq(i+1).find('entry').each(function(){
                                    var $layer = jQuery('<span></span>').text( jQuery(this).text() );
                                    var $text = jQuery('<span class="word"></span>').text( jQuery(this).text() ).append($layer);
                                    jQuery('#karaoke_lyrics').append($text);
                                });
                            } else if (currentTime >= window.karaoke_etimes[i] && window.karaoke_stimes[i+1] === undefined) {
                                jQuery('#karaoke_lyrics').html("");
                            }
                        })(i);
                    }
                }
            }
        });
    })(jQuery);
}
