const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')
const fs = require('fs');
const { reverse } = require('dns');
const app = express();
const PORT = 5500;//liveserver默认端口
app.use(cors());
app.use(bodyParser.json());

const TIME = "listmaterial\\time";
const ABSTRACT = "listmaterial\\abstract";
const TITLE = "listmaterial\\title";
const timeFont = "<span style=\"font-size: 0.4em; color: #888;\">";
const abstFont = "<span style=\"font-size: 0.4em;\">";
function filterFile(str) {
    return str.replace(/<[^>]*>/g, '').replace(/\n/g, '');
}
function readFile(folderPath) {
    try {
        // 同步读取文件夹中的所有文件和文件夹
        const files = fs.readdirSync(folderPath).sort();
        files.reverse();

        const fileContents = [];
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const content = filterFile(fs.readFileSync(filePath, 'utf8'));
            fileContents.push(content);
        });

        return fileContents;
    } catch (error) {
        console.error('读取文件夹或文件时出错:', error);
        return {};
    }
}
function createList() {
    //创建list,以便编辑
    const time = readFile(TIME);
    const abstract = readFile(ABSTRACT);
    const title = readFile(TITLE);
    const fileName = fs.readdirSync(TIME).sort();
    fileName.reverse();
    const len = time.length;
    const temp1 = fs.readFileSync('template/listtemplate1.txt', { encoding: 'utf8' });
    const temp2 = fs.readFileSync('template/listtemplate2.txt', { encoding: 'utf8' });

    var res = "";
    for (var i = 0; i < len; i++) {
        res = res + "<div class=\"unit\">"
        res = res + "<a href=\"blogtext\\" + fileName[i] + ".html\">" + title[i] + "<\a><br>";
        res = res + timeFont + time[i] + "</span><br>";
        res = res + abstFont + abstract[i] + "</span><br>";
        res = res + "</div>" + "\n";
    }
    res + "...";
    fs.writeFileSync('list.html', temp1 + res + temp2);
    console.log("createList:创建list成功!");
}
app.post('/createblog', (req, res) => {
    const data = req.body;
    const Title = req.body.title;
    // 这个里面highlight.min.js要自己下，不能npm，其他都可以 同时hljs和markdown要启用！
    const temp1 = fs.readFileSync('template/texttemplate1.txt', { encoding: 'utf8' });
    const temp2 = fs.readFileSync('template/texttemplate2.txt', { encoding: 'utf8' });
    const temp3 = fs.readFileSync('template/texttemplate3.txt', { encoding: 'utf8' });
    const moment = require('moment');
    const Time = moment().format('YYYYMMDDHHmmss');
    const titleTime = timeFont + moment().format('YYYY年MM月DD日 HH:mm:ss') + "</span>";
    if (data.title == '') Title = "无标题";


    //realtimeMarkdown是输出的markdown，另两个是html和title!
    //这个是创建listmaterial方便进行操作
    fs.writeFileSync('blogtext/' + Time + '.html', temp1 + "\n# " + Title + "\n" + titleTime + "\n\n---\n<br>\n\n" + data.realtimeMarkdown + temp2 + "\n    <span id=\"edit_index\">" + Time + "</span>\n" + temp3);
    fs.writeFileSync('listmaterial/abstract/' + Time, data.realtimeMarkdown.substring(0, 250));
    fs.writeFileSync('listmaterial/time/' + Time, moment().format('YYYY年MM月DD日 HH:mm:ss'));
    fs.writeFileSync('listmaterial/title/' + Time, Title);
    fs.writeFileSync('listmaterial/text/' + Time, data.realtimeMarkdown);
    createList();
    console.log("createblog:文章创建成功！")
    return;
});
app.post('/createChangeEditor', (req, res) => {
    //这个是编辑
    const Time = req.body.Time;
    //通过Time来读取！

    const abstractPath = 'listmaterial/abstract/' + Time;
    const timePath = 'listmaterial/time/' + Time;
    const titlePath = 'listmaterial/title/' + Time;
    const textPath = 'listmaterial/text/' + Time;
    try {
        const temp1 = fs.readFileSync('template/changetemplate1.txt', { encoding: 'utf8' });
        const temp2 = fs.readFileSync('template/changetemplate2.txt', { encoding: 'utf8' });
        const temp3 = fs.readFileSync('template/changetemplate3.txt', { encoding: 'utf8' });
        const temp4 = fs.readFileSync('template/changetemplate4.txt', { encoding: 'utf8' });
        const text = fs.readFileSync(textPath, { encoding: 'utf8' });
        const title = fs.readFileSync(titlePath, { encoding: 'utf8' });
        fs.writeFileSync('changeditor.html', temp1 + title + temp2 + '\n' + text + temp3 + "\n    <span id=\"edit_index\">" + Time + "</span>\n" + temp4);
        createList();
        console.log('createChangeEditor:文件修改成功!');
        res.send("Success");
    } catch (err) {
        console.error('createChangeEditor:修改文件时出错:', err);
    }
    return;
});
app.post('/changeblog', (req, res) => {
    //编辑blog的app！
    const data = req.body;
    const Time = req.body.Time;
    const Title = req.body.title;
    const titleTime = timeFont + fs.readFileSync('listmaterial/time/' + Time) + "</span>";
    const moment = require('moment');
    const editTime = timeFont + "上一次修改:" + moment().format('YYYY年MM月DD日 HH:mm:ss') + "</span>";
    const temp1 = fs.readFileSync('template/texttemplate1.txt', { encoding: 'utf8' });
    const temp2 = fs.readFileSync('template/texttemplate2.txt', { encoding: 'utf8' });
    const temp3 = fs.readFileSync('template/texttemplate3.txt', { encoding: 'utf8' });
    if (data.title == '') Title = "无标题";


    //realtimeMarkdown是输出的markdown，另两个是html和title!
    //这个是创建listmaterial方便进行操作
    fs.writeFileSync('blogtext/' + Time + '.html', temp1 + "\n# " + Title + "\n" + titleTime + "\n" + editTime + "\n\n---\n<br>\n\n" + data.realtimeMarkdown + temp2 + "\n    <span id=\"edit_index\">" + Time + "</span>\n" + temp3);
    fs.writeFileSync('listmaterial/abstract/' + Time, data.realtimeMarkdown.substring(0, 250));
    fs.writeFileSync('listmaterial/title/' + Time, Title);
    fs.writeFileSync('listmaterial/text/' + Time, data.realtimeMarkdown);
    createList();
    console.log("changeblog:文章创建成功！")
    res.send("Success");
    return;
});
app.post('/deleteBlog', (req, res) => {
    //删除blog
    const Time = req.body.Time;
    //通过Time来读取！

    const abstractPath = 'listmaterial/abstract/' + Time;
    const timePath = 'listmaterial/time/' + Time;
    const titlePath = 'listmaterial/title/' + Time;
    const textPath = 'listmaterial/text/' + Time;
    try {
        fs.unlinkSync(abstractPath);
        fs.unlinkSync(timePath);
        fs.unlinkSync(titlePath);
        fs.unlinkSync(textPath);
        createList();
        console.log('deleteBlog:文件删除成功!');
        res.send("Success");
    } catch (err) {
        console.error('deleteBlog:删除文件时出错:', err);
    }
    return;
});
app.post('/deleteHTML', (req, res) => {
    const Time = req.body.Time;
    const htmlPath = 'blogtext/' + Time + '.html';
    const recyclePath = 'recyclebin/' + Time + '.html';
    //通过延迟删除html实现不有残余，有点蠢
    try {
        fs.writeFileSync(recyclePath, fs.readFileSync(htmlPath, { encoding: 'utf8' }));
        fs.unlinkSync(htmlPath);
        createList();
        console.log('deleteHTML:html删除成功!');
        res.send("Success");
    } catch (err) {
        console.error('deleteHTML:删除html时出错:', err);
    }
    return;
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
/*
todo list:
编辑时逻辑：删除原有文章，用原来的文件名创建一个新的文章，然后重新生成一个文章列表
git上传
处理重名！
更新逻辑，免得每次都要重新修改一遍html！
(例如加载的时候再加入text)
*/