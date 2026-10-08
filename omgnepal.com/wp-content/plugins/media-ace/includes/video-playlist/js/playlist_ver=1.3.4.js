/* global document */
/* global jQuery */

(function ($) {

    'use strict';

    var VideoPlaylist = function($playlist) {
        var $items;
        var itemsConfig;
        var currentIndex;
        var all;
        var player;
        var loop;
        var shuffle;

        var init = function() {
            $items      = $playlist.find('.mace-video-item');
            all         = $items.length;
            loop        = false;
            shuffle     = false;

            itemsConfig = [];
            $items.each(function(index) {
                itemsConfig.push($(this).data('mace-video-config'));
            });

            setCurrent(0);

            loadPlayer(function(instance) {
                player = instance;

                bindEvents();
            });
        };

        var bindEvents = function() {
            // Play selection.
            $items.on('click', function() {
                play($(this).index());
            });

            // Play prev.
            $playlist.on('click', '.mace-video-prev', function() {
                playPrev();
            });

            // Play next.
            $playlist.on('click', '.mace-video-next', function() {
                playNext();
            });

            // Loop.
            $playlist.on('click', '.mace-video-loop', function() {
                var $link = $(this);

                // Toggle.
                loop = !loop;

                loop ? $link.addClass('mace-selected') : $link.removeClass('mace-selected');
            });

            // Shuffle.
            $playlist.on('click', '.mace-video-shuffle', function() {
                var $link = $(this);

                // Toggle.
                shuffle = !shuffle;

                shuffle ? $link.addClass('mace-selected') : $link.removeClass('mace-selected');
            });

            // Play next on ended.
            player.media.addEventListener('ended', function() {
                // Chrome throws an exception when play is not triggered by a user.
                // Googe Autoplay Policy: https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
                // Vimeo Autoplay restrictions: https://help.vimeo.com/hc/en-us/articles/115004485728-Autoplaying-and-looping-embedded-videos
                try {
                    playNext(true);
                } catch(err) {}
            });
        };

        var setCurrent = function(index) {
            currentIndex = index;

            $items.removeClass('mace-video-current');
            $items.eq(currentIndex).addClass('mace-video-current');
        };

        var loadPlayer = function(callback) {
            var $player = $playlist.find('.mace-video-player');

            $player.mediaelementplayer({
                stretching: 'responsive',
                success: function(mediaElement, originalNode, instance) {
                    callback(instance);
                }
            });
        };

        var play = function(index) {
            setCurrent(index);

            var config = $items.eq(index).data('mace-video-config');

            player.setSrc(config.url);
            player.setPoster(config.poster);
            player.setCurrentTime(0);

            player.load();
            player.play();
        };

        var playPrev = function() {
            var prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : all - 1;

            play(prevIndex);
        };

        /**
         * @param boolean auto  Whether function was called automatically (not by user interaction).
         */
        var playNext = function(auto) {
            // Stop playing if loop disabled and we are on last item.
            if (auto && !loop) {
                if (currentIndex + 1 >= all) {
                    return;
                }
            }

            // Shuffle.
            if (auto && shuffle) {
                var nextIndex = getShuffledIndex();
            // Get next index in order.
            } else {
                var nextIndex = (currentIndex + 1) % all;
            }

            play(nextIndex);
        };

        var getShuffledIndex = function() {
            var indexes = [];

            // Array of all index, besides current video.
            for (var i = 0; i < all; i++) {
                if (currentIndex !== i) {
                    indexes.push(i);
                }
            }

            // Shuffle array.
            indexes = shuffleArr(indexes);

            // Get first index from the list.
            return indexes[0];
        };

        /**
         * Shuffles array in place (the modern version of the Fisher–Yates shuffle algorithm).
         *
         * @param {Array} arr items An array containing the items.
         */
        var shuffleArr = function(arr) {
            var j, x, i;
            for (i = arr.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = arr[i];
                arr[i] = arr[j];
                arr[j] = x;
            }
            return arr;
        };

        return init();
    };

    // Fire.
    $(document).ready(function() {
        $('.mace-video-playlist').each(function() {
            new VideoPlaylist($(this));
        });
    });

})(jQuery);
