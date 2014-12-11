(function() {
  var uniqueCookieId = "hyperaudio-maker-hint=true";
  var init, setupShepherd;

  init = function() {
    return setupShepherd();
  };

  setupShepherd = function() {
    var shepherd;

    // set the cookie

    document.cookie = uniqueCookieId;

    shepherd = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-element shepherd-open shepherd-theme-arrows',
        showCancelLink: true
      }
    });
    shepherd.addStep('welcome', {
      text: ['The Hyperaudio Maker allows you to type in a transcript along with the audio or video ready for word-aligning to produce a "hypertranscript".'],
      attachTo: '#source-video',
      classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
      buttons: [
        {
          text: 'Exit',
          classes: 'shepherd-button-secondary',
          action: shepherd.cancel
        }, {
          text: 'Next',
          action: shepherd.next,
          classes: 'shepherd-button-example-primary'
        }
      ]
    });
    shepherd.addStep('one', {
      text: 'Press play ... ',
      attachTo: '.hyperaudio-player-play',
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: shepherd.back
        }, {
          text: 'Next',
          action: shepherd.next
        }
      ]
    });
    shepherd.addStep('two', {
      text: '... and start transcribing by typing into the box below.',
      attachTo: '#content',
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: shepherd.back
        }, {
          text: 'Next',
          action: shepherd.next
        }
      ]
    });
    shepherd.addStep('three', {
      text: 'Alter the time we wait until resuming playback, after you stop typing.',
      attachTo: '#inactivity',
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: shepherd.back
        }, {
          text: 'Next',
          action: shepherd.next
        }
      ]
    });
    shepherd.addStep('four', {
      text: 'The playback will continue for a while why you type. You can alter the amount by tweaking the "Chunk Length".',
      attachTo: '#cht',
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: shepherd.back
        }, {
          text: 'Next',
          action: shepherd.next
        }
      ]
    });
    shepherd.addStep('seven', {
      text: 'Remember to save your work before moving on!',
      attachTo: '#save-button',
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: shepherd.back
        }, {
          text: 'Done',
          action: shepherd.next
        }
      ]
    });
    return shepherd.start();
  };

  if (document.cookie.indexOf(uniqueCookieId) < 0) {
    $(init);
  }

}).call(this);
