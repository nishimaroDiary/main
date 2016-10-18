var rankingType;

function getRanking(){
    waitmodal.show();
    $.ajax({
        url: "http://52.193.132.4/upload2/getRankingType.php",
        type: "GET",
        dataType: "json",
        success: function(data){
            waitmodal.hide();
            rankingType = data;
            var w = "";
            for(var i = 0; i < data.length; i++){
                w = w + "<option value='" + data[i].id + "'>" + data[i].name + "</option>";
            }
            $("#rankingType").html(w);
            showRanking(data[0].id);
        },
        error: function(){
           // alert("通信に失敗しちゃった！後でもう一度試してね  error:1008");
            waitmodal.hide();
            rankingDlg.hide();
            appTab.setActiveTab(0);
        }
    });

    $("#rankingType").change(function(){
        var id = $("#rankingType option:selected").val(); 
        showRanking(id);
    });
    
    $("#rankingHelpBtn").click(function(){
       var idx = $("#rankingType").prop("selectedIndex");
       alert(rankingType[idx].help);
    });
    
/*
    var $rankingElm = document.getElementById("rankingArea");
    var $hammerObj = new Hammer($rankingElm);

    //swipe
    $hammerObj.on("swiperight", function(event) {
        
    });
    $hammerObj.on("swipeleft", function(event) {
        
    });
*/

}

function showRanking(id){
    waitmodal.show();
    $.ajax({
        url: "http://nishi.isc.ac.jp/upload2/getRanking.php?id="+id,
        type: "GET",
        dataType: "json",
        success: function(data){
            var rank;
            waitmodal.hide();
            $("#rankingList").text("");
            for(var i = 0; i < data.records.length; i++){
                if(data.rankType == 'time'){
                    if(!(i >= 1 && data.records[i].lastDateTime == data.records[i-1].lastDateTime)) rank = i + 1
                    var dt = data.records[i].lastDateTime;
                    dt = dt.substr(5,2) + "/" + dt.substr(8,2) + " " + dt.substr(11,5);
                    var w = "<tr><td style='text-align:center'>" + rank + "位</td><td>" + data.records[i].nickname + "</td><td>" + dt + "</td></tr>";
                }
                else if(data.rankType == 'count'){
                    if(!(i >= 1 && data.records[i].cnt == data.records[i-1].cnt)) rank = i + 1
                    var cnt = data.records[i].cnt;
                    var w = "<tr><td style='text-align:center'>" + rank + "位</td><td>" + data.records[i].nickname + "</td><td>" + cnt + "カ所</td></tr>";
                }
                else if(data.rankType == 'score'){
                    if(!(i >= 1 && data.records[i].score == data.records[i-1].score)) rank = i + 1
                    var score = data.records[i].score;
                    var w = "<tr><td style='text-align:center'>" + rank + "位</td><td>" + data.records[i].nickname + "</td><td style='text-align:right'>" + score + "pt</td></tr>";
                }
                $("#rankingList").append(w);
            }
            if(i == 0){
                $("#rankingList").append("<tr><td colspan='3'>該当者はまだいません</td></tr>");
            }
        },
        error: function(){
         //   alert("通信に失敗しちゃった！後でもう一度試してね  error:1008");
            waitmodal.hide();
            rankingDlg.hide();
            appTab.setActiveTab(0);
        }
    });
}