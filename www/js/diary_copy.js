var currentDiaryId = null;
var prevDiaryId = null;
var nextDiaryId = null;
var photoChooseDlg = null;
var photoType;
var diaryDetailText, pointName;
var photoSrc;

$(document).on("pageinit", "#diary_page", function(){
    //日記目次情報を取得して反映
    waitmodal.show();
    $.ajax({
    //  url: "http://52.193.132.4/upload2/diary_index.php?userId=" + window.localStorage.getItem("userId"),
        url: "http://nishi.isc.ac.jp/upload2/diary_index.php?userId=" + window.localStorage.getItem("userId"),
        type: "GET",
        dataType: "json",
        success: function(data)
        {
            waitmodal.hide();
            var str = "";
            for(var i = 0; i < data.length; i++){
                str = str + "<h2>" + data[i].categoryName + "</h2>\n";
                str = str + "<table style='width:100%'>\n"
                str = str + "<caption>"+data[i].allPoint+"か所中"+data[i].visitedPoints.length+"か所訪問済み</caption>\n";
                
                var points = data[i].visitedPoints;
                for(var j = 0; j < points.length; j++){
                    str = str + "<tr>\n";
                    str = str + "<td>"+points[j].pointId+"</td>\n";
                    str = str + "<td><a class='diaryLink' id='p"+points[j].pointId+"' href='javascript:void(0)'>"+points[j].pointName+"</a></td>\n";
                    str = str + "<td>"+points[j].visitedDateTime.substr(5,5)+"</td>\n";
                    str = str + "</tr>\n";
                }
                str = str + "</table>\n";
            }
            
            $("#diaryIndexArea").html(str);

            $("a.diaryLink").click(function(){
                $("#indexPage").hide();
                $("#diaryPage").show();
                
                var id = $(this).attr("id").substr(1);
                currentDiaryId = id;
                loadDiary();
            });

        },
        error: function(){
            alert("通信に失敗しちゃった！後でもう一度試してね  error:1099");
            waitmodal.hide();
            appTab.setActiveTab(0);
        }
    });

    var $diaryElm = document.getElementById("msg2");
    $hammerObj = new Hammer($diaryElm);

    //swipe
    $hammerObj.on("swiperight", function(event) {
        if(prevDiaryId != null){
            currentDiaryId = prevDiaryId;
            loadDiary();
        }
    });
    $hammerObj.on("swipeleft", function(event) {
        if(nextDiaryId != null){
            currentDiaryId = nextDiaryId;
            loadDiary();
        }
    });
    
  
    prevDiaryId = null;
    nextDiaryId = null;

//    loadDiary();
    
    $("#photoBtn").click(function(){
        ons.createDialog('photoChoose.html').then(function (photoChooseDlg) {
            photoType = -1;
            photoChooseDlg.show();
            photoChooseDlg.on("posthide", function(){
                if(photoType == 1){
                    snapPicture(1);
                }else if(photoType == 2){
                    snapPicture(2);
                }else if(photoType == 3){
                    deletePhoto();
                }
            });
        });
        
    });
    
    $("#diaryNextBtn").click(function(){
        if(nextDiaryId != null){
            currentDiaryId = nextDiaryId;
            loadDiary();
        }
    });
    
    $("#diaryPrevBtn").click(function(){
        if(prevDiaryId != null){
            currentDiaryId = prevDiaryId;
            loadDiary();
        }
    });
    
    $("#openDiaryDetailBtn").click(function(){
        ons.createDialog('diaryDetailDialog.html').then(function (diaryDetailDlg) {
            $("#diaryDetailTitle").text(pointName);
            $("#diaryDetailArea").html(diaryDetailText);
            diaryDetailDlg.on("posthide", function(){
                diaryDetailDlg.destroy();
            });
            $("#diaryDetailDlgCloseBtn").click(function(){
                diaryDetailDlg.destroy();
            });
            diaryDetailDlg.show();
        });
    });
    
    $("#picture2").click(function(){
       alert(photoSrc); 
    });
});

