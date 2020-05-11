function scrollimate(element, elemOffset = 100, delay = 500) {
  isInViewport(element, elemOffset) && setTimeout(() => element.classList.add('inViewport'), delay);
}

window.addEventListener('scroll', () => {
  scrollimate(document.querySelector('nav.navbar .nav-items'), 25, 0);
  scrollimate(document.getElementById('worksContainer'), 120, 200);
  document.getElementById('specsContainer')
    .childNodes.forEach(elem => scrollimate(elem));
  scrollimate(document.getElementById('serviceContainer'), 200, 500);
});

function isInViewport(el, offset) {
  let top = el.offsetTop;
  let left = el.offsetLeft;
  const width = el.offsetWidth;
  const height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top + offset < (window.pageYOffset + window.innerHeight) &&
    left < (window.pageXOffset + window.innerWidth) &&
    (top + height) > window.pageYOffset &&
    (left + width) > window.pageXOffset
  );
}
