/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
   /* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var ipArray = ['192.168.109.36','192.168.109.85'];
var PORING_TIME_CYCLE = 5000;
var intervalID;

function dbglog(msg) {
    console.log ('>>> ' + msg + '\n');
}

function errlog(msg) {
    console.log ('!!! ' + msg + '\n');
}

function TvTuning (ch) {
    var channel_number = ch.number;
    if (currentSource == null) {
        errlog ('currentSource is null');
        return;
    }
    currentSource.setCurrentChannel(channel_number).then(function onsucces() {
    }, function onerror(error) {
        errlog ('error setCurrentChannel : ' + ch.name + '.');
    });
}

function resetBanner() {
    chBanner.innerHTML="";
}

function createChannelBanner(channel) 
{
    chBanner.innerHTML='<div>'
                       +'地上Ｄ ' + makeChNumber(channel.number) + ' : ' + channel.name 
                       + '<br>'
                       +'</div>';
}

function createChannelProgramBanner(channel, program) 
{
    chBanner.innerHTML='<div>'
                       +'地上Ｄ ' + makeChNumber(channel.number) + ' : ' + channel.name + '<br>'
                       +program.title +'<br>'
                       +makeTime(program.startTime) +'<br>'
                       +makeTime(program.startTime + program.duration) +'<br>'
                       +program.description
                       +'</div>';
}

function makeChNumber(ch_num) {
    if(0 <= ch_num && ch_num <= 9) {
       return ('00' + ch_num);    
    }
    else if(10 <= ch_num && ch_num <= 99) {
       return ('0' + ch_num);    
    }
    else if(100 <= ch_num){
       return (ch_num);    
    }
    else { // for channel index number        
       return ('0' + ch_num);    
    }
}

function makeTime(time) {
    var date = new Date(time * 1000);
    var hours = date.getHours();
    var minutes = date.getMinutes();

    if(0 <= hours && hours <= 9) {
       var t_hours = "0" + hours;    
    }
    else {
       var t_hours = "" + hours;    
    }
    if(0 <= minutes && minutes <= 9) {
       var t_minutes = "0" + minutes;            
    }
    else {
       var t_minutes = "" + minutes;            
    }    
    return (t_hours + ':' + t_minutes);
}

function TvSetFrameSize(rate) {
    
    if(rate > 1) { rate = 1;}
    else if (rate < 0) { rate = 0; }
        
    var p = document.getElementById('tv').style;
    var l_width = 100 * rate;
    var l_height = 100 * rate;
    var l_top = (100 - l_height) / 2;
    var l_left = (100 - l_width) / 2;

    p.width = l_width + '%';
    p.height = l_height + '%';
    p.top = l_top + '%';
    p.left = l_left + '%';
}

function poringDevice() {
    
    //sendXHR(ipArray[1],2);
    //runNotification(2);
    //alert('ip:'+ipArray[0]);
    //sendXHR(ipArray[0],1);
    for (var i=0;i<ipArray.length;i++){
        //alert('ip:'+ipArray[i]);
        sendXHR(ipArray[i],i);
    }
}

function createChannelBannerDummy(idx) 
{
   if(idx == 0){
        chBanner.innerHTML='<div>'
            +'速報'
            + '<br>'
            +'洗濯機が終了しました'
            +'</div>';
    }else{
        chBanner.innerHTML='<div>'
            +'緊急速報'
            + '<br>'
            +'お鍋が噴きこぼれる可能性があります。'
            +'</div>';
    }
}

/*
* 非同期リクエスト送信
*/
function sendXHR(ipaddress,idx) {

    var destination = "http://" + ipaddress + "/xhr?power=1",
        //{mozSystem: true}というオブジェクトを渡さないとクロスドメインで怒られる
        xhr = new XMLHttpRequest({mozSystem: true});

    //初期化
    xhr.open("GET", destination, true);
    //xhr.statusText = "";
    
    //ステータス変化イベント
    xhr.onreadystatechange = function () {
        console.log("xhr.readyState: " + xhr.readyState);
        console.log("xhr.status: " + xhr.status);
    };

    //ロード完了イベント
    xhr.onload = function (e) {
        console.log("xhr.readyState: " + xhr.readyState);
        if (xhr.readyState === 4) {
            //リクエスト終了
            console.log("xhr.status: " + xhr.status);
            if (xhr.status === 200) {
                //正常完了
                console.log("xhr.responseText: " + xhr.responseText);
                if(xhr.responseText === 'NG'){
                    runNotification(idx+1);
                    xhr.statusText = "";
                }
            } else {
                //異常完了
                console.error("xhr.statusText: " + xhr.statusText);
            }
        }
    };

    //エラーイベント
    xhr.onerror = function (e) {
        console.error("xhr.statusText: " + xhr.statusText);
    };

    //送信
    xhr.send(null);
    console.log("XMLHttpRequest.send " + destination);
}

/*
 * ニュース速報を出す.
 * @return num 鍋の場合1、洗濯機の場合2
 */
function runNotification(num){
    //チャイム音再生
    //var oto = document.getElementById('sound-file');
    
    var ado = new Audio('http://' + ipArray[num -1] + '/sounds/chime.mp3');
    ado.loop = false;
    ado.play();
    
    //$("#sound-file").get(0).play();

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

    //速報タイトル
    $("#news").css("background-image", "url('../images/title.png')");
    
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


