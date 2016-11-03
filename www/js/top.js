var alertDlg;
var helpDlg;
var restDetailDlg;
var announceDlg;
var autumnDlg;

var appVersion = "010500";   //アプリケーションのバージョン番号

$(document).on("pageinit", "#top_page", function(){
    //起動不能アナウンス表示チェック
    announceCheck(function(){
        //以下の処理はアナウンス表示チェック終了後に実行
        if(window.sessionStorage.getItem("firstFlag") != "1"){
            window.sessionStorage.setItem("firstFlag", "1");        
            if(!popupAlert()) return;
        }
        $("#nameArea").text(window.localStorage.getItem("userName"));
        
        $("#showRankingBtn").click(function(){
            ons.createDialog('rankingDialog.html').then(function (rankingDlg) {
                getRanking();
                rankingDlg.show();
                rankingDlg.on("posthide", function(){
                    rankingDlg.destroy();
                });
            });
        });
        
        waitmodal.show();
        $.ajax({
            url: "http://nishi.isc.ac.jp/upload2/getScore.php?userId=" + window.localStorage.getItem("userId"),
            type: "GET",
            dataType: "json",
            success: function(data)
            {
                $("#totalScore").text(data.totalScore);
                $("#weeklyScore").text(data.weeklyScore);
                achieveCheck();
                
            },
            error: function(){
              //  alert("通信に失敗しちゃった！後でもう一度試してね  error:1000");
            }
        });
        
    });
});


function achieveCheck(){
    //以下2016秋のキャンペーン200pt処理
    $.ajax({
        url: "http://nishi.isc.ac.jp/nishimaroApi/autumn/achieveCheck.php?userId=" + window.localStorage.getItem("userId"),
        type: "GET",
        dataType: "json",
        success: function(data)
        {
            waitmodal.hide();
            var status = data['status']
            if(status=='true'){
                popAchieve();   
            }else{
                return;
            }
            
        },
        error: function(){
            //alert("通信に失敗しちゃった！後でもう一度試してね  error:1000");
        }        
    });
}

function announceCheck(donefunc){
    $.ajax({
        url: "http://nishi.isc.ac.jp/nishimaroApi/checkAnnounce.php?appVer=" + appVersion,
        type: "GET",
        dataType: "json",
        success: function(data)
        {
            if(data['announce'] == 'yes'){
                ons.createDialog('announce.html').then(function (dlg) {
                    announceDlg = dlg;
                    $("#announceTitle").text(data['title']);
                    $("#announceContents").html(data['contents']);
                    announceDlg.show();
                    announceDlg.on("posthide", function(){
                        announceDlg.destroy();
                        announceCheck(donefunc);
                    });
                });
                return;
            }
            donefunc();
        },
        error: function(){
            alert("通信に失敗しちゃった！後でもう一度試してね  error:1019");
            appTab.setActiveTab(0);
        }
    });
}

function popupAlert(){
    if(window.localStorage.getItem("userId")==null){
        ons.notification.prompt({
            title: "はじめまして！",
            message: "あなたのニックネーム(公開)を入力してください",
            callback: function(nickname) {
                signup(nickname);
                popupHelp();
            }
        });
    }
    return window.localStorage.getItem("userId");
}

function popupHelp() {
    ons.createDialog('help.html').then(function (dialog) {
		helpDlg = dialog;
		helpDlg.show();
	});

}

//2016秋のキャンペーン200pt達成Dlg
function popAchieve(){
    ons.createDialog('achieve.html').then(function(achieveDialog){
        achieveDialog.show();
    });
}

      

// 秋のキャンペーン詳細Dlgを開く
function autumnHelp() {
    ons.createDialog('autumnHelp.html').then(function (dialog) {
        autumnDlg = dialog;
        $.ajax({
            url: "http://nishi.isc.ac.jp/nishimaroApi/autumn/campaign.html",
            type:"GET",
            dataType:"html",
            success:function(data){
                $("#campaignTxt").html(data);
            	autumnDlg.show();
                autumnDlg.on("posthide", function(){
                    autumnDlg.destroy();
                });
            },
            error: function(){
                alert("通信に失敗しちゃった！後でもう一度試してね  error:1019");
                appTab.setActiveTab(0);
                autumnDlg.destroy();
            }
        });
	});
}
// 秋のキャンペーン詳細Dlgを開く終わり

//秋のキャンペーン応募フォームを開く
function prizeHelp() {
    ons.createDialog('prizeHelp.html').then(function (dialog) {
        $.ajax({
            url: "http://nishi.isc.ac.jp/nishimaroApi/autumn/getUniqId.php?userId=" + window.localStorage.getItem("userId"),
            type:"GET",
            dataType:"json",
            success:function(data){
                if(data['status']=="success"){
                    $('#prizeUNum').text(data['uniqId']);
                    $('#prizeMessage').text('応募ページでこの4桁の文字を入力してね');
                    $('#prizeButton').css('display','block');
                    
                }else{
                    $.ajax({
                        url:"http://nishi.isc.ac.jp/nishimaroApi/autumn/getTotalScore.php?userId=" + window.localStorage.getItem("userId"),
                        type:"GET",
                        dataType:"json",
                        success:function(data){
                            var totalScore = parseInt(data['totalScore']);
                            if(isNaN(totalScore)) totalScore = 0;
                            $('#prizeUNum').text(totalScore+'pt');
                            $('#prizeMessage').text('あと'+(200-totalScore)+'ポイントたまったら応募できるようになるよ！');
                        },
                        error:function(){
                            alert("通信に失敗しちゃった！後でもう一度試してね  error:1019");
                            appTab.setActiveTab(0);
                        }
                    });
                }
                prizeDlg = dialog;
                prizeDlg.show();
                prizeDlg.on("posthide", function(){
                    prizeDlg.destroy();
                });
            },
            error:function(){
                alert("通信に失敗しちゃった！後でもう一度試してね  error:1019");
                appTab.setActiveTab(0);
            }
        });
    });
}
//秋のキャンペーン応募フォームを開く終わり
     

