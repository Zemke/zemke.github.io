window.onload = function () {
    /*
     * Navbar stickines
     */

    let header = document.getElementById("navbar");
    let sticky = header.offsetTop;

    window.onresize = function () {
        header = document.getElementById("navbar");
        sticky = header.offsetTop;
    };

    const stickNav = function () {
        if (window.pageYOffset > sticky) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }
    };

    stickNav();
    window.onscroll = stickNav;

    /*
     * Hamburger
     */

    function toggleHamburger() {
        document.getElementById("hamburger").classList.toggle('is-active');
        document.getElementById("nav-items").classList.toggle('is-active');
    }

    document.getElementById("hamburger").onclick = function () {
        return toggleHamburger();
    };

    document.querySelectorAll('#nav-items a')
        .forEach(function (navItem) {
            return navItem.addEventListener('click', e => toggleHamburger());
        });
};
