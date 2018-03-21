function parse(text)
{
    // 頂点配列
    var pos = [];
    // 法線配列
    var normal = [];
    // 頂点Index配列
    var vertexIndexList = [];
    // 法線頂点Index配列
    var normalIndexList = [];
    // objファイルテキストを行単位で格納した配列
    var textArray = text.split(/\r\n|\r|\n/);

    // 法線Vector3配列
    var normalVector3List = [];

    var indexDataList = [];

    for (var i = 0; i < textArray.length; i++)
    {
        var line = textArray[i];
        if (line.indexOf('v ') === 0)
        {
            // vertex
            var tmp = line.split(' ');
            // 0番目は `v`なので無視
            pos.push(tmp[1]);
            pos.push(tmp[2]);
            pos.push(tmp[3]);
        } 
        else if (line.indexOf('vn ') === 0)
        {
            // normal
            var tmp = line.split(' ');
            // 0番目は `vn`なので無視
            normalVector3List.push({
                "x":tmp[1], "y":tmp[2],"z":tmp[3]
            });
        } 
        else if (line.indexOf('f ') === 0)
        {
            // index
            var tmp = line.split(' ');
            // 0番目は `f `なので無視
            var p0 = tmp[1].split("/");
            var p1 = tmp[2].split("/");;
            var p2 = tmp[3].split("/");;

            indexDataList.push({
                "v":p0[0] - 1,
                "n":p0[2] - 1
            });
            indexDataList.push({
                "v":p1[0] - 1,
                "n":p1[2] - 1
            }); 
            indexDataList.push({
                "v":p2[0] - 1,
                "n":p2[2] - 1
            });
            vertexIndexList.push(p0[0] - 1);
            vertexIndexList.push(p1[0] - 1);
            vertexIndexList.push(p2[0] - 1);
        }
    }
    // 面法線情報を頂点法線に変換する
    var vertCnt = pos.length / 3;
    for(var vertexIndexNum = 0; vertexIndexNum < vertCnt; vertexIndexNum++)
    {
        var normalIndexList = [];
        for (var i = 0; i < indexDataList.length; i++)
        {
            var indexData = indexDataList[i];
            if (indexData["v"] == vertexIndexNum)
            {
                var normalIndex = indexData["n"];
                if (normalIndexList.indexOf(normalIndex) < 0)
                {
                    // 法線Index配列
//                    normalIndexList.push(normalIndex);
                }
                   normalIndexList.push(normalIndex);
            }
        }
        
        var rx = 0;
        var ry = 0;
        var rz = 0;
        for (var i = 0; i < normalIndexList.length; i++)
        {
            var normalIndex = normalIndexList[i];
            var normalVector = normalVector3List[normalIndex];
            rx += parseFloat(normalVector["x"]);
            ry += parseFloat(normalVector["y"]);
            rz += parseFloat(normalVector["z"]);
        }
        // 正規化
        var distance = Math.sqrt(rx*rx + ry*ry + rz*rz);
        normal.push(rx/distance);
        normal.push(ry/distance);
        normal.push(rz/distance);
    }
    
    return {
        "position": pos,
        "index": vertexIndexList,
        "normal": normal
    };
}