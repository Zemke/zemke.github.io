function onLoad() {
    document.addEventListener('click', function (event) {

        var isAppleStandalone = !!(window.navigator && window.navigator.standalone);
        var isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        var standalone = isAppleStandalone || isStandalone;

        // if (!standalone) {
        //     return;
        // }

        noddy = event.target;

        // Bubble up until we hit link or top HTML element. Warning: BODY element is not compulsory so better to stop on HTML
        while (noddy.nodeName !== "A" && noddy.nodeName !== "HTML") {
            noddy = noddy.parentNode;
        }

        if ('href' in noddy === -1) {
            return;
        }


        if (noddy.target === '_blank' || (noddy.href.indexOf('http') !== -1 && noddy.href.indexOf(document.location.host) === -1)) {
            if (!isAppleStandalone) {
                event.preventDefault();
                window.open(noddy.href, '_blank');
            }
        } else {
            event.preventDefault();
            document.location.href = noddy.href;
        }
    }, false);

}
