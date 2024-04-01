window.onload = function() {
    const ws = new WebSocket('ws://localhost:1772');
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log(data);
        const table = document.createElement('table');
        table.classList.add('blueTable');
        document.body.appendChild(table);
        data.forEach(row => {
            const tr = document.createElement('tr');
            for (const key in row) {
                const td = document.createElement('td');
                if (key === 'last_post' || key === 'previous_post'){
                    // convert timestamp to datetime
                    const date = new Date(row[key]);
                    td.textContent = date.toLocaleString();
                }
                else{
                    td.textContent = row[key];
                }
                tr.appendChild(td);
            }
            table.appendChild(tr);
        });
        document.body.removeChild(document.querySelector('table'));
    };
};