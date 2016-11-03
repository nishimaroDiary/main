//グローバル変数達
//map;
var mypos = {
    position: {
        lat: null,
        lng: null
    },
    title: '現在地',
    visitPosition: {
        lat: null,
        lng: null,
        posFlag: 0
    }
};
var j;
var map = null;
var markers = [];
var currentMarker = null;
var points = [];
var watchID = null;
var currentCategory = null;

$(document).on("pageinit", "#map_page", function(){
    waitmodal.show();
    $.ajax({
        url: "http://nishi.isc.ac.jp/upload2/getCategories.php",
        type: "GET",
        dataType: "json",
        success: function(data){
            waitmodal.hide();
            $("#categoryList").html("<option value='999'>全て</option>");
            for(var i = 0; i < data.length; i++){
                
                //console.log(JSON.stringify(data));
                //[{"categoryId":"1","categoryName":"横浜道"},{"categoryId":"2","categoryName":"保土ケ谷道"},{"categoryId":"3","categoryName":"旧東海道"},{"categoryId":"4","categoryName":"みなとみらい21"}]
                
                var w;
                if(data[i].categoryId == currentCategory){ //初回起動時
                    w = "<option value='"+data[i].categoryId+"' selected='selected'>" + data[i].categoryName + "</option>";
                }
                else{ //次回起動時キャッシュがある場合
                    w = "<option value='"+data[i].categoryId+"'>" + data[i].categoryName + "</option>";
                }
                $("#categoryList").append(w);
            }
            changeMarker(999);
        },
        error: function(){
            alert("通信に失敗しちゃった！後でもう一度試してね  error:1005");
            waitmodal.hide();
            appTab.setActiveTab(0);
        }
    });
    
    $("#categoryList").change(
        function(){
            currentCategory = $("#categoryList").val();
            changeMarker(currentCategory);
        }
    );
    
    map = new GMaps({
        lat: mypos.position.lat,
        lng: mypos.position.lng,
        zoom: 15,
        div: '#map'
    });

    //mapに現在地ボタンを配置する
    map.addControl({
        position: 'top_right',
        content: '今いる所',
        style: {
            margin: '5px',
            padding: '1px 6px',
            border: 'solid 1px #717B87',
            background: '#fff'
        },
        events: {
            click: function() {
                map.setCenter(mypos.position.lat, mypos.position.lng);
            }
        }
    });
    //現在地のピンを表示
    if(currentMarker == null){
        //この場所のアイコン
        var nishimaro = {
            position: {
                lat: 35.46538438869062,
                lng: 139.62305814027786
            },
            title: 'にしまろちゃん',
            icon: "img/marker.png",
            infoWindow: {
                content:  '<table><tr><td><img src="img/migimuki.png" style="width: 45px;" /></td><td>' + '今いるところだよ'+'</td></tr></table>' 
            }
        }
        currentMarker = map.addMarker(nishimaro);
    }
});
//スポットの登録
function changeMarker(cId){
    waitmodal.show();
    $.ajax({
        url: "http://nishi.isc.ac.jp/upload2/getPoints.php?userId="+window.localStorage.getItem("userId")+"&categoryId="+cId,
        type: "GET",
        dataType: "json",
        success: function(data){
            console.log("aaa"+JSON.stringify(data));
            waitmodal.hide();
            points = data;
            map.removeMarkers(markers);
            map.addMarker(currentMarker);
            markers = [];
            
            for(var i = 0; i < data.length; i++){
                var marker = 
                {
                    position: {
                        lat: parseFloat(data[i].lat),
                        lng: parseFloat(data[i].lng)
                    },
                    title: data[i].pointName,
                    infoWindow: {
                         content: '<table><tr><td rowspan="3"><img src="img/migimuki.png" style="width: 45px;" /></td><td>' + data[i].pointName + 'だよ'      
                    }
                };//既に行ったことがある場合
                if(data[i].visitedDateTime != null){
                    marker.icon = "img/16c1_l.ico";
                    marker.infoWindow.content = marker.infoWindow.content + "<br />" + data[i].count + "回行ったことがあるよ！";
                }
                marker.infoWindow.content = marker.infoWindow.content;
                //marker.infoWindow.content = marker.infoWindow.content + '<input id="directionButton" type="button" value="ここへ行く" onclick="alert();" /></td></tr></table>'
                markers.push(marker);
            }
            //お店のピンと吹き出しを作る
            // 秋のキャンペーン
            //rest_details table の restId と rests table の id を一致させる必要がある
            $.ajax({
                url: "http://nishi.isc.ac.jp/nishimaroApi/shop/getCoupons.php",
                type: "GET",
                dataType: "json",
                success: function(data){
                    for(var i = 0; i < data.length; i++){
                        var html;
                        //バグ : 写真のある店舗の詳細Dlgを参照した後に写真のない店舗を参照すると直前にみた写真のある店舗の写真が参照されるバグがある 20161029未修正
                        // html = '<table><tr><td rowspan="3"><img src="img/cou" style="width: 45px;" /></td><td>' + data[i].content + 'だよ<br \><a href="javascript:void(0)" onClick="popupRestDatail('+data[i].id+');">詳細を見る</a></td></tr></table>';
                        html ='<table><tr><td style="font-size:1em; text-overflow:ellipsis;"><a href="javascript:void(0)" onClick="popupRestDatail('+data[i].id+');">'+data[i].name+'</a></td></tr></table>';
                        // else{
                        //     html+='<td></td><td></td></tr></table>';
                        // }
                        html +='<table><tr>';
                        // if(data[i].content=="キャンペーン期間のサービスはありません"){
                        //     alert(data[i].name);
                        // }
                        console.log(data[i].content);
                        if(data[i].recN==1){
                            html += '<td><img src="img/nishiku3.png" style="height:1.6em;"</td>';
                        }
                        if(data[i].recG==1){
                            html += '<td><img src="img/gachi3.png" style="height:1.6em;"</td>';
                        }
                        if(data[i].recS==1){
                            html += '<td><img src="img/gakusei3.png" style="height:1.6em;"</td>';
                        }
                        if(data[i].content&&data[i].content!="キャンペーン期間のサービスはありません"){
                            html += '<td><img src="img/coupon2.png" style="height:1.8em;" /></td>';
                        }
                        html +='</tr></table>'
                        var marker = 
                        {
                            position: {
                                lat: parseFloat(data[i].lat),
                                lng: parseFloat(data[i].lng)
                            },
                            title: data[i].name,
                            infoWindow: {
                                 content: html,
                                 // maxWidth: 500,
                                 padding: "0px 0px 0px 0px",
                                 height: "40px"
                            }
                        };
                        marker.icon = "img/gourmet-pin.ico"
                        marker.infoWindow.content = marker.infoWindow.content;
                        markers.push(marker);
                    }
                    markers = map.addMarkers(markers);
                    watchMyPosition();
                },
                error: function(){
                    alert("通信に失敗しちゃった！後でもう一度試してね  error:1006");
                    waitmodal.hide();
                    appTab.setActiveTab(0);
                }
            });
            
        },
        error: function(){
            alert("通信に失敗しちゃった！後でもう一度試してね  error:1006");
            waitmodal.hide();
            appTab.setActiveTab(0);
        }
    });
}

