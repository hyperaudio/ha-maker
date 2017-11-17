var mediaId;
var mediaObject;
var transcriptId;
var transcriptObject;

var namespace = null;
if (document.location.hostname.indexOf('hyperaud') > 0) {
  namespace = document.location.hostname.substring(0, document.location.hostname.indexOf('hyperaud') - 1);
}

var prefix = '';
if (namespace) prefix = namespace + '.';

var domain;
if (document.location.hostname.indexOf('hyperaud.io') > -1) {
  domain = 'hyperaud.io';
} else {
  domain = 'hyperaudio.net';
}

var savingAnim = document.querySelector('#save-button-saving');

var API = 'https://' + prefix + 'api.' + domain + '/v1';

$( document ).ready(function() {

  $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
    if (options.url.indexOf(API) == 0) {
      if (window.localStorage.getItem('token')) {
        jqXHR.setRequestHeader('Authorization', 'Bearer ' + window.localStorage.getItem('token'));
      }
    }
  });


  function main(myPlayer) {

    var timePoint = 0;
    var chunkTime = 4;
    var inactivityTime = 2;
    var lastActivity = Date.now();

    var v = document.getElementsByTagName("video")[0];
    var p = document.getElementById("pbr");
    var cp = document.getElementById("currentPbr");
    var c = document.getElementById("cht");
    var cc = document.getElementById("currentCht");
    var content = document.getElementById("content");
    var i = document.getElementById("inactivity");
    var ic = document.getElementById("currentInactivity");

    var activityPause = false;

    myPlayer.addEventListener('timeupdate',function(){
      var secs = Math.floor(this.currentTime);
      if (secs%chunkTime == 0 && timePoint != secs) {
        myPlayer.pause();
        timePoint = secs;
        activityPause = true;
        //setTimeout(function(){v.play()},chunkTime*1000);
      }
    },false);


    myPlayer.addEventListener('pause',function(){
      if (!activityPause) {
        stopSampling();
      }
    },false);

    myPlayer.addEventListener('play',function(){
      startSampling();
    },false);

    var sampler;

    function startSampling() {
      clearInterval(sampler);
      sampler = setInterval(function() {
        //console.log("sampling - "+Date.now() - lastActivity);
        if (Date.now() - lastActivity > (1000*inactivityTime)) {
          myPlayer.play();
          activityPause = false;
        }
      }, 1000);
    }

    function stopSampling() {
      clearInterval(sampler);
    }

    startSampling();

    // wire playbackRate directly into the video element
    // (won't work for YouTube)

    p.addEventListener('input',function(){
      cp.innerHTML = p.value;
      v.playbackRate = p.value;
    },false);

    c.addEventListener('input',function(){
      cc.innerHTML = c.value;
      chunkTime = c.value;
    },false);

    i.addEventListener('input',function(){
      ic.innerHTML = i.value;
      inactivityTime = i.value;
    },false);

    content.addEventListener('input',function(){
      lastActivity = Date.now();
    },false);

  };

  transcriptId = purl(window.top.document.location.href).param('t');
  var sourceTarget = "#source-video";

  if (transcriptId) {
    getHATranscribedMedia();
  }
  else
  {
    var mp4Url = purl(window.top.document.location.href).param('mp4');
    var webmUrl = purl(window.top.document.location.href).param('webm');
    var ytUrl = purl(window.top.document.location.href).param('yt');

    if (mp4Url || webmUrl || ytUrl) {
      getDirectMedia(sourceTarget,mp4Url,webmUrl,ytUrl);
    } else {
      mediaId = purl(window.top.document.location.href).param('m');

      getHAMedia(sourceTarget);
    }
  }

  function getDirectMedia(sourceTarget,mp4Url,webmUrl,ytUrl) {

    var staticUrl = false;

    var myPlayer = null;
    var myMp4 = "";
    var myWebm = "";
    var myMp3 = "";


    if (mp4Url) {
      myMp4 = mp4Url;
      staticUrl = true;
    }

    if (webmUrl) {
      myWebm = webmUrl;
      staticUrl = true;
    }

    if (myMp3) {
      myWebm = webmUrl;
      staticUrl = true;
    }

    if (!staticUrl) {
      myPlayer = HA.Player({
        target: sourceTarget,
        media: {
          youtube: ytUrl,
        },
        gui: {
          navigation: false,
          fullscreen: false
        }
      });

    } else {

      // display playbackrate controls
      displayPbr();

      myPlayer = HA.Player({
        target: sourceTarget,
        media: {
          mp4: myMp4,
          webm: myWebm
        },
        gui: {
          navigation: false,
          fullscreen: false
        }
      });
    }
    main(myPlayer);
  }

  function assignMediaObject(_mediaObject) {

    console.dir(_mediaObject);

    mediaObject = _mediaObject;

    var media = {};

    HA.each(mediaObject.source, function(fmt, details) {
      media[fmt] = details.url;
    });

    var myPlayer = HA.Player({
      target: sourceTarget,
      media: media,
      gui: {
        navigation: false,
        fullscreen: false
      }
    });
    main(myPlayer);
  }


  function getHAMedia(sourceTarget) {
    $.get(API + '/media/' + mediaId, function(_mediaObject) {
      assignMediaObject(_mediaObject);
    });
  }

  function getHATranscribedMedia() {
    $.get(API + '/transcripts/' + transcriptId, function(_transcriptObject) {
      transcriptObject = _transcriptObject;

      assignMediaObject(transcriptObject.media);

      if (transcriptObject.content) {
        $('#content').val(transcriptObject.content);
      }
    });
  }

  function displayPbr() {
    document.getElementById("pbr").style.display = "block";
    document.getElementById("pbrLabel").style.display = "block";
  }

  var user = null;



  function whoami(callback) {
    $.ajax(API + '/auth/whoami/' + window.localStorage.getItem('token'), {
      type: "GET",
     contentType: "application/json; charset=utf-8",
     success: function(whoami) {
        if (whoami.user) {
          // logged in
          // alert('logged in');
          user = whoami.user;
        } else {
          // not logged in
          // alert('NOT logged in');
          user = null;
        }
        if (callback) callback();
      },
      xhrFields: {
        withCredentials: true
      },
        crossDomain: true
    });
  }

  function updateTranscript(user) {

    $.ajax( API + '/transcripts/' + transcriptObject._id, {
      type: "PUT",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({
        _id: transcriptObject._id,
        label:  'Transcript for ' + mediaObject.label,
        type: 'text',
        sort: 0,
        owner: user,
        content: $('#content').val(),
        media: mediaId
      }),
      success: function(data) {
        transcriptObject = data;
        console.log(data);
        console.log('Saved!');
        savingAnim.style.display = 'none';
      },
      error: function() {
        alert('Save Error');
        savingAnim.style.display = 'none';
      },
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true
    });
  }

  function saveTranscript(user) {

    $.ajax( API + '/transcripts', {
      type: "POST",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({
        label:  'Transcript for ' + mediaObject.label,
        type: 'text',
        owner: user,
        content: $('#content').val(),
        media: mediaId
      }),
      success: function(data) {
        transcriptObject = data;
        console.log(data);
        console.log('Created!');
        savingAnim.style.display = 'none';
      },
      error: function() {
        alert('Save Error');
        savingAnim.style.display = 'none';
      },
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true
    });
  }

  function save() {
    whoami(function() {
      if (user) {
        //
        savingAnim.style.display = 'block';
        if (transcriptObject) {
          updateTranscript(user);
        } else {
          saveTranscript(user);
        }
        //
      } else {
        alert('not logged in');
      }
    });
  }

  $('#save-button').click(function() {
    save();
  });

  $('#content').autoSave(function() {
    save();
    console.log('auto-saved');
  }, 60000);

});
