window.onload = function() {
    const ws = new WebSocket('ws://localhost:1772');
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const table = document.getElementById('table');
        table.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            for (const key in row) {
                const td = document.createElement('td');
                td.textContent = row[key];
                tr.appendChild(td);
            }
            table.appendChild(tr);
        });
    };
};