(function () {
    const DURATION = 800;      // ms da animação (maior = mais lento)
    let animating = false;
    let lockUntil = 0;

    function getTargets() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const tops = [...document.querySelectorAll('.snap-section')]
            .map(s => Math.round(s.getBoundingClientRect().top + window.scrollY));
        tops[0] = 0;           // topo da página
        tops.push(max);        // footer (fim da página)
        return [...new Set(tops.map(t => Math.max(0, Math.min(t, max))))]
            .sort((a, b) => a - b);
    }

    function goTo(y) {
        animating = true;
        const start = window.scrollY;
        const dist = y - start;
        const t0 = performance.now();

        function step(now) {
            const p = Math.min((now - t0) / DURATION, 1);
            const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
            window.scrollTo({ top: start + dist * e, behavior: 'instant' });
            if (p < 1) {
                requestAnimationFrame(step);
            } else {
                animating = false;
                lockUntil = performance.now() + 150; // ignora a "inércia" do mouse/touchpad
            }
        }
        requestAnimationFrame(step);
    }

    function move(dir) {
        const targets = getTargets();
        const y = window.scrollY;
        let idx = 0;
        targets.forEach((t, i) => {
            if (Math.abs(t - y) < Math.abs(targets[idx] - y)) idx = i;
        });
        const next = Math.max(0, Math.min(idx + dir, targets.length - 1));
        if (next !== idx || Math.abs(targets[next] - y) > 2) goTo(targets[next]);
    }

    window.addEventListener('wheel', function (e) {
        if (window.innerWidth < 768) return;            // no celular, rolagem normal
        e.preventDefault();
        if (animating || performance.now() < lockUntil) return;
        if (Math.abs(e.deltaY) < 4) return;
        move(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    window.addEventListener('keydown', function (e) {
        if (window.innerWidth < 768) return;
        if (/input|textarea|select/i.test(e.target.tagName)) return;
        const down = ['ArrowDown', 'PageDown', ' '];
        const up = ['ArrowUp', 'PageUp'];
        if (down.includes(e.key) || up.includes(e.key)) {
            e.preventDefault();
            if (!animating) move(down.includes(e.key) ? 1 : -1);
        }
    });
})();