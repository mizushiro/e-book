 document.addEventListener('DOMContentLoaded', () => {
    UI.ebook = {};
    UI.parts.include({
        src: 'header.html',
        dataId: 'header',
        callback:() => {
            UI.exe.toggleUI = new ToggleUI();
        }
    });
    UI.parts.include({
        src: 'footer.html',
        dataId: 'footer',
        callback:() => {
        }
    });

    UI.exe.toggleUI = new ToggleUI();
    
    UI.callback.nav = (v) => {
        console.log(v.state);
        const wrap = document.querySelector('html');

        if (v.state === 'true') {
            wrap.dataset.nav = 'open';
        } else {
            wrap.dataset.nav = 'close';
        }
    }
});