function watchMyPosition(){
    if(watchID != null) {
        checkNearPoint();
        return;
    }
    
    // 現在の位置情報を取得
    watchID = navigator.geolocation.watchPosition(
        // 位置情報の取得を成功した場合
        function(pos) {
            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;
            if (mypos.position.lat == null) {
                map.setCenter(lat, lng);
            }
            mypos.position.lat = lat;//35.45310495;//lat;
            mypos.position.lng = lng;//139.62547035;//lng;
            
            var myLatLng = new google.maps.LatLng( mypos.position.lat , mypos.position.lng );
            currentMarker.setPosition(myLatLng);
            
            checkNearPoint();
        }, 
        function(error){
            
        }, 
        {
            enableHighAccuracy: true,
            timeout: 30000
        }
    );    
}

var jumpId, jumpName;
function checkNearPoint(){
    var now = new Date();
    var nowDate = now.getFullYear()+"-"+( "0"+( now.getMonth()+1 ) ).slice(-2)+"-"+("0"+now.getDate() ).slice(-2);
    for(var i = 0; i < points.length; i++){
        var myLatLng = new google.maps.LatLng( mypos.position.lat , mypos.position.lng );
        var distance = google.maps.geometry.spherical.computeDistanceBetween(myLatLng, new google.maps.LatLng( points[i].lat ,points[i].lng ));
    //gpsの判定距離
        if(distance < 73 && (points[i].visitedDateTime == null || points[i].visitedDateTime.substr(0, 10) != nowDate)){
            findIdx = i;
            jumpId = points[i].pointId;
            jumpName = points[i].pointName;
            
            waitmodal.show();
            points[i].visitedDateTime = nowDate;
            $.ajax({
                url: "http://nishi.isc.ac.jp/upload2/updateVisitedPoints.php?userId=" + window.localStorage.getItem("userId") + "&pointId=" + points[i].pointId,
                type: "GET",
                dataType: "json",
                success : function(data){
                    waitmodal.hide();
                    var msg;
                    if(data.count == 1){
                        msg = jumpName + "の日記<br/>を見つけたよ";
                    }else{
                        msg = jumpName + "訪問 " + data.count + "回目！";
                    }
                    msg = msg + "<br/>" + data.score + "ptゲット！<br/>";
                    if(data.bonus != 0){
                        msg = msg + "<br/>" + data.reason + "<br/>" + data.bonus + "ptボーナス！";
                    } 
                    if(data.count == 1){
                        ons.notification.confirm({
                            messageHTML: msg,
                            // もしくは messageHTML: '<div>HTML形式のメッセージ</div>',
                            title: '得点ゲット',
                            buttonLabels: ['日記を見る', '後で'],
                            animation: 'default', // もしくは'none'
                            primaryButtonIndex: 1,
                            cancelable: true,
                            callback: function(buttonIndex) {
                                if(buttonIndex == 0 ){
                                    currentDiaryId = jumpId;
                                    appTab.setActiveTab(1);
                                }
                                //秋のキャンペーン200pt達成確認
                                achieveCheck();
                            }
                        });
                    }else{
                        ons.notification.alert({
                            messageHTML: msg,
                            // もしくはmessageHTML: '<div>HTML形式のメッセージ</div>',
                            title: '得点ゲット',
                            buttonLabel: 'OK',
                            animation: 'default', // もしくは'none'
                            // modifier: 'optional-modifier'
                            cancelable: true,
                            //上手く指定できていないけど気分で付けておく
                            callback: function() {
                                void(0);
                                //空関数にビビッて付ける
                                //秋のキャンペーン200pt達成確認
                                achieveCheck();
                            }
                        });  
                    }
                },
                error : function(){
                    points[i].visitedDateTime = null;
                    alert("日記を見つけたけど、通信に失敗しちゃった！もう一度試してね  error:1007");
                    waitmodal.hide();
                    appTab.setActiveTab(0);
               }
            });
        }
    }
}











