const app = new SuperAnki();
window.app = app;
app.init().catch(err => {
    console.error(err);
    const boot = document.getElementById('boot');
    if (boot) boot.innerHTML = `Oups, le chargement a échoué : ${esc(err.message)}. <br><button class="btn btn-primary" style="margin-top:12px" onclick="location.reload()">Recharger</button>`;
});
