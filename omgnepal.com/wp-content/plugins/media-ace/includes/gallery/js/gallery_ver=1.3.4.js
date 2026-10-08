/* global document */
/* global jQuery */
/* global macegallery */

(function ($) {

    'use strict';

    var config = $.parseJSON(macegallery);
    var template = config.html;
    var sharesTemplate = config.shares;

    var Gallery = function($gallery) {
        var data = $gallery.attr('data-g1-gallery');
        var galleryId = $gallery.attr('id');
        var items = $.parseJSON(data);
        var galleryLength = 0;
        items.forEach(function(item) {
            if (item.type === 'image') {
                galleryLength++;
            }
        });
        var galleryTitle = $gallery.attr('data-g1-gallery-title');
        var ShareUrl = $gallery.attr('data-g1-share-shortlink');
        var currentIndex = 1;
        var prevIndex = 0;
        var nextIndex = 2;
        var isAdDisplayed = false;
        var isGalleryVisible = false;
        var currentSidebarCollectionOffset = 0;
        var maxSidebarCollectionOffset = Math.ceil((galleryLength - 9) / 3);
        var html = template;

        var init = function() {
            captureLightbox();
            bindEvents();
            var hash = window.location.hash;
            hash = hash.replace('#','');
            if( hash === galleryId ) {
                $gallery.trigger('click');
            }
        };

        var bindEvents = function() {
            $gallery.on('click', function(){
                var $appendedElements = $(html).appendTo("body");
                $appendedElements.append(buildStyle());
                $('.g1-gallery-thumbnail-1').addClass('g1-gallery-thumbnail-active');
                bindLightboxEvents($appendedElements);
                hideThumbnailsIfTooSmall();
                $('body').addClass('g1-gallery-visible');
                isGalleryVisible = true;
                switchToIndex(1, true);
            });
        };

        var bindLightboxEvents = function($appendedElements) {
            $( window ).resize(function() {
                hideThumbnailsIfTooSmall();
            });
            $('.g1-gallery-close-button').on('click', function(){
                $('body').removeClass('g1-gallery-visible');
                setTimeout(function() {
                    setSidebarThumbnailsOffset(0);
                    $appendedElements.remove();
                    currentSidebarCollectionOffset = 0;
                    isGalleryVisible = false;
                }, 375);
            });

            $('.g1-gallery-thumbs-button, .g1-gallery-back-to-slideshow').on('click', function(){
                $appendedElements.toggleClass('g1-gallery-thumbnails-mode');
            });
            $('.g1-gallery-thumbnail').on('click', function(){
                var index = $(this).attr('data-g1-gallery-index');
                switchToIndex(index);
            });

            $('.g1-gallery-previous-frame').on('click', function(){
                handlePrevFrame();
            });
            $('.g1-gallery-next-frame').on('click', function(){
                handleNextFrame();
            });

            $(document).keydown(function (e){
                if (isGalleryVisible) {
                    if(e.keyCode == 37){
                        handlePrevFrame();
                    }
                    if(e.keyCode == 39){
                        handleNextFrame();
                    }
                }
            });

            $('.g1-gallery-thumbnails-up').on('click', function(){
                if (currentSidebarCollectionOffset > 0) {
                    setSidebarThumbnailsOffset(currentSidebarCollectionOffset-1);
                }
            });
            $('.g1-gallery-thumbnails-down').on('click', function(){
                if (currentSidebarCollectionOffset < maxSidebarCollectionOffset) {
                    setSidebarThumbnailsOffset(currentSidebarCollectionOffset+1);
                }
            });
        };

        var hideThumbnailsIfTooSmall = function() {
            $('.g1-gallery-thumbnails').show();
            if($('.g1-gallery-thumbnails').height() < 200){
                $('.g1-gallery-thumbnails').hide();
            }
        };

        var handleNextFrame = function() {
            if (currentIndex === galleryLength){
                return;
            }
            if( !isAdDisplayed ){
                if (trySwitchingToAd(currentIndex+1)) {
                    return;
                }
            }
            switchToIndex(nextIndex);
        };

        var handlePrevFrame = function () {
            if (currentIndex === 1){
                return;
            }
            if( !isAdDisplayed ){
                if (trySwitchingToAd(currentIndex)) {
                    return;
                }
            }
            switchToIndex(prevIndex);
        };

        var switchToIndex = function(index, delay){
            $('.g1-gallery-frame-ad').removeClass('g1-gallery-frame-visible');
            $('.g1-gallery-wrapper').removeClass('g1-gallery-ad-mode');
            isAdDisplayed = false;
            index = parseInt(index, 10);
            $('.g1-gallery-frame-' + currentIndex).removeClass('g1-gallery-frame-visible');
            currentIndex= index;
            prevIndex = currentIndex - 1;
            nextIndex = currentIndex + 1;
            $('.g1-gallery-thumbnail').removeClass('g1-gallery-thumbnail-active');
            $('.g1-gallery-thumbnail-' + currentIndex).addClass('g1-gallery-thumbnail-active');
            $('.g1-gallery-frame-' + currentIndex).addClass('g1-gallery-frame-visible');
            $('.g1-gallery-wrapper').removeClass('g1-gallery-thumbnails-mode');
            $('.g1-gallery-numerator-current').html(currentIndex);

            var imageUrl = $('.g1-gallery-frame-visible').attr('data-g1-share-image');
            if (delay) {
                setTimeout(function() {
                    setupShares(imageUrl);
                }, 500);
            } else {
                setupShares(imageUrl);
            }

            // set up sidebar thumbs.
            var row = Math.ceil(currentIndex/3);
                var newOffset = row - 1;
                if (newOffset > maxSidebarCollectionOffset){
                    newOffset = maxSidebarCollectionOffset;
                }
                if (newOffset < 0 ){
                    newOffset = 0;
                }
                setSidebarThumbnailsOffset(newOffset);
        };

        var setupShares = function(imageUrl) {
            var shareHtml = sharesTemplate;
            shareHtml = shareHtml.replace(new RegExp(/mace_replace_shortlink/g), encodeURIComponent(ShareUrl));
            shareHtml = shareHtml.replace(new RegExp(/mace_replace_title/g), encodeURIComponent(galleryTitle));
            shareHtml = shareHtml.replace(new RegExp(/mace_replace_image_url/g), encodeURIComponent(imageUrl));
            shareHtml = shareHtml.replace(new RegExp(/mace_replace_noesc_shortlink/g), ShareUrl);
            shareHtml = shareHtml.replace(new RegExp(/mace_replace_noesc_title/g), galleryTitle);
            shareHtml = shareHtml.replace(new RegExp(/mace_replace_noesc_image_url/g), imageUrl);
            shareHtml = shareHtml.replace(new RegExp(/mace_replace_unique/g), Math.random().toString(36).substr(2, 16));
            $('.g1-gallery-shares').html('');
            $('.g1-gallery-shares').html(shareHtml);
            jQuery('body').trigger('maceGalleryItemChanged');

            $('.g1-gallery-share-twitter').on('click', function (e) {
                e.preventDefault();
                window.open($(this).attr('href'), 'Google', 'width=500,height=300');
            });
            $('.g1-gallery-share-pinterest').on('click', function (e) {
                e.preventDefault();
                window.open($(this).attr('href'), 'Google', 'width=700,height=670');
            });
        };

        var trySwitchingToAd = function(index) {
            if( $('.g1-gallery-frame-ad-' + index).length > 0) {
                $('.g1-gallery-frame-' + currentIndex).removeClass('g1-gallery-frame-visible');
                $('.g1-gallery-thumbnail').removeClass('g1-gallery-thumbnail-active');
                $('.g1-gallery-frame-ad-' + index).addClass('g1-gallery-frame-visible');
                $('.g1-gallery-wrapper').addClass('g1-gallery-ad-mode');
                isAdDisplayed = true;
                nextIndex = index;
                prevIndex = index - 1;
                return true;
            } else {
                return false;
            }
        };

        var setSidebarThumbnailsOffset = function(offset){
            $('.g1-gallery-sidebar .g1-gallery-thumbnail').css('top', offset * - 108);
            currentSidebarCollectionOffset = offset;
        };

        var captureLightbox = function() {
            var frames          = buildFrames();
            var thumbnails      = buildThumbnails('thumbnail');
            var thumbnails32    = buildThumbnails('3-2-thumbnail');
            var numerator       = buildNumerator();
            var title           = galleryTitle;
            html = html.replace( '{frames}', frames);
            html = html.replace( '{thumbnails}', thumbnails);
            html = html.replace( '{thumbnails32}', thumbnails32);
            html = html.replace( '{numerator}', numerator);
            html = html.replace( '{title}', title);
        };

        var buildStyle = function() {
            var out = '<style>';
            items.forEach( function(item) {
                if(item.type === 'image'){
                    out += '.g1-gallery-image-' + item.id + '{ background-image:url(' + item.full +'); }';
                }
            });
            return out;
        };

        var buildFrames = function() {
            var out = '';
            var index = 1;
            items.forEach( function(item) {
                if (item.type === 'image') {
                    out += '<div class="g1-gallery-frame g1-gallery-frame-' + index + '" data-g1-share-image="' + item.full + '">';
                    out += '<div class="g1-gallery-image g1-gallery-image-' + item.id + ' ">';
                    out += '<a class="g1-gallery-previous-frame"></a>';
                    out += '<a class="g1-gallery-next-frame"></a>';
                    out += '</div>';
                    out += '<div class="g1-gallery-image-title">' + item.title + '</div></div>'
                    index += 1;
                }
                if (item.type === 'ad') {
                    out += '<div class="g1-gallery-frame g1-gallery-frame-ad g1-gallery-frame-ad-' + index + '">';
                    out += '<div class="g1-gallery-ad">';
                    out += item.html;
                    out += '<a class="g1-gallery-previous-frame"></a>';
                    out += '<a class="g1-gallery-next-frame"></a>';
                    out += '</div></div>';
                }
            });
            return out;
        };

        var buildThumbnails = function(size) {
            var out = '';
            var index = 1;
            items.forEach( function(item) {
                if (item.type === 'image') {
                    out += '<div class="g1-gallery-thumbnail g1-gallery-thumbnail-' + index + '" data-g1-gallery-index="' + index + '">';
                    out += '<img src="' + item[size] + '">';
				    out += '</div>';
                    index += 1;
                }
            });
            return out;
        };

        var buildNumerator = function() {
            return '<span class="g1-gallery-numerator-current">1</span> ' + config.i18n.of + ' <span class="g1-gallery-numerator-max">' + galleryLength + '</span>';
        };

        return init();
    };

    // Fire.
    $(document).ready(function() {
        setupGalleries($('body'));
    });

    $('body').on('g1NewContentLoaded', function( e, $newContent ){
        setupGalleries($newContent);
    });

    var setupGalleries = function($scope) {
        $('.mace-gallery-teaser', $scope).each(function() {
            new Gallery($(this));
        });
    };

})(jQuery);
