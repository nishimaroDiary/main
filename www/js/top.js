var alertDlg;
var helpDlg;

$(document).on("pageinit", "#top_page", function(){
 
    if(window.sessionStorage.getItem("firstFlag") != "1"){
        window.sessionStorage.setItem("firstFlag", "1");        
        popupAlert();
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
    
    $.ajax({
        url: "http://nishi.isc.ac.jp/upload2/getScore.php?userId=" + window.localStorage.getItem("userId"),
        type: "GET",
        dataType: "json",
        success: function(data)
        {
            $("#totalScore").text(data.totalScore);
            $("#weeklyScore").text(data.weeklyScore);
        },
        error: function(){
          //  alert("通信に失敗しちゃった！後でもう一度試してね  error:1000");
        }
    });
    
    //以下2016秋のキャンペーン200pt処理
    $.ajax({
        //url: "http://nishi.isc.ac.jp/nishimaroApi/autumn/ptCheck.php?userId=" + window.localStorage.getItem("userId"),
        url: "http://nishi.isc.ac.jp/nishimaroApi/autumn/ptCheck.php?userId=1012390326",
        type: "GET",
        dataType: "json",
        success: function(data)
        {
            var status = data['status']
            if(status=='achieve'){
                popAchieve(data['uniqId']);   
            }else if(status=="exist"){
                return;
            }else{
                return;
            }
            
        },
        error: function(){
          //  alert("通信に失敗しちゃった！後でもう一度試してね  error:1000");
        }        
    });
});

function popupAlert(){
//    ons.createDialog('alertMessage.html').then(function (dialog) {
//    	alertDlg = dialog;
//		alertDlg.show();
        
//      alertDlg.on("posthide", function(){
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
//      });
//	});
}

function popupHelp() {
    ons.createDialog('help.html').then(function (dialog) {
		helpDlg = dialog;
		helpDlg.show();
	});
}

//2016秋のキャンペーン200pt達成モーダルウインドウ
function popAchieve(uniqId){
    ons.createDialog('achieve.html').then(function(achieveDialog){
        achieveDialog.show();
        $('#uniqId').text(uniqId);
    });
}