//秋のキャンペーン
//店舗詳細情報
function popupRestDatail(id) {
    //既にrestDetailDlgがある生成されている場合、successだけだとajaxが通信してくれないのでtrue と elseの両方に処理を各
    //修正 : dataがあるとないとで全く同じ処理を書いているので関数化する。20161029未修正
    if(restDetailDlg != null){
        $.ajax({
            url: "http://nishi.isc.ac.jp/nishimaroApi/shop/getRestDetail.php?restId=" + id,
            type: "GET",
            dataType: "json",
            success: function(data){
                //店舗名が長いときに枠を大きくして対応する 検証にiphone5sを使用 20161029別の端末で検証していないので要検証 
                if(data.name.length>10){
                    $("#shopName").css("fontSize","1.1em");
                    $("#shopName").css("padding","0.3em");
                    $("#shopName").css("word-wrap","break-word");
                    // alert(data.name.length);
                }
                var img_url;
                //店舗の画像がDBに登録されていれば差し替える
                //バグ : 写真のある店舗の詳細Dlgを参照した後に写真のない店舗を参照すると直前にみた写真のある店舗の写真が参照されるバグがある 20161029未修正
                if(data.image!=null){
                    img_url="http://nishi.isc.ac.jp/images/shopImage/"+data.image;
                    $("#shopImage").attr("src",img_url);
                }else{
                    $("#shopImage").attr("src","img/nishimaro2.png");
                }
                $("#shopName").text(data.name);
                $("#couponContent").html(data.content);
                $("#couponOpenTime").text(data.openTime);
                $("#couponCloseTime").text(data.closeDay);
                $("#couponDatail").html(data.detail);
                $("#couponAddress").text(data.address);
                $("#couponTell").text(data.tell);
                //割引サービスがないことが明確にわかっている場合
                if(data.content=="キャンペーン期間のサービスはありません"){
                    $("#couponMsg").next("hr").remove();
                    $("#couponMsg").remove();
                    $("#couponContent").text(data.content);
                }
                //割引サービスがないことが明確にわかっておらず、DB上で空白になっている場合
                if(data.content==null||data.content==""){
                    $("#couponMsg").next("hr").remove();
                    $("#couponMsg").remove();
                    $("#couponOtoku").next("hr").remove();
                    $("#couponOtoku").remove();                   
                }
                restDetailDlg.show();
            },
            error: function(){
                alert("通信に失敗しちゃった！後でもう一度試してね  error:1006");
                waitmodal.hide();
                appTab.setActiveTab(0);
            }
        });
    }
    else{
        ons.createDialog('restDetail.html').then(function (dialog) {
            restDetailDlg = dialog;
            $.ajax({
                url: "http://nishi.isc.ac.jp/nishimaroApi/shop/getRestDetail.php?restId=" + id,
                type: "GET",
                dataType: "json",
                success: function(data){
                    if(data.name.length>10){
                        $("#shopName").css("fontSize","1.1em");
                        $("#shopName").css("padding","0.3em");
                        $("#shopName").css("word-wrap","break-word");
                        // alert(data.name.length);
                    }
                    var img_url;
                    if(data.image!=null){
                        img_url="http://nishi.isc.ac.jp/images/shopImage/"+data.image;
                        $("#shopImage").attr("src",img_url);
                    }
                    $("#shopName").text(data.name);
                    $("#couponContent").html(data.content);
                    $("#couponOpenTime").text(data.openTime);
                    $("#couponCloseTime").text(data.closeDay);
                    $("#couponDatail").html(data.detail);
                    $("#couponAddress").text(data.address);
                    $("#couponTell").text(data.tell);
                    if(data.content=="キャンペーン期間のサービスはありません"){
                        $("#couponMsg").next("hr").remove();
                        $("#couponMsg").remove();
                        $("#couponContent").text(data.content);
                    }
                    if(data.content==null||data.content==""){
                        $("#couponMsg").next("hr").remove();
                        $("#couponMsg").remove();
                        $("#couponOtoku").next("hr").remove();
                        $("#couponOtoku").remove();                   
                    }
                	restDetailDlg.show();
                },
                error: function(){
                    //alert("通信に失敗しちゃった！後でもう一度試してね  error:1006");
                    waitmodal.hide();
                    appTab.setActiveTab(0);
                }
        	});
        });
    }
}
//秋のキャンペーン終わり



