/*
*(c) Copyright 2011 Simone Masiero. Some Rights Reserved. 
*This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 License
*/

var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
var gameStarted = false;
$(
	function(){
		$( document ).on('keydown',function ( event ) { 
      if (!gameStarted ) {
        if (event.keyCode == 13) {
          gameStarted = true;
        }else{
          event.preventDefault();
          return false;
        }
      }else{
      
      }
      Kellogs.keyPressed(event, Typer.addText);
      
		});
	}
);
var Kellogs = {
  heat: function(i){
    var min = Kellogs.min(),
        max = Kellogs.max(),
        fractions = max/5,
        key = Kellogs.packet[i],
        heat = undefined;
    if (max <= 0) { return 1; };
    if (key === undefined) { return 1; };
    if (key.count < 0) { return 1;};
    if (key.count == min ) { return 1;};
    heat = Math.round(key.count/fractions);
    return (heat > 0) ? heat : 1;
  },
  packet: {},
  keyPressed: function(event,callback){
    if(Typer._stopped){
      event.preventDefault();
      event.returnValue = false;
      return false;
    }
    var keyCode = event.keyCode;
    if (Kellogs.packet[keyCode] === undefined) {
      Kellogs.packet[keyCode] = {
        key: String.fromCharCode(keyCode),
        count: 1
      };
    } else {
      Kellogs.packet[keyCode].count++;
    }
    if (_.isFunction(callback)) { callback(event, Kellogs.speed(keyCode));};
    // Now update the UI keys
    var heat = Kellogs.heat(Kellogs.packet[keyCode].count);
    var key = String.fromCharCode(keyCode);
    updateKeyboard();

    return Kellogs.packet[keyCode];
  },
  max: function(){
    if (_.isEmpty(Kellogs.packet)) { return 0; };
    return _.max(_.pluck(Kellogs.packet, 'count'));
  },
  min: function(){
    if (_.isEmpty(Kellogs.packet)) { return 0; };
    return _.max(_.pluck(Kellogs.packet, 'count'));
  },
  speed: function(i){
    if (_.contains(letters, Kellogs.packet[i].key)) {
      var heat = Kellogs.heat(i);
      heat =  _.max(heat, 1); 
      var result = Math.round(15/Kellogs.heat(i));
      if (result === Infinity ) { return 1;}
      return result;
    }else{
      return 2;
    }
    
  }
};
var Timer = {
  target:     undefined,
  _start:     undefined,
  _end:       undefined,
  elapsed:    function(){
                if (Timer._start === undefined ) {
                  return 0;
                }

                return (Date.now() - Timer._start)/1000;
              },
  precision:  0.01, // in seconds
  reset:      false,
  _interval:   undefined,

  start:  function(){
                if (Timer._start === undefined) { Timer._start = Date.now();}
                if (Timer._interval === undefined) {
                  // we multiply precision because it is in seconds
                  Timer._interval = setInterval(Timer.tic, (Timer.precision * 1000)); 
                }
                return Timer._interval;
              },
  pause:  function(){
            if (Timer._interval) {
              clearInterval(Timer._interval);
              Timer._interval = undefined;
            }
            return Timer.elapsed; 
          },
  stop:   function(){
            Timer.pause();
            Timer.reset = true;
            return Timer.elapsed;
          },
  tic:    function(){
            if (Timer.reset) {
              Timer.reset = false;
              Timer._start = Date.now();
            }
            var time = pad(Timer.elapsed().toFixed(2), 8);
            time = time.replace(/\./g, ':');
            $(Timer.target).text(time);
          }
};
var Typer={
  text: null,
  accessCountimer:null,
  index:0, // current cursor position
  speed:2, // speed of the Typer
  file:"", //file, must be setted
  accessCount:0, //times alt is pressed for Access Granted
  deniedCount:0, //times caps is pressed for Access Denied
  _started: false,
  _stopped: false,
  init: function(){// inizialize Hacker Typer
    accessCountimer=setInterval(function(){Typer.updLstChr();},500); // inizialize timer for blinking cursor
    $.get(Typer.file,function(data){// get the text file
      Typer.text=data;// save the textfile in Typer.text
    });
  },
  
  content:function(){
    return $("#console").html();// get console content
  },
  
  write:function(str){// append to console content
    $("#console").append(str);
    return false;
  },
  
  makeAccess:function(){//create Access Granted popUp      FIXME: popup is on top of the page and doesn't show is the page is scrolled
    Typer.hidepop(); // hide all popups
    Typer.accessCount=0; //reset count
    var ddiv=$("<div id='gran'>").html(""); // create new blank div and id "gran"
    ddiv.addClass("accessGranted"); // add class to the div
    ddiv.html("<h1>ACCESS GRANTED</h1>"); // set content of div
    $(document.body).prepend(ddiv); // prepend div to body
    return false;
  },
  makeDenied:function(){//create Access Denied popUp      FIXME: popup is on top of the page and doesn't show is the page is scrolled
    Typer.hidepop(); // hide all popups
    Typer.deniedCount=0; //reset count
    var ddiv=$("<div id='deni'>").html(""); // create new blank div and id "deni"
    ddiv.addClass("accessDenied");// add class to the div
    ddiv.html("<h1>ACCESS DENIED</h1>");// set content of div
    $(document.body).prepend(ddiv);// prepend div to body
    return false;
  },
  
  hidepop:function(){// remove all existing popups
    $("#deni").remove();
    $("#gran").remove();
  },
  
  stop:function(){
    Typer._stopped = true;
    endGame();
  },

  addText:function(key, speed){//Main function to add the code
    if (speed === undefined) {
      speed = Typer.speed;
    }
    if(Typer._stopped){
      key.preventDefault();
      key.returnValue= false;
      return false;
    }
    else if (!Typer._started) {
      Typer._started = true; 
      Timer.start();
    }
    if(key.keyCode==18){// key 18 = alt key
      Typer.accessCount++; //increase counter 
      if(Typer.accessCount>=3){// if it's presed 3 times
        Typer.makeAccess(); // make access popup
      }
    }else if(key.keyCode==20){// key 20 = caps lock
      Typer.deniedCount++; // increase counter
      if(Typer.deniedCount>=3){ // if it's pressed 3 times
        Typer.makeDenied(); // make denied popup
      }
    }else if(key.keyCode==27){ // key 27 = esc key
      Typer.hidepop(); // hide all popups
    }else if(Typer.text){ // otherway if text is loaded
      if (Typer.index >= Typer.text.length) {
        Timer.stop();
        Typer.stop();
        key.preventDefault();
        key.returnValue= false;
        return false;
      }
      var cont=Typer.content(); // get the console content
      if(cont.substring(cont.length-1,cont.length)=="|") // if the last char is the blinking cursor
        $("#console").html($("#console").html().substring(0,cont.length-1)); // remove it before adding the text
      if(key.keyCode!=8){ // if key is not backspace
        Typer.index+=speed;	// add to the index the speed
      }else{
        if(Typer.index>0) // else if index is not less than 0 
          Typer.index-=speed;//	remove speed for deleting text
      }
      var text=$("<div/>").text(Typer.text.substring(0,Typer.index)).html();// parse the text for stripping html enities
      var rtn= new RegExp("\n", "g"); // newline regex
      var rts= new RegExp("\\s", "g"); // whitespace regex
      var rtt= new RegExp("\\t", "g"); // tab regex
      $("#console").html(text.replace(rtn,"<br/>").replace(rtt,"&nbsp;&nbsp;&nbsp;&nbsp;").replace(rts,"&nbsp;"));// replace newline chars with br, tabs with 4 space and blanks with an html blank
      $("#console").scrollTop($('#console').scrollTop()+50); // scroll to make sure bottom is always visible
      updateProgress();
    }
    if ( key.preventDefault && key.keyCode != 122 ) { // prevent F11(fullscreen) from being blocked
      key.preventDefault()
    };  
    if(key.keyCode != 122){ // otherway prevent keys default behavior
      key.returnValue = false;
    }
  },
  
  updLstChr:function(){ // blinking cursor
    var cont=this.content(); // get console 
    if(cont.substring(cont.length-1,cont.length)=="|") // if last char is the cursor
      $("#console").html($("#console").html().substring(0,cont.length-1)); // remove it
    else
      this.write("|"); // else write it
  }
};

