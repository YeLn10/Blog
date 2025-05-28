document.getElementById("edit").addEventListener('click', async (e) => {
    e.preventDefault();
    const Time=document.getElementById("edit_index").innerHTML;
    
    const response1 = await fetch('http://localhost:5500/createChangeEditor', {//liveserver默认端口（当然可以改）
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({Time})
        // json格式要对!
    });//await必须有返回值！
    window.location.href = '../changeditor.html';
    const response2 = await fetch('http://localhost:5500/deleteHTML', {//liveserver默认端口（当然可以改）
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({Time})
        // json格式要对!
    });
});

document.getElementById("delete").addEventListener('click', async (e) => {
    e.preventDefault();
    const Time=document.getElementById("edit_index").innerHTML;
    
    const response1 = await fetch('http://localhost:5500/deleteBlog', {//liveserver默认端口（当然可以改）
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({Time})
        // json格式要对!
    });
    window.location.href = '../list.html';
    const response2 = await fetch('http://localhost:5500/deleteHTML', {//liveserver默认端口（当然可以改）
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({Time})
        // json格式要对!
    });
});