function loadDiary(){
    //POSTメソッドで送るデータを定義します var data = {パラメータ名 : 値};
    var num = {requestA : currentDiaryId};

    waitmodal.show();
    $.ajax({
        type: "POST",
        //url: "http://52.193.132.4/upload2/diary_down.php?userId=" + window.localStorage.getItem("userId"),
        url: "http://nishi.isc.ac.jp/upload2/diary_down.php?userId=" + window.localStorage.getItem("userId"),
        data: num,
        /**
         * Ajax通信が成功した場合に呼び出されるメソッド
         */
        success: function(diary_t)
        {
            waitmodal.hide();
            var diary_t=JSON.parse(diary_t);
            if(diary_t[1] == null){
                return;
            }
            $("#photoBtn").show();
         
            var text = document.getElementById ("msg2");
            text.innerHTML = diary_t[1];
            var image = document.getElementById ('picture2');
            image.src = "data:image/jpeg;base64," + diary_t[0];
            photoSrc = "data:image/jpeg;base64," + diary_t[0];
            var pageing = document.getElementById("page");
            currentDiaryId = diary_t[2];
            pageing.innerHTML = "No." + currentDiaryId;
            prevDiaryId = diary_t[3];
            nextDiaryId = diary_t[4];
            diaryDetailText = diary_t[5];
            pointName = diary_t[6];
        
            if(prevDiaryId == null){
                $("#diaryPrevBtn").attr("src", "img/whitebox.jpg");
            }else{
                $("#diaryPrevBtn").attr("src", "img/prevBtn.png");
            }
            if(nextDiaryId == null){
                $("#diaryNextBtn").attr("src", "img/whitebox.jpg");
            }else{
                $("#diaryNextBtn").attr("src", "img/nextBtn.png");
            }
            
            
            
        },
        error: function(XMLHttpRequest, textStatus, errorThrown)
        {
            alert("通信に失敗しちゃった！後でもう一度試してね  error:1002");
            waitmodal.hide();
            appTab.setActiveTab(0);
        }
    });
}

function snapPicture (type) {
    if(type == 1)
        navigator.camera.getPicture(onSuccess, onFail, { quality: 70, destinationType: Camera.DestinationType.DATA_URL, targetWidth:800, targetHeight:600, saveToPhotoAlbum:true });
    else
        navigator.camera.getPicture(onSuccess, onFail, { quality: 70, destinationType: Camera.DestinationType.DATA_URL, sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM, targetWidth:800, targetHeight:600 });

    //成功した際に呼ばれるコールバック関数
    function onSuccess (imageData) {
        waitmodal.show();
        var postData = { data : imageData };
        $.ajax({
        // url: "http://52.193.132.4/upload2/uploadUsersPhoto.php?userId=" + window.localStorage.getItem("userId") + "&id=" + currentDiaryId,
            url: "http://nishi.isc.ac.jp/upload2/uploadUsersPhoto.php?userId=" + window.localStorage.getItem("userId") + "&id=" + currentDiaryId,
            type: "POST",
            data: postData,
            dataType: "text",
            success: function(data)
            {
                waitmodal.hide();
                var image = document.getElementById('picture2');
                image.src = "data:image/jpeg;base64," + imageData;
            },
            error: function(){
                alert("通信に失敗しちゃった！後でもう一度試してね  error:1003");
                waitmodal.hide();
                appTab.setActiveTab(0);
            }
        });
        return;
    }

    //失敗した場合に呼ばれるコールバック関数
    function onFail (message) {
        alert("カメラが調子悪いみたい。ゴメンね");
    }
}

function deletePhoto(){
    waitmodal.show();
    $.ajax({
    //  url: "http://52.193.132.4/upload2/deleteUserPhoto.php?userId=" + window.localStorage.getItem("userId") + "&diaryId=" + currentDiaryId,
        url: "http://nishi.isc.ac.jp/upload2/deleteUserPhoto.php?userId=" + window.localStorage.getItem("userId") + "&diaryId=" + currentDiaryId,
        type: "GET",
        dataType: "text",
        success: function()
        {
            waitmodal.hide();
            loadDiary();
        },
        error: function(){
            alert("通信に失敗しちゃった！後でもう一度試してね  error:1004");
            waitmodal.hide();
            appTab.setActiveTab(0);
        }
    });
}
