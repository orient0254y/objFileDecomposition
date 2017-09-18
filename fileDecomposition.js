/**
 * 
 * @authors LiWeiDong (495986719@qq.com)
 * @date    2017-08-16 11:43:40
 * @version v1.0.0.1
 */
var FileDecompositioner = new FileDecomposition();

function FileDecomposition() {
    this.name = null;
    this.filesArray = [];
    this.filesNum = 0;
}
FileDecomposition.prototype.importFile = function(files) {
    if (!window.File && !window.FileList && !window.FileReader && !window.Blob) {
        alert("您的浏览器不支持HTML5上传下载功能！");
        return;
    };
    this.selectedFiles = files.files; //获取读取的File对象
    var _this = this;
    if (this.selectedFiles) {
        for (var i = 0, l = this.selectedFiles.length; i < l; i++) {
            var name = this.selectedFiles[i].name; //读取选中文件的文件名
            // var size = this.selectedFiles[i].size;//读取选中文件的大小
            document.getElementById("file-name").innerHTML = name;
            this.name = name.substring(0,name.lastIndexOf("."));
            var reader = new FileReader(); //这里是核心！！！读取操作就是由它完成的。
            reader.readAsText(this.selectedFiles[i]); //读取文件的内容
            reader.onload = function() {
                var data = this.result;
                _this.encodeFile(data);
            };
        };
    };
};
FileDecomposition.prototype.encodeFile = function(data) {
    var lines = data.split("\n");
    var fisrtLine = lines[0];
    var str = "";
    //如何将一整个object文件分为不同的object的单独文件呢？
    var objArr = [];
    var objText = "";
    var startLine = "";
    var addStartLineFlag = false;
    var startAdd = false;
    var doneRegex = /^\#/;
    //格式：#开头，空白字符结尾
    var specialRegex = /^\#\s+$/;
    var sub_object_name = "";
    for (var i = 0, l = lines.length; i < l; i++) {
        if (lines[i].search("mtllib") !== -1) {
            startAdd = true;
            startLine = lines[i];
            addStartLineFlag = true;
        } else {
            if (doneRegex.test(lines[i])) {
                if (lines[i].search("faces") !== -1 || lines[i].search("polygons") !== -1) {
                    objText += lines[i] + "\n";
                    var obj = {};
                    obj.text = objText;
                    obj.name = sub_object_name;
                    objArr.push(obj);
                    objText = "";
                    sub_object_name = "";
                    addStartLineFlag = true;
                    continue;
                };
            } else {
                if (lines[i].search("usemtl") !== -1) {
                    sub_object_name = (lines[i].substring(lines[i].indexOf("usemtl") + 6,lines[i].length)).replace(/\s/g,"");
                }
                if (addStartLineFlag) {
                    objText += fisrtLine + "\n";
                    objText += "# Beijing blueSummer technology Co., LTD！" + "\r\n";
                    objText += startLine + "\n";
                    addStartLineFlag = false;
                };
                if (startAdd && !specialRegex.test(lines[i])) {
                    objText += lines[i] + "\n";
                };
            };
        };
    };
    for (var i = 0, l = objArr.length; i < l; i++) {
        var text = this.toModifyAStandardFormat(objArr[i].text);
        var name = objArr[i].name;
        var file = {};
        file.text = text;
        file.name = name;
        this.filesArray.push(file);
    };
};
//细化处理每一个单独的object,
FileDecomposition.prototype.toModifyAStandardFormat = function(data) {
    var lines = data.split("\n");
    var result, str = "";
    var flag = true;
    var minNum1 = Infinity;
    var minNum2 = Infinity;
    var minNum3 = Infinity;
    var minNum4 = Infinity;
    // f vertex vertex vertex ...
    var face_pattern1 = /f( +\d+)( +\d+)( +\d+)( +\d+)?/;
    // f vertex/uv vertex/uv vertex/uv ...
    var face_pattern2 = /f( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))?/;
    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
    var face_pattern3 = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))?/;
    // f vertex//normal vertex//normal vertex//normal ...
    var face_pattern4 = /f( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))?/;
    //匹配多个数字
    var numRegex = /\d+/g;
    // 格式： 数字/
    var numRegex1 = /\s\d+\//g;
    //格式：/数字/
    var numRegex2 = /\/\d+\//g;
    //格式：/数字 
    var numRegex3 = /\/\d+\s/g;
    //格式：//
    var numRegex4 = /\/\//g;
    var _this = this;
    for (var i = 0, l = lines.length; i < l; i++) {
        if ((result = face_pattern1.exec(lines[i])) !== null) {
            var face_pattern1_regex = /( +\d+)/g;
            if (flag) {
                var texts = lines[i].match(numRegex);
                minNum1 = Math.min(parseInt(texts[0]), minNum1);
                minNum2 = Math.min(parseInt(texts[1]), minNum2);
                minNum3 = Math.min(parseInt(texts[2]), minNum3);
                if (texts.length === 4) {
                    minNum4 = Math.min(parseInt(texts[3]), minNum4);
                };
                minNum1 = minNum1 > 1 ? minNum1 - 1 : 0;
                minNum2 = minNum2 > 1 ? minNum2 - 1 : 0;
                minNum3 = minNum3 > 1 ? minNum3 - 1 : 0;
                minNum4 = minNum4 > 1 ? minNum4 - 1 : 0;
                flag = false;
            };
            var replaceNum = 0;
            var newLine = lines[i].replace(face_pattern1_regex, function(e) {
                switch (replaceNum) {
                    case 0:
                        replaceNum++;
                        return " " + (parseInt(e.match(numRegex)) - minNum1);
                        break;
                    case 1:
                        replaceNum++;
                        return " " + (parseInt(e.match(numRegex)) - minNum2);
                        break;
                    case 2:
                        replaceNum++;
                        return " " + (parseInt(e.match(numRegex)) - minNum3);
                        break;
                    case 3:
                        replaceNum++;
                        return " " + (parseInt(e.match(numRegex)) - minNum4);
                        break;
                };
            });
            str += newLine + "\n";
        } else if ((result = face_pattern2.exec(lines[i])) !== null) {
            if (flag) {
                var texts = lines[i].match(numRegex);
                for (var j = 0, m = texts.length / 2; j < m; j++) {
                    minNum1 = Math.min(parseInt(texts[j * 2]), minNum1);
                    minNum2 = Math.min(parseInt(texts[j * 2 + 1]), minNum2);
                };
                minNum1 = minNum1 > 1 ? minNum1 - 1 : 0;
                minNum2 = minNum2 > 1 ? minNum2 - 1 : 0;
                flag = false;
            };
            var newLine = lines[i].replace(numRegex1, function(e) {
                return " " + (parseInt(e.match(numRegex)) - minNum1) + "\/";
            });
            newLine = newLine.replace(numRegex3, function(e) {
                return "\/" + (parseInt(e.match(numRegex)) - minNum2) + " ";
            });
            str += newLine + "\n";
        } else if ((result = face_pattern3.exec(lines[i])) !== null) {
            if (flag) {
                var texts = lines[i].match(numRegex);
                for (var j = 0, m = texts.length / 3; j < m; j++) {
                    minNum1 = Math.min(parseInt(texts[j * 3]), minNum1);
                    minNum2 = Math.min(parseInt(texts[j * 3 + 1]), minNum2);
                    minNum3 = Math.min(parseInt(texts[j * 3 + 2]), minNum3);
                };
                minNum1 = minNum1 > 1 ? minNum1 - 1 : 0;
                minNum2 = minNum2 > 1 ? minNum2 - 1 : 0;
                minNum3 = minNum3 > 1 ? minNum3 - 1 : 0;
                flag = false;
            };
            var newLine = lines[i].replace(numRegex1, function(e) {
                return " " + (parseInt(e.match(numRegex)) - minNum1) + "\/";
            });
            newLine = newLine.replace(numRegex2, function(e) {
                return "\/" + (parseInt(e.match(numRegex)) - minNum2) + "\/";
            });
            newLine = newLine.replace(numRegex3, function(e) {
                return "\/" + (parseInt(e.match(numRegex)) - minNum3) + " ";
            });
            str += newLine + "\n";
        } else if ((result = face_pattern4.exec(lines[i])) !== null) {
            if (flag) {
                var texts = lines[i].match(numRegex);
                for (var j = 0, m = texts.length / 2; j < m; j++) {
                    minNum1 = Math.min(parseInt(texts[j * 2]), minNum1);
                    minNum3 = Math.min(parseInt(texts[j * 2 + 1]), minNum3);
                };
                minNum1 = minNum1 > 1 ? minNum1 - 1 : 0;
                minNum2 = minNum2 > 1 ? minNum2 - 1 : 0;
                minNum3 = minNum3 > 1 ? minNum3 - 1 : 0;
                flag = false;
            };
            var newLine = lines[i].replace(numRegex1, function(e) {
                return " " + (parseInt(e.match(numRegex)) - minNum1) + "\/";
            });
            newLine = newLine.replace(numRegex3, function(e) {
                return "\/" + (parseInt(e.match(numRegex)) - minNum3) + " ";
            });
            str += newLine + "\n";
        } else {
            str += lines[i] + "\n";
        };
    };
    return str;
};
//获取文件的对象
FileDecomposition.prototype.getFiles = function() {
    return {
        "filesArray" : this.filesArray,
        "fileName" : this.name,
        "filesNum" : this.filesArray.length
    };
};
//支持html5的浏览器支持导出功能
FileDecomposition.prototype.exportFile = function() {
    var filesArray = this.filesArray;
    if (!filesArray) {
        return;
    };
    var _this = this;
    var i = 0;
    var timer = setInterval(function(){
        var blob = new Blob([filesArray[i].text], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, _this.name + "." + filesArray[i].name + "." + "obj"); //saveAs(blob,filename)
        document.getElementById("file-name").innerHTML = "文件名";
        i ++;
        if (i === filesArray.length) {
            clearInterval(timer);
            this.filesArray = [];
            this.name = null;
        };
    },100);
};