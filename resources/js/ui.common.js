 document.addEventListener('DOMContentLoaded', () => {
    UI.parts.include({
        src: 'header.html',
        dataId: 'header',
        callback:() => {
        }
    });
    UI.parts.include({
        src: 'footer.html',
        dataId: 'footer',
        callback:() => {
        }
    });
    
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