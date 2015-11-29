(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
  function updateClock(){
    var s, m, h, vec2, canvas, ctx, canvW, canvH, center, lineStart, lineEndShort, lineEndLong, i$, i, angle, uv, length;
    s = new Date().getSeconds();
    m = new Date().getMinutes();
    h = new Date().getHours();
    vec2 = function(x, y){
      this.x = x;
      return this.y = y;
    };
    canvas = document.getElementById('widget-big-analog-clock-canvas');
    ctx = canvas.getContext('2d');
    canvW = canvas.width;
    canvH = canvas.height;
    ctx.clearRect(0, 0, canvW, canvH);
    center = Math.min(canvW / 2, canvH / 2);
    lineStart = center * 0.90;
    lineEndShort = center * 0.87;
    lineEndLong = center * 0.84;
    for (i$ = 0; i$ <= 59; ++i$) {
      i = i$;
      angle = Math.PI * i / 30;
      uv = new vec2(Math.sin(angle), -Math.cos(angle));
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.moveTo(canvW / 2 + uv.x * lineStart, canvH / 2 + uv.y * lineStart);
      if (i % 5 === 0) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineTo(canvW / 2 + uv.x * lineEndLong, canvH / 2 + uv.y * lineEndLong);
      } else {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineTo(canvW / 2 + uv.x * lineEndShort, canvH / 2 + uv.y * lineEndShort);
      }
      ctx.stroke();
    }
    angle = Math.PI * (m + s / 60) / 30;
    length = Math.min(canvW, canvH) / 2.6;
    uv = new vec2(Math.sin(angle), -Math.cos(angle));
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.moveTo(canvW / 2 - uv.x * length / 5, canvH / 2 - uv.y * length / 5);
    ctx.lineTo(canvW / 2 + uv.x * length, canvH / 2 + uv.y * length);
    ctx.stroke();
    angle = Math.PI * (h % 12 + m / 60) / 6;
    length = Math.min(canvW, canvH) / 4;
    uv = new vec2(Math.sin(angle), -Math.cos(angle));
    ctx.beginPath();
    ctx.strokeStyle = $('#widget-big-analog-clock').attr('data-user-color');
    ctx.lineWidth = 2;
    ctx.moveTo(canvW / 2 - uv.x * length / 5, canvH / 2 - uv.y * length / 5);
    ctx.lineTo(canvW / 2 + uv.x * length, canvH / 2 + uv.y * length);
    ctx.stroke();
    angle = Math.PI * s / 30;
    length = Math.min(canvW, canvH) / 2.6;
    uv = new vec2(Math.sin(angle), -Math.cos(angle));
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.moveTo(canvW / 2 - uv.x * length / 5, canvH / 2 - uv.y * length / 5);
    ctx.lineTo(canvW / 2 + uv.x * length, canvH / 2 + uv.y * length);
    return ctx.stroke();
  }
  $(function(){
    updateClock();
    return setInterval(updateClock, 1000);
  });
}).call(this);

},{}]},{},[1]);
