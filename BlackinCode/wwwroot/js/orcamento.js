(function () {
    "use strict";

    const root = document.getElementById("orc");
    if (!root) return;

    // Perguntas e valores vêm do C# (CatalogoOrcamento) pelo <script id="orcamento-dados"> da view.
    const steps = JSON.parse(document.getElementById("orcamento-dados").textContent);
    const WHATSAPP = root.dataset.whatsapp;
    const URL_CALCULAR = root.dataset.calcularUrl;

    const bodyEl = document.getElementById("orcBody");
    const backBtn = document.getElementById("orcBack");
    const countEl = document.getElementById("orcCount");
    const prog = document.getElementById("orcProg");

    const ICONS = {
        landing: "M3 5h18v14H3z M3 9h18 M7 13h5 M7 16h8",
        site: "M4 21V5l8-2 8 2v16 M9 9h2 M13 9h2 M9 13h2 M13 13h2 M10 21v-4h4v4",
        loja: "M3 4h2l2.4 11h10.2L20 7H6 M9 20.5a.5.5 0 100-1 .5.5 0 000 1 M17 20.5a.5.5 0 100-1 .5.5 0 000 1",
        sistema: "M12 2l9 5-9 5-9-5 9-5z M3 12l9 5 9-5 M3 17l9 5 9-5",
        plus: "M12 5v14 M5 12h14",
        chevrons: "M6 5l7 7-7 7 M12 5l7 7-7 7",
        chart: "M4 20h16 M7 16v-5 M12 16V7 M17 16V4",
        check: "M5 12.5l4.5 4.5L19 7",
        x: "M6 6l12 12 M18 6L6 18",
        file: "M7 3h7l4 4v14H7z M14 3v4h4",
        files: "M8 7h7l3 3v11H8z M5 17V4h7",
        grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
        mail: "M3 6h18v12H3z M3 7l9 7 9-7",
        blog: "M5 4h14v16H5z M8 9h8 M8 13h8 M8 17h5",
        lock: "M6 11h12v9H6z M8 11V8a4 4 0 018 0v3",
        card: "M3 6h18v12H3z M3 10h18 M7 15h4",
        dash: "M4 4h6v9H4z M14 4h6v5h-6z M14 11h6v9h-6z M4 15h6v5H4z",
        search: "M11 4a7 7 0 100 14 7 7 0 000-14z M16 16l5 5",
        clock: "M12 3a9 9 0 100 18 9 9 0 000-18z M12 7v5l3 2",
        bolt: "M13 2L4 14h7l-1 8 9-12h-7z"
    };

    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const icon = k => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[k] || ""}"/></svg>`;
    const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    const money = n => BRL.format(n).replace(/ /g, " ");

    let idx = 0, answers = {}, timer = null, calcTicket = 0;
    let shown = 0, raf = 0;

    const chosen = step => step.opcoes.filter(o => (answers[step.id] || []).includes(o.id));
    const stepValue = step => chosen(step).reduce((s, o) => s + o.valor, 0);
    const parcial = () => steps.reduce((s, st) => s + stepValue(st), 0);

    function paint(n) {
        root.querySelectorAll(".js-total").forEach(el => { el.textContent = money(n); });
    }
    function tween(to) {
        cancelAnimationFrame(raf);
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) { shown = to; paint(to); return; }
        const from = shown, t0 = performance.now(), dur = 450;
        const tick = now => {
            const p = Math.min(1, (now - t0) / dur);
            shown = from + (to - from) * (1 - Math.pow(1 - p, 3));
            paint(Math.round(shown));
            if (p < 1) raf = requestAnimationFrame(tick); else { shown = to; paint(to); }
        };
        raf = requestAnimationFrame(tick);
    }

    function stepHTML(step) {
        const sel = answers[step.id] || [];
        const multi = step.multipla;
        const opts = step.opcoes.map(o => {
            const p = step.base ? money(o.valor) : (o.valor ? "+ " + money(o.valor) : "Incluso");
            return `<button type="button" class="orc-opt" role="${multi ? "checkbox" : "radio"}" aria-checked="${sel.includes(o.id)}" data-id="${esc(o.id)}">
                <span class="orc-orb">${icon(o.icone)}</span>
                <span class="orc-lbl">${esc(o.rotulo)}</span><span class="orc-bar"></span><span class="orc-price">${p}</span>
            </button>`;
        }).join("");
        return `<span class="orc-rule"></span>
            <h2 class="orc-q" tabindex="-1">${esc(step.titulo)}</h2>
            ${step.dica ? `<p class="orc-hint">${esc(step.dica)}</p>` : ""}
            <div class="orc-opts" role="${multi ? "group" : "radiogroup"}" aria-label="${esc(step.titulo)}">${opts}</div>
            ${multi ? `<button type="button" class="btn btn-light btn-lg rounded-pill fw-semibold px-5" data-next>Continuar</button>` : ""}`;
    }

    function whatsappLink(data) {
        const linhas = data.itens.map(i => `- ${i.etapa}: ${i.escolhas.length ? i.escolhas.join(", ") : "Nenhuma"}`);
        const msg = `Olá! Fiz uma simulação de orçamento no site da Black in Code.\n\n${linhas.join("\n")}\n\nTotal estimado: ${money(data.total)}`;
        return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    }

    function resultHTML(data) {
        const rows = data.itens.map((i, n) => {
            const base = steps[n] && steps[n].base;
            return `<div class="orc-row"><dt>${esc(i.etapa)}</dt>
                <dd>${i.escolhas.length ? esc(i.escolhas.join(", ")) : "Nenhuma"}</dd>
                <dd class="v">${base ? "" : "+ "}${money(i.valor)}</dd></div>`;
        }).join("");
        return `<span class="orc-rule"></span>
            <h2 class="orc-q" tabindex="-1">Seu orçamento ficou assim</h2>
            <div class="orc-res-total"><small>Investimento estimado</small><span class="js-total">${money(data.total)}</span></div>
            <dl class="orc-sum">${rows}</dl>
            <p class="orc-note">Valor estimado a partir das opções escolhidas. O valor final é confirmado depois de uma conversa sobre o projeto.</p>
            <div class="orc-actions">
                <a class="btn btn-light btn-lg rounded-pill fw-semibold px-5" href="${whatsappLink(data)}" target="_blank" rel="noopener">Falar no WhatsApp</a>
                <button type="button" class="btn btn-outline-light btn-lg rounded-pill px-4" data-restart>Refazer orçamento</button>
            </div>`;
    }

    async function showResult() {
        const ticket = ++calcTicket;
        bodyEl.innerHTML = `<span class="orc-rule"></span><h2 class="orc-q" tabindex="-1">Calculando seu orçamento…</h2>`;
        const payload = {};
        steps.forEach(st => { payload[st.id] = answers[st.id] || []; });
        try {
            const res = await fetch(URL_CALCULAR, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("falha");
            const data = await res.json();
            if (ticket !== calcTicket || idx !== steps.length) return;
            bodyEl.innerHTML = resultHTML(data);
            tween(data.total);
        } catch (e) {
            if (ticket !== calcTicket || idx !== steps.length) return;
            bodyEl.innerHTML = `<span class="orc-rule"></span>
                <h2 class="orc-q" tabindex="-1">Não foi possível calcular agora</h2>
                <p class="orc-note">Confira sua conexão e tente de novo.</p>
                <div class="orc-actions">
                    <button type="button" class="btn btn-light btn-lg rounded-pill fw-semibold px-5" data-retry>Tentar de novo</button>
                </div>`;
        }
        const h = bodyEl.querySelector("h2");
        if (h) h.focus({ preventScroll: true });
    }

    function render() {
        const last = idx === steps.length;
        backBtn.style.visibility = idx === 0 ? "hidden" : "visible";
        countEl.innerHTML = last ? "Resumo" : `<b>${idx + 1}</b>/${steps.length}`;
        prog.style.width = (last ? 100 : ((idx + 1) / (steps.length + 1)) * 100) + "%";
        root.scrollTop = 0;
        tween(parcial());
        if (last) { showResult(); return; }
        bodyEl.innerHTML = stepHTML(steps[idx]);
        const h = bodyEl.querySelector("h2");
        if (h) h.focus({ preventScroll: true });
    }

    function next() { clearTimeout(timer); if (idx < steps.length) { idx++; render(); } }
    function back() { clearTimeout(timer); calcTicket++; if (idx > 0) { idx--; render(); } }

    function pick(id) {
        const step = steps[idx];
        const atual = answers[step.id] || [];
        if (!step.multipla) {
            answers[step.id] = [id];
            bodyEl.querySelectorAll(".orc-opt").forEach(b => b.setAttribute("aria-checked", String(b.dataset.id === id)));
            tween(parcial());
            clearTimeout(timer);
            timer = setTimeout(next, 100);
        } else {
            answers[step.id] = atual.includes(id) ? atual.filter(x => x !== id) : [...atual, id];
            const b = Array.from(bodyEl.querySelectorAll(".orc-opt")).find(x => x.dataset.id === id);
            if (b) b.setAttribute("aria-checked", String(answers[step.id].includes(id)));
            tween(parcial());
        }
    }

    backBtn.addEventListener("click", back);
    bodyEl.addEventListener("click", e => {
        const o = e.target.closest(".orc-opt");
        if (o) return pick(o.dataset.id);
        if (e.target.closest("[data-next]")) return next();
        if (e.target.closest("[data-retry]")) return showResult();
        if (e.target.closest("[data-restart]")) { calcTicket++; answers = {}; idx = 0; render(); }
    });

    render();
})();
