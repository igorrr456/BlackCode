(function () {
    var itens = document.querySelectorAll('.reveal');
    if (!itens.length) return;

    
    var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduzir) return;

    document.body.classList.add('js-reveal');   

    var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });

    itens.forEach(function (el) { obs.observe(el); });
})();