//以下メモ(消しても大丈夫なコメント達)

/*
function onConfirm(buttonIndex) {
    alert('You selected button ' + buttonIndex);
    if(buttonIndex == 1){
        if(data.count == 1){
            currentDiaryId = jumpId;
            appTab.setActiveTab(1);
        }
    }
}






ons.notification.confirm({
  messageHTML: msg,
  // もしくは messageHTML: '<div>HTML形式のメッセージ</div>',
  title: '得点ゲット',
  buttonLabels: ['はい', 'いいえ'],
  animation: 'default', // もしくは'none'
  primaryButtonIndex: 1,
  cancelable: true,
  callback: function(index) {
    // -1: キャンセルされた
    // 0-: 左から0ではじまるボタン番号
    alert('You selected button ' + buttonIndex);
  }
});

                    navigator.notification.confirm({
                        messageHTML: msg,
                        title: '得点ゲット',
                        buttonLabels: ['OKk','後で'],
                        animation: 'default', // もしくは'none'
                        callback: function() {
                            if(data.count == 1){
                                currentDiaryId = jumpId;
                                appTab.setActiveTab(1);
                            }
                        }
                    });
  
  
  */
                    /*

function onConfirm(buttonIndex) {
    alert('You selected button ' + buttonIndex);
}

navigator.notification.confirm(
    msg, // message
    onConfirm,            // callback to invoke with index of button pressed
    '得点ゲット',           // title
    ['日記へ','後で']     // buttonLabels
);



function onConfirm(buttonIndex) {
    alert('You selected button ' + buttonIndex);
}

navigator.notification.confirm(
    'You are the winner!', // message
    onConfirm,            // callback to invoke with index of button pressed
    'Game Over',           // title
    ['Restart','Exit']     // buttonLabels
);
                    */
                    
                    


/*
function onConfirm() {
    //alert('You selected button ' + buttonIndex);
    if(buttonIndex == 2){
        currentDiaryId = jumpId;
        appTab.setActiveTab(1);
    }
}
*/

/*

                    navigator.notification.confirm(
                        message: msg,
                        onConfirm,
                        title: '得点ゲット',
                        ['後で','日記へ']
                    );



                        if(buttonIndex == 2){
                                currentDiaryId = jumpId;
                                appTab.setActiveTab(1);
                            },


function onConfirm(buttonIndex) {
    //alert('You selected button ' + buttonIndex);
    if(buttonIndex == 2){
        inbrow('http://www.city.yokohama.lg.jp/nishi/nishimaro/');
    }
}

function inAlert(){
    navigator.notification.confirm(
        , // message
        onConfirm,            // callback to invoke with index of button pressed
        '　',           // title
        ['後で','日記へ']     // buttonLabels
    );
}
                    navigator.notification.confirm({
                        messageHTML: msg,
                        onConfirm,
                        title: '得点ゲット',
                        ['後で','日記へ'],
                        callback: function() {
                            if(buttonIndex == 2){
                                currentDiaryId = jumpId;
                                appTab.setActiveTab(1);
                            }
                        }
                    });

*/


