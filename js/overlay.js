const outsideClickEventHandler = function (e) {
    return e.target.classList.contains('work-description') && e.target.classList.contains('on') && closeOverlay();
};

const EscapeKeyDownEventHandler = function (e) {
    return e.key === 'Escape' && document.querySelector('.work-description.on') != null && closeOverlay();
};

function openOverlay(elem) {
    const overlayElem = document.getElementById(elem.id + '-overlay');
    document.body.classList.toggle('noscroll', true);
    overlayElem.classList.toggle('on', true);
    setTimeout(function () {
        return overlayElem.scrollTop = 0;
    }, 1000);

    const lazyImages = overlayElem.querySelectorAll('img.lazy').forEach(function (lazyImage) {
        lazyImage.src = lazyImage.dataset.src;
        lazyImage.classList.remove("lazy");
    });

    overlayElem.addEventListener('click', outsideClickEventHandler);
    window.addEventListener('keydown', EscapeKeyDownEventHandler);
}

function closeOverlay() {
    document.body.classList.toggle('noscroll', false);
    const overlayElem = document.querySelector('.work-description.on');
    overlayElem.classList.toggle('on', false);
    overlayElem.removeEventListener('click', outsideClickEventHandler);
    window.removeEventListener('keydown', EscapeKeyDownEventHandler);
}

