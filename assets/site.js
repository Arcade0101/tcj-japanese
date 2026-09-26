/* 日本語ノート — shared nav behavior + cross-page search.
   Included on every page. Builds one search index from the same data
   each page renders from, so search works no matter which page you're
   currently on. The prefix back to the site root is read off the nav's
   own home link, so this works unmodified at any folder depth. */

(function () {
  function plain(html) {
    return String(html).replace(/<rt>[^<]*<\/rt>/g, "").replace(/<[^>]+>/g, "");
  }

  // ---- hamburger (mobile only; desktop nav is unaffected) ----
  function initNav() {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  // ---- compact search index (same source data as grammar/kanji/vocab pages) ----
  var G_IDX = [
    ["〜た ほうが いいです", "you'd better ~ / it'd be better to ~"],
    ["〜ない ほうが いいです", "you'd better not ~"],
    ["〜ので", "because ~ (polite)"],
    ["「から」と「ので」", "which 'because' to use"],
    ["〜場合は", "in the case of ~, if ~ (formal)"],
    ["〜ないで", "without doing ~"],
    ["〜ても", "even if ~, even though ~"],
    ["〜たら ↔ 〜ても", "expected result vs contrary result"],
    ["〔動詞ます形〕＋ すぎ", "doing something too much"],
    ["〔名詞〕の＋〔ます形〕＋ すぎ", "too much of (a thing)"],
    ["〔形容詞〕＋ すぎます", "too ~ (adjective)"],
    ["〜かもしれません", "might ~, maybe ~ (about 50%)"]
  ];
  var K_IDX = [
    ["駅", "station"], ["電", "electricity"], ["急", "hurry, sudden, express"],
    ["道", "road, way"], ["乗", "ride, get on"]
  ];
  var V_IDX = [
    ["<ruby>売<rt>う</rt></ruby>れます", "うれます", "to be sold, to sell well"],
    ["<ruby>窓側<rt>まどがわ</rt></ruby>", "まどがわ", "window side, window seat"],
    ["<ruby>通路側<rt>つうろがわ</rt></ruby>", "つうろがわ", "aisle side, aisle seat"],
    ["<ruby>一杯<rt>いっぱい</rt></ruby>", "いっぱい", "full, full of"],
    ["<ruby>出<rt>で</rt></ruby>ます［試合に〜］", "でます", "to take part in, to participate"],
    ["ボーナス", "ボーナス", "bonus"],
    ["<ruby>出<rt>で</rt></ruby>ます［ボーナスが〜］", "でます", "(a bonus) is given, comes out"],
    ["<ruby>具合<rt>ぐあい</rt></ruby>", "ぐあい", "condition (of health), state"],
    ["<ruby>早退<rt>そうたい</rt></ruby>します", "そうたいします", "to leave early (work / school)"],
    ["<ruby>下<rt>さ</rt></ruby>がります［熱が〜］", "さがります", "(one's fever) goes down"],
    ["<ruby>謝<rt>あやま</rt></ruby>ります", "あやまります", "to apologize"],
    ["かっこいい", "かっこいい", "cool, good-looking"],
    ["<ruby>操作<rt>そうさ</rt></ruby>", "そうさ", "operation, handling (of a device)"],
    ["<ruby>入管<rt>にゅうかん</rt></ruby>", "にゅうかん", "immigration office"],
    ["<ruby>熱中症<rt>ねっちゅうしょう</rt></ruby>", "ねっちゅうしょう", "heatstroke"],
    ["<ruby>保護者会<rt>ほごしゃかい</rt></ruby>", "ほごしゃかい", "parents' meeting"],
    ["<ruby>書類<rt>しょるい</rt></ruby>", "しょるい", "documents, paperwork"],
    ["<ruby>新幹線<rt>しんかんせん</rt></ruby>", "しんかんせん", "shinkansen, bullet train"],
    ["<ruby>予約<rt>よやく</rt></ruby>します", "よやくします", "to reserve, to book"],
    ["<ruby>狭<rt>せま</rt></ruby>い", "せまい", "narrow, cramped"],
    ["<ruby>軽<rt>かる</rt></ruby>い", "かるい", "light (in weight)"],
    ["<ruby>不便<rt>ふべん</rt></ruby>な", "ふべんな", "inconvenient"],
    ["<ruby>引<rt>ひ</rt></ruby>っ<ruby>越<rt>こ</rt></ruby>します", "ひっこします", "to move house"],
    ["<ruby>寝坊<rt>ねぼう</rt></ruby>します", "ねぼうします", "to oversleep"],
    ["すいています", "すいています", "to be empty, uncrowded"],
    ["<ruby>特急<rt>とっきゅう</rt></ruby>", "とっきゅう", "limited express (train)"],
    ["<ruby>渋滞<rt>じゅうたい</rt></ruby>します", "じゅうたいします", "to be jammed, congested"],
    ["<ruby>調子<rt>ちょうし</rt></ruby>", "ちょうし", "condition, form"],
    ["ダイエット", "ダイエット", "diet"],
    ["<ruby>顔色<rt>かおいろ</rt></ruby>", "かおいろ", "complexion, the look on one's face"],
    ["<ruby>発音<rt>はつおん</rt></ruby>", "はつおん", "pronunciation"],
    ["<ruby>辞<rt>や</rt></ruby>めます［仕事を〜］", "やめます", "to quit (a job)"],
    ["<ruby>過<rt>す</rt></ruby>ごします", "すごします", "to spend (time)"],
    ["<ruby>平気<rt>へいき</rt></ruby>な", "へいきな", "all right, fine, not bothered"],
    ["<ruby>続<rt>つづ</rt></ruby>き", "つづき", "continuation, the rest"],
    ["<ruby>待<rt>ま</rt></ruby>ち<ruby>合<rt>あ</rt></ruby>わせ", "まちあわせ", "meeting up"],
    ["もしかすると", "もしかすると", "possibly, perhaps"],
    ["<ruby>涙<rt>なみだ</rt></ruby>", "なみだ", "tear(s)"],
    ["アルコール", "アルコール", "alcohol"],
    ["<ruby>動画<rt>どうが</rt></ruby>", "どうが", "video"],
    ["<ruby>掃除機<rt>そうじき</rt></ruby>", "そうじき", "vacuum cleaner"],
    ["<ruby>遅刻<rt>ちこく</rt></ruby>します", "ちこくします", "to be late"],
    ["<ruby>健康<rt>けんこう</rt></ruby>", "けんこう", "health"],
    ["<ruby>健康診断<rt>けんこうしんだん</rt></ruby>", "けんこうしんだん", "medical checkup"],
    ["<ruby>仲間<rt>なかま</rt></ruby>", "なかま", "friends, mates"],
    ["<ruby>慣<rt>な</rt></ruby>れます［生活に〜］", "なれます", "to get accustomed to"],
    ["<ruby>寒気<rt>さむけ</rt></ruby>", "さむけ", "a chill"],
    ["します［寒気が〜］", "さむけがします", "to feel a chill"],
    ["<ruby>食中毒<rt>しょくちゅうどく</rt></ruby>", "しょくちゅうどく", "food poisoning"],
    ["<ruby>冷<rt>ひ</rt></ruby>えます", "ひえます", "to get cold, become chilled"],
    ["<ruby>帰<rt>かえ</rt></ruby>り", "かえり", "return, the way back"],
    ["もしかしたら", "もしかしたら", "maybe, perhaps"]
  ];

  function initSearch() {
    var btns = [].slice.call(document.querySelectorAll(".searchbtn"));
    if (!btns.length) return;

    var home = document.querySelector(".sitenav .home");
    var prefix = home ? home.getAttribute("href") : "./";

    var INDEX = []
      .concat(G_IDX.map(function (g) { return { label: g[0], sub: g[1], kind: "文法", href: prefix + "grammar.html?q=" + encodeURIComponent(g[1]) }; }))
      .concat(K_IDX.map(function (k) { return { label: k[0], sub: k[1], kind: "漢字", href: prefix + "kanji.html" }; }))
      .concat(V_IDX.map(function (v) { return { label: plain(v[0]), sub: v[2], kind: "ことば", href: prefix + "vocab.html?q=" + encodeURIComponent(v[1]) }; }))
      .concat([{ label: "第1回「〜ので」", sub: "podcast episode 1", kind: "ポッドキャスト", href: prefix + "2026-09-14/podcast.html" }]);

    var hay = INDEX.map(function (e) { return (e.label + " " + e.sub).toLowerCase(); });

    var modal = document.createElement("div");
    modal.className = "searchmodal"; modal.hidden = true;
    modal.innerHTML =
      '<div class="searchmodal-box">' +
      '<input type="search" id="gsInput" placeholder="さがす — grammar, kanji, vocab, podcast…" aria-label="Search everything">' +
      '<div class="searchresults" id="gsResults"></div>' +
      "</div>";
    document.body.appendChild(modal);
    var input = modal.querySelector("#gsInput");
    var results = modal.querySelector("#gsResults");

    function render(term) {
      var t = term.trim().toLowerCase();
      var matches = !t ? INDEX.slice(0, 8) : INDEX.filter(function (_, i) { return hay[i].indexOf(t) > -1; }).slice(0, 20);
      if (!matches.length) { results.innerHTML = '<p class="searchempty">みつかりませんでした。</p>'; return; }
      results.innerHTML = matches.map(function (m) {
        return '<a href="' + m.href + '"><span class="r-label ja">' + m.label + "</span>" +
          '<span class="r-sub">' + m.sub + "</span>" +
          '<span class="r-kind">' + m.kind + "</span></a>";
      }).join("");
    }
    function open() {
      modal.hidden = false; input.value = ""; render(""); input.focus();
    }
    function close() { modal.hidden = true; }

    btns.forEach(function (btn) { btn.addEventListener("click", open); });
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    input.addEventListener("input", function () { render(input.value); });
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
      if (e.key === "Escape" && !modal.hidden) close();
    });
  }

  // ---- let a page's own filter pick up ?q= from a search-modal link ----
  function applyQueryParam() {
    var q = new URLSearchParams(location.search).get("q");
    if (!q) return;
    var input = document.getElementById("q");
    if (!input) return;
    input.value = q;
    input.dispatchEvent(new Event("input"));
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initSearch();
    applyQueryParam();
  });
})();
