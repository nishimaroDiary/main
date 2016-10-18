var collections = null;
var currentIdx = 0;

$(document).on("pageinit", "#collection_page", function(){
    var w;
    waitmodal.show();
    $.ajax({
    //  url: "http://52.193.132.4/upload2/getCollectionsNew.php?userId=" + window.localStorage.getItem("userId"),
        url: "http://nishi.isc.ac.jp/upload2/getCollectionsNew.php?userId=" + window.localStorage.getItem("userId"),
        type: "GET",
        dataType: "json",
        success: function(data){
            waitmodal.hide();
            collections = data;
            var row_count;
            w = "<ons-row>";
            for(var i = 0; i < data.length; i++){
                if(i != 0 && i % 4 == 0){
                    w = w+ '</ons-row>';
                    w = w+'<ons-row>';
                }
                if(data[i].visitedDateTime == null){
                    data[i].col_title = "まだ見つけてないよ";
                    data[i].col_comment = "";
                    data[i].col = "unlock.png";
                }
                w = w + '<ons-col>';
                w = w + '   <div style="padding:0px 5px 0px 5px"><div class="box">';
//                if(data[i].visitedDateTime == null){
//                    w = w + '       <img class="collectionThumbs" id="c'+data[i].id+'" src="http://52.193.132.4/images/'+data[i].col+'">';
//                }else{
                    w = w + '       <img class="collectionThumbs" id="c'+i+'" src="http://52.193.132.4/images/t_'+data[i].col+'">';
//                }
                w = w + '   </div></div>';
                w = w + '</ons-col>';
            }
            if(i % 4 != 0){
                for(; i % 4 != 0; i++) w = w + '<ons-col><div style="padding:0px 5px 0px 5px"></div></ons-col>';
                w = w + "</ons-row>";
            }
            
            $("#collectionList").html(w);
            
            ons.compile($("#collectionList")[0]);
            
            $("#collectionList .collectionThumbs").click(function(){
                currentIdx = $(this).attr("id").substr(1);
                ons.createDialog('collectionDetail.html').then(function (collectionDlg) {
                    $("#collectionImage").attr("src", "http://nishi.isc.ac.jp/images/" + collections[currentIdx].col);
                    $("#collectionTitle").text(collections[currentIdx].col_title);
                    $("#collectionDescription").text(collections[currentIdx].col_comment);
                    collectionDlg.show();
                    collectionDlg.on("posthide", function(){
                        collectionDlg.destroy();
                    });
                    $("#collectionDlgCloseBtn").click(function(){
                        collectionDlg.destroy();
                    });
                });
            });
        },
        error: function(){
            alert("通信に失敗しちゃった！後でもう一度試してね");
            waitmodal.hide();
            appTab.setActiveTab(0);
        }
    });
    return;
});
