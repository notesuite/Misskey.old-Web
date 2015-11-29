(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
  var x$;
  x$ = window.STATUS_CORE = {};
  x$.setEvent = function($status){
    var x$;
    function checkFavorited(){
      return $status.attr('data-is-favorited') === 'true';
    }
    function checkReposted(){
      return $status.attr('data-is-reposted') === 'true';
    }
    function checkPinned(){
      return $status.attr('data-is-pinned') === 'true';
    }
    function initUserProfilePopup($trigger, widgetUrl){
      return $trigger.hover(function(){
        clearTimeout($trigger.userProfileShowTimer);
        clearTimeout($trigger.userProfileHideTimer);
        if (!$trigger.parent().children('.user-profile-popup')[0]) {
          return $trigger.userProfileShowTimer = setTimeout(function(){
            var $popup;
            $popup = $('<iframe class="user-profile-popup">').attr({
              src: widgetUrl,
              seamless: true
            });
            $popup.css({
              top: 0,
              left: $trigger.outerWidth() + 16
            });
            $popup.hover(function(){
              return clearTimeout($trigger.userProfileHideTimer);
            }, function(){
              clearTimeout($trigger.userProfileShowTimer);
              return $trigger.userProfileHideTimer = setTimeout(function(){
                return $trigger.parent().children('.user-profile-popup').remove();
              }, 500);
            });
            return $trigger.parent().append($popup);
          }, 500);
        }
      }, function(){
        clearTimeout($trigger.userProfileShowTimer);
        clearTimeout($trigger.userProfileHideTimer);
        return $trigger.userProfileHideTimer = setTimeout(function(){
          return $trigger.parent().children('.user-profile-popup').remove();
        }, 500);
      });
    }
    initUserProfilePopup($status.find('article > .main > .main > .header > .avatar-area > .avatar-anchor'), $status.attr('data-user-profile-widget-url'));
    initUserProfilePopup($status.find('article > .main > .reply-source-and-more-talks > .reply-source > article > .main > .avatar-area > .avatar-anchor'), $status.find('article > .main > .reply-source-and-more-talks > .reply-source').attr('data-user-profile-widget-url'));
    x$ = $status;
    x$.find('.main .attached-images > .images > .image').each(function(){
      var $image, $img, $button, $back;
      $image = $(this);
      $img = $image.find('img');
      $button = $image.find('button');
      $back = $image.find('.background');
      $img.click(function(){
        if ($image.attr('data-is-expanded') === 'true') {
          $image.attr('data-is-expanded', 'false');
          return $back.animate({
            opacity: 0
          }, 100, 'linear', function(){
            return $back.css('display', 'none');
          });
        }
      });
      $back.click(function(){
        if ($image.attr('data-is-expanded') === 'true') {
          $image.attr('data-is-expanded', 'false');
          return $back.animate({
            opacity: 0
          }, 100, 'linear', function(){
            return $back.css('display', 'none');
          });
        }
      });
      return $button.click(function(){
        if ($image.attr('data-is-expanded') === 'true') {
          $image.attr('data-is-expanded', 'false');
          return $back.animate({
            opacity: 0
          }, 100, 'linear', function(){
            return $back.css('display', 'none');
          });
        } else {
          $image.attr('data-is-expanded', 'true');
          $back.css('display', 'block');
          return $back.animate({
            opacity: 1
          }, 100, 'linear');
        }
      });
    });
    x$.find('> article > .main > .replies > .statuses > .status').each(function(){
      var $reply;
      $reply = $(this);
      initUserProfilePopup($reply.find('> article > .main > .avatar-area > .avatar-anchor'), $reply.attr('data-user-profile-widget-url'));
      return $reply.find('> article > .replies > .statuses > .status').each(function(){
        var $replyInReply;
        $replyInReply = $(this);
        return initUserProfilePopup($replyInReply.find('> article > .main > .avatar-area > .avatar-anchor'), $replyInReply.attr('data-user-profile-widget-url'));
      });
    });
    x$.find('.main .stargazers-and-reposters > .stargazers > .stargazers > .stargazer > a').each(function(){
      var $stargazer, $tooltip;
      $stargazer = $(this);
      $tooltip = $('<p class="ui-tooltip">').text($stargazer.attr('data-tooltip'));
      return $stargazer.hover(function(){
        $tooltip.css('bottom', $stargazer.outerHeight() + 4);
        $stargazer.append($tooltip);
        return $stargazer.find('.ui-tooltip').css('left', $stargazer.outerWidth() / 2 - $tooltip.outerWidth() / 2);
      }, function(){
        return $stargazer.find('.ui-tooltip').remove();
      });
    });
    x$.find('.main .stargazers-and-reposters > .reposters > .reposters > .reposter > a').each(function(){
      var $reposter, $tooltip;
      $reposter = $(this);
      $tooltip = $('<p class="ui-tooltip">').text($reposter.attr('data-tooltip'));
      return $reposter.hover(function(){
        $tooltip.css('bottom', $reposter.outerHeight() + 4);
        $reposter.append($tooltip);
        return $reposter.find('.ui-tooltip').css('left', $reposter.outerWidth() / 2 - $tooltip.outerWidth() / 2);
      }, function(){
        return $reposter.find('.ui-tooltip').remove();
      });
    });
    x$.find('.reply-form textarea').bind('input', function(){
      return $status.find('.reply-form .submit-button').attr('disabled', false);
    });
    x$.find('.reply-form').submit(function(event){
      var $form, x$, $submitButton;
      event.preventDefault();
      $form = $(this);
      x$ = $submitButton = $form.find('.submit-button');
      x$.attr('disabled', true);
      x$.attr('value', 'Replying...');
      return $.ajax(config.webApiUrl + "/web/status/reply-detail-one.plain", {
        type: 'post',
        data: new FormData($form[0]),
        processData: false,
        contentType: false,
        dataType: 'text',
        xhrFields: {
          withCredentials: true
        }
      }).done(function(html){
        var $reply;
        $reply = $(html);
        $submitButton.attr('disabled', false);
        $reply.prependTo($status.find('> article > .main > .replies > .statuses'));
        initUserProfilePopup($reply.find('article > .avatar-area > .avatar-anchor'), $reply.attr('data-user-profile-widget-url'));
        $form.remove();
        return window.displayMessage('返信しました！');
      }).fail(function(){
        $submitButton.attr('disabled', false);
        $submitButton.attr('value', '&#xf112; Reply');
        return window.displayMessage('返信に失敗しました。再度お試しください。');
      });
    });
    x$.find('.image-attacher input[name=image]').change(function(){
      var $input, file, x$, reader;
      $input = $(this);
      $input.parents('.reply-form').find('.image-preview-container').css('display', 'block');
      $status.find('.reply-form .submit-button').attr('disabled', false);
      file = $input.prop('files')[0];
      if (file.type.match('image.*')) {
        x$ = reader = new FileReader();
        x$.onload = function(){
          var $img;
          $img = $('<img>').attr('src', reader.result);
          $input.parents('.reply-form').find('.image-preview').find('img').remove();
          return $input.parents('.reply-form').find('.image-preview').append($img);
        };
        x$.readAsDataURL(file);
        return x$;
      }
    });
    x$.find('article > .main > .read-talk').click(function(){
      var x$, $button;
      x$ = $button = $(this);
      x$.attr('disabled', true);
      x$.attr('title', '読み込み中...');
      x$.find('i').attr('class', 'fa fa-spinner fa-pulse');
      return $.ajax(config.webApiUrl + '/web/status/get-talk-detail-one-html.plain', {
        type: 'get',
        data: {
          'status-id': $status.find('article > .main > .reply-source-and-more-talks > .reply-source').attr('data-id')
        },
        dataType: 'text',
        xhrFields: {
          withCredentials: true
        }
      }).done(function(data){
        var $statuses;
        $button.remove();
        $statuses = $(data);
        return $statuses.each(function(){
          var $talkStatus;
          $talkStatus = $(this);
          initUserProfilePopup($talkStatus.find('article > .main > .avatar-area > .avatar-anchor'), $talkStatus.attr('data-user-profile-widget-url'));
          return $talkStatus.appendTo($status.find('article > .main > .reply-source-and-more-talks > .talk > .statuses'));
        });
      }).fail(function(data){
        var x$, $button;
        x$ = $button = $(this);
        x$.attr('disabled', false);
        x$.attr('title', '会話をもっと読む');
        x$.find('i').attr('class', 'fa fa-ellipsis-v');
        return window.displayMessage('読み込みに失敗しました。再度お試しください。');
      });
    });
    x$.find('article > .main > .main > .footer > .actions > .pin > .pin-button').click(function(){
      var x$, $button;
      x$ = $button = $(this);
      x$.attr('disabled', true);
      if (checkPinned()) {
        $status.attr('data-is-pinned', 'false');
        return $.ajax(config.webApiUrl + "/account/delete-pinned-status", {
          type: 'delete',
          data: {},
          dataType: 'json',
          xhrFields: {
            withCredentials: true
          }
        }).done(function(){
          return $button.attr('disabled', false);
        }).fail(function(){
          $button.attr('disabled', false);
          return $status.attr('data-is-pinned', 'true');
        });
      } else {
        $status.attr('data-is-pinned', 'true');
        return $.ajax(config.webApiUrl + "/account/update-pinned-status", {
          type: 'put',
          data: {
            'status-id': $status.attr('data-id')
          },
          dataType: 'json',
          xhrFields: {
            withCredentials: true
          }
        }).done(function(){
          return $button.attr('disabled', false);
        }).fail(function(){
          $button.attr('disabled', false);
          return $status.attr('data-is-pinned', 'false');
        });
      }
    });
    x$.find('article > .main > .main > .footer > .actions > .favorite > .favorite-button').click(function(){
      var x$, $button;
      x$ = $button = $(this);
      x$.attr('disabled', true);
      if (checkFavorited()) {
        $status.attr('data-is-favorited', 'false');
        return $.ajax(config.webApiUrl + "/status/unfavorite", {
          type: 'delete',
          data: {
            'status-id': $status.attr('data-id')
          },
          dataType: 'json',
          xhrFields: {
            withCredentials: true
          }
        }).done(function(){
          return $button.attr('disabled', false);
        }).fail(function(){
          $button.attr('disabled', false);
          return $status.attr('data-is-favorited', 'true');
        });
      } else {
        $status.attr('data-is-favorited', 'true');
        return $.ajax(config.webApiUrl + "/status/favorite", {
          type: 'post',
          data: {
            'status-id': $status.attr('data-id')
          },
          dataType: 'json',
          xhrFields: {
            withCredentials: true
          }
        }).done(function(){
          return $button.attr('disabled', false);
        }).fail(function(){
          $button.attr('disabled', false);
          return $status.attr('data-is-favorited', 'false');
        });
      }
    });
    x$.find('article > .main > .main > .footer > .actions > .reply > .reply-button').click(function(){
      return console.log('something');
    });
    x$.find('article > .main > .main > .footer > .actions > .repost > .repost-button').click(function(){
      if (checkReposted()) {
        $status.attr('data-is-reposted', 'false');
        return $.ajax(config.webApiUrl + "/status/unrepost", {
          type: 'delete',
          data: {
            'status-id': $status.attr('data-id')
          },
          dataType: 'json',
          xhrFields: {
            withCredentials: true
          }
        }).done(function(){
          return $button.attr('disabled', false);
        }).fail(function(){
          $button.attr('disabled', false);
          return $status.attr('data-is-reposted', 'true');
        });
      } else {
        $status.find('.repost-form .background').css('display', 'block');
        $status.find('.repost-form .background').animate({
          opacity: 1
        }, 100, 'linear');
        $status.find('.repost-form .form').css('display', 'block');
        return $status.find('.repost-form .form').animate({
          opacity: 1
        }, 100, 'linear');
      }
    });
    x$.find('.repost-form > .form').submit(function(event){
      var $form, x$, $submitButton;
      event.preventDefault();
      $form = $(this);
      x$ = $submitButton = $form.find('.accept');
      x$.attr('disabled', true);
      x$.attr('data-reposting', 'true');
      $status.attr('data-is-reposted', 'true');
      return $.ajax(config.webApiUrl + "/status/repost", {
        type: 'post',
        data: {
          'status-id': $status.attr('data-id'),
          text: $status.find('.repost-form > form > .comment-form > input[name=text]').val()
        },
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        }
      }).done(function(){
        var x$;
        x$ = $submitButton;
        x$.attr('disabled', false);
        x$.attr('data-reposting', 'false');
        window.displayMessage('Reposted!');
        $status.find('.repost-form .background').animate({
          opacity: 0
        }, 100, 'linear', function(){
          return $status.find('.repost-form .background').css('display', 'none');
        });
        return $status.find('.repost-form .form').animate({
          opacity: 0
        }, 100, 'linear', function(){
          return $status.find('.repost-form .form').css('display', 'none');
        });
      }).fail(function(){
        var x$;
        x$ = $submitButton;
        x$.attr('disabled', false);
        x$.attr('data-reposting', 'false');
        $status.attr('data-is-reposted', 'false');
        return window.displayMessage('Repostに失敗しました。再度お試しください。');
      });
    });
    x$.find('.repost-form > .form > .actions > .cancel').click(function(){
      $status.find('.repost-form .background').animate({
        opacity: 0
      }, 100, 'linear', function(){
        return $status.find('.repost-form .background').css('display', 'none');
      });
      return $status.find('.repost-form .form').animate({
        opacity: 0
      }, 100, 'linear', function(){
        return $status.find('.repost-form .form').css('display', 'none');
      });
    });
    x$.find('.repost-form .background').click(function(){
      $status.find('.repost-form .background').animate({
        opacity: 0
      }, 100, 'linear', function(){
        return $status.find('.repost-form .background').css('display', 'none');
      });
      return $status.find('.repost-form .form').animate({
        opacity: 0
      }, 100, 'linear', function(){
        return $status.find('.repost-form .form').css('display', 'none');
      });
    });
    return x$;
  };
}).call(this);

},{}]},{},[1]);
