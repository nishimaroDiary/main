$(document).on("pageinit", "#collection_page", function(){
    waitmodal.show();
    $.ajax({
    //  url: "http://52.193.132.4/upload2/getCollections.php?userId=" + window.localStorage.getItem("userId"),
        url: "http://nishi.isc.ac.jp/upload2/getCollections.php?userId=" + window.localStorage.getItem("userId"),
        type: "GET",
        dataType: "json",
        success: function(data){
            waitmodal.hide();
            $("#collectionList").text("");
            for(var i = 0; i < data.length; i++){
                if(data[i].visitedDateTime == null){
                    data[i].col_title = "まだ見つけてないよ";
                    data[i].col_comment = ""
                    data[i].col = "img/unlock.jpg";
                }
                var w = '<div class="box"> ';
                w = w + '    <img src="http://nishi.isc.ac.jp/images/' + data[i].col + '"> ';
                w = w + '    <div class="inner"> ';
                w = w + '        <div class="js-heightLine-1"> ';
                w = w + '            <p class="title">'+data[i].col_title+'</p> ';
                w = w + '            <p class="comment">'+data[i].col_comment+'</p> ';
                w = w + '        </div> ';
                w = w + '    </div> ';
                w = w + '</div>';
                $("#collectionList").append(w);
            }
        },
        error: function(){
            alert("通信に失敗しちゃった！後でもう一度試してね error:1001");
            waitmodal.hide();
            appTab.setActiveTab(0);
        }
    });
    return;
});