function updateKeyboard(){
  var code, obj;
  _.each(letters, function(letter){
    code = _.first(_.compact(_.map(Kellogs.packet, function(v, k){ if(v.key === letter ) return k; })));
    letter = letter.toLowerCase();
    obj = Kellogs.packet[code];
    if (obj) {
      var l = letter;
      var heat = Kellogs.heat(code);
      var classString = 'key ' + l.toLowerCase() + ' heat-' + heat;
      $('.key.'+l.toLowerCase()).attr('class', classString);
      console.log('Key found:', classString);
    } else {
      var l = letter;
      $('.key.'+letter).attr('class', 'key heat-0 ' + letter);
     console.log('object not found?', letter); 
    };

  });

}

function updateProgress(){
  var total = Typer.text.length,
      index = Typer.index,
      bars  = 68;

  var percent = Math.round((index/total)*100);
  if (percent > 100) { percent = 100;}
  $(".progress .percentage").text(pad(percent,3));
  // Bars
  // We've got 65 bars and we have to 
  var bars    = Math.round((index/total)*65);
  var lines   = 65 - bars;

  var arr = [];
  for (var i = 0; i < bars; i++) {
    arr.push('|');
  };
  for (var i = 0; i < lines; i++) {
    arr.push('-');
  };

  $('.progress .bars').text(arr.join(''));

};

function pad(n, len) {
    s = n.toString();
    if (s.length < len) {
        s = ('000000' + s).slice(-len);
    }
    return s;
};

var blinkInterval = undefined;
var blink_off = false;
var blinks = 0;
function endGame(){
  // blink text
  //
  var blinkInterval = setInterval(function(){
    if (blink_off) {
      $('#console').css('color', 'rgba(0, 255, 0, 0.75)');
      blink_off = false;
    } else {
      $('#console').css('color', 'rgba(0,0,0,0.01)');
      blink_off = true;
    }
    blinks++;

    if(blinks >= 5){
      clearInterval(blinkInterval);
      $('#console').text('');
      $('.game-over img').toggle();
    }

  }, 500);
  //
};
