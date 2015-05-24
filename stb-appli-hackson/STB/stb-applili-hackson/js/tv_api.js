$(function(){
     
    /* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
    /* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

    'use strict';

    var video;
    var chBanner;

    var channelList = [];
    var currentSource = null;

    window.addEventListener("keydown" , KeyDownFunc);  

    try{
       intervalID = window.setInterval(poringDevice,PORING_TIME_CYCLE);
    }catch(e){
       console.log(e);   
    }

    window.onload = function() {
           var tv = window.navigator.tv;
        video = document.getElementById('tv');

        if (!tv) {
            errlog ('failed to get tv. check permission.');
            return;
        }

        tv.getTuners().then (function onsuccess(tuners) {
            if (tuners.length == 0) {
                errlog ('getTuners() fail.');
                return;
            }
            tuners[0].setCurrentSource ('isdb-t').then(function onsuccess() {
                video.mozSrcObject = tuners[0].stream;
                currentSource = tuners[0].currentSource;
                currentSource.getChannels().then(function onsuccess(channels) {
                    chBanner = document.getElementById('channel-banner');
                    if (channels.length == 0) {
                        addBanner ('Service Not Found.');
                    } 
                    else {             
                      channels.forEach (function (ch) { 
                        if (channelList.some(function (e) {
                           return ((e.transportStreamId == ch.transportStreamId) || (e.number == ch.number))
                        })) 
                        {
                          return;
                        }
                        channelList.push (ch);
                      }); 
                      var currentChannel = channelList[0];

                      TvTuning(currentChannel);

                      currentChannel.getCurrentProgram().then(function onsuccess(program) {
                           createChannelProgramBanner(currentChannel, program);
                           //poringDevice();
                           //sendXHR(ipArray[0],0);
                      }, function onerror(error) {
                           errlog ('getCurrentProgram() error');
                      });
                    }  
                }, function onerror(error) {
                    errlog ('getChannels() error');
                });
            }, function onerror(error) {
                errlog ('setCurrentSource() error');
            });
            // ### TV Source ###            
        }, function onerror(error) {
            errlog ('getTuners() error.');
       });
    };

    function KeyDownFunc(event) { 

        var key = event.keyCode;
        //dbglog('kc = ' + key);

        var channelList_index = 0;

        switch(key) {
        case KeyEvent.DOM_VK_1:
           channelList_index = 0;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_2:
           channelList_index = 1;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_3:
           channelList_index = 2;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_4:
           channelList_index = 3;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_5:
           channelList_index = 4;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_6:
           channelList_index = 5;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_7:
           channelList_index = 6;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_8:
           channelList_index = 7;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_9:
           channelList_index = 8;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_10:
           channelList_index = 9;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_11:
           channelList_index = 10;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_12:
           channelList_index = 11;
           if(channelList.length <= channelList_index){ return; }
           break;
        case KeyEvent.DOM_VK_UP:
           TvSetFrameSize(1); 
           return;
           break;
        case KeyEvent.DOM_VK_DOWN:
           TvSetFrameSize(0.5); 
           return;
           break;
        default:
           errlog('no key action');
           return;  // return
           break;
        }           

        var currentChannel = channelList[channelList_index];

        TvTuning(currentChannel);

        resetBanner ();    
        currentChannel.getCurrentProgram().then(function onsuccess(program) {
            createChannelProgramBanner(currentChannel, program);  
        }, function onerror(error) {
             errlog ('getCurrentProgram() error');
        });
    }

    //XXX デバック用
    //runNotification(1);
    
    /*
     * ニュース速報を出す.
     * @return num 鍋の場合1、洗濯機の場合2
     */
    /*
    function runNotification(num){
        //チャイム音再生
        $("#sound-file").get(0).play();
        
        var textImage = "";
        var bgImage = "";
        //numによって画像差し替え
        switch (num){
          case 1:
            textImage = "../images/text-pot.png";
            bgImage = "../images/bg-pot.jpg"; 
            break;
          case 2:
            textImage = "../images/text-laundry.png";
            bgImage = "../images/bg-laundry.jpg"; 
            break;
        }
        
        //ニュース点滅
        $("#news").animate({opacity:1}, {duration: 100})
        .delay(1000)
        .animate({opacity:0}, {duration: 100})
        .delay(1000)
        .animate({opacity:1}, {duration: 100})
        .delay(1000)
        .animate({opacity:0}, {duration: 100})
        .delay(1000)
        .animate({opacity:1}, {duration: 100})
        .delay(2000)
        .animate({opacity:1}, {duration: 100, complete:function(){ 
            //テキスト差し替え
            $("#news").css("background-image", "url(" + textImage + ")");
            //背景差し替え
            $("body").css("background-image", "url(" + bgImage + ")");
            //2秒後に映像を縮小
            setTimeout(function(){
                if(timeLimit == 0){
                    $("#video-area").addClass('scale-down'); 
                    $("#video-area").removeClass('scale-up');
                    //戻すタイミングを20秒追加
                    timeLimit = timeLimit + 20;
                }
            },2000);
        }})
        
    }
    
    //毎秒戻すタイミングをチェック
    setInterval(checkTimeOut,1000);
    
    var timeLimit = 0;
    
    function checkTimeOut(){
        if(timeLimit > 1){
            timeLimit --;
        }else if(timeLimit == 1){
            //映像拡大
            $("#video-area").removeClass('scale-down');
            $("#video-area").addClass('scale-up');
            //ニュース消す
            $("#news").css({opacity:0});
            timeLimit --;
        }
    }
  */  
});