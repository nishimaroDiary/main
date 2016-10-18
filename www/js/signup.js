
function signup(inputName){
    var id = window.localStorage.getItem("userId")
    var num = {requestName : inputName, userId : id};
    
    waitmodal.show();
    $.ajax({
        type: "POST",
        url: "http://nishi.isc.ac.jp/login2/signup.php",
        data: num,
        success: function(randomNum)
        {
            waitmodal.hide();
            window.localStorage.setItem("userId", randomNum);
            window.localStorage.setItem("userName", inputName);
            $("#nameArea").text(inputName);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown)
        {
           // alert("通信に失敗しちゃった！後でもう一度試してね  error:1009");
            waitmodal.hide();
            appTab.setActiveTab(0);
        }
    });
}

function nameCheck(){
    var msg = "<div>ニックネーム：" + window.localStorage.getItem("userName") + "<br>識別番号：" + window.localStorage.getItem("userId") + "<br></div>";
    
    ons.notification.alert({
        messageHTML: msg,
        title: '登録情報確認',
        buttonLabel: 'OK',
        animation: 'default', // もしくは'none'
        callback: function() {
        
        }
    });
}