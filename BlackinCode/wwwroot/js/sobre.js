(function () {
        // Hero ocupa a tela toda (navbar colado) e empurra o resto pra baixo da dobra
        var hero = document.getElementById('aboutHero');
        function ajustar() {
            var nav = document.querySelector('header') || document.querySelector('nav');
            var navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
            hero.style.marginTop = '0px';
            var gap = hero.getBoundingClientRect().top - navBottom;
            if (gap > 0) hero.style.marginTop = (-gap) + 'px';
            hero.style.minHeight = Math.max(window.innerHeight - navBottom, 520) + 'px';
        }
        ajustar();
        window.addEventListener('resize', ajustar);
        window.addEventListener('load', ajustar);

        // Animação de entrada ao rolar
        var itens = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            itens.forEach(function (el) { el.classList.add('visible'); });
            return;
        }
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 });
        itens.forEach(function (el) { obs.observe(el); });
    })();
