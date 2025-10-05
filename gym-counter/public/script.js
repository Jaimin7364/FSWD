const countDisplay = document.getElementById('count');
const increaseBtn = document.getElementById('increase');
const decreaseBtn = document.getElementById('decrease');
const resetBtn = document.getElementById('reset');

async function updateCount() {
    const res = await fetch('/count');
    const data = await res.json();
    countDisplay.textContent = data.count;
}

increaseBtn.addEventListener('click', async () => {
    await fetch('/increase', { method: 'POST' });
    updateCount();
});

decreaseBtn.addEventListener('click', async () => {
    await fetch('/decrease', { method: 'POST' });
    updateCount();
});

resetBtn.addEventListener('click', async () => {
    await fetch('/reset', { method: 'POST' });
    updateCount();
});

updateCount();
