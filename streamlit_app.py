"""
StadiumIQ — FIFA World Cup 2026 Smart Stadium Platform
Streamlit entry point: inlines all HTML/CSS/JS and serves the full SPA.
"""

import os
import re
import logging
import streamlit as st
import streamlit.components.v1 as components

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="StadiumIQ — FIFA World Cup 2026",
    page_icon="🏟️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Hide all Streamlit chrome for full-page experience ────────────────────────
st.markdown("""
<style>
  #MainMenu        { visibility: hidden; }
  footer           { visibility: hidden; }
  header           { visibility: hidden; }
  .stApp           { background: #050a14; }
  .block-container {
    padding:    0 !important;
    max-width:  100% !important;
  }
  /* Remove top padding that Streamlit adds */
  [data-testid="stAppViewContainer"] > section:first-child { padding-top: 0 !important; }
</style>
""", unsafe_allow_html=True)

# ── Asset inlining ────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _rebuild_csp(_match: "re.Match") -> str:
    """
    Rebuilds the Content-Security-Policy for delivery inside Streamlit's
    sandboxed iframe, instead of dropping the policy entirely.
    `frame-ancestors *` is required so the host page (Streamlit) can embed
    this document in an iframe; every other directive is preserved as-is.
    """
    return (
        '<meta http-equiv="Content-Security-Policy" '
        'content="default-src \'self\'; '
        'script-src \'self\' \'unsafe-inline\'; '
        'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; '
        'font-src https://fonts.gstatic.com; '
        'connect-src https://generativelanguage.googleapis.com; '
        'img-src \'self\' data:; '
        'frame-ancestors *;">'
    )


@st.cache_data(show_spinner=False)
def build_inline_html() -> str:
    """
    Reads index.html and inlines all local CSS and JS assets so the app
    renders correctly inside Streamlit's sandboxed iframe.
    """
    html_path = os.path.join(BASE_DIR, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Rebuild Content-Security-Policy meta for iframe delivery
    #    (previously this was stripped entirely, which silently dropped
    #    a security control the README documents as being in place).
    html = re.sub(
        r'<meta\s+http-equiv=["\']Content-Security-Policy["\'][^>]*>',
        _rebuild_csp,
        html,
        flags=re.IGNORECASE,
    )

    # 2. Inline CSS files  (e.g. <link rel="stylesheet" href="css/style.css">)
    def _inline_css(m: "re.Match") -> str:
        href = m.group(1)
        path = os.path.join(BASE_DIR, href.replace("/", os.sep))
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f"<style>{f.read()}</style>"
        except FileNotFoundError:
            logger.warning("CSS asset not found, leaving tag as-is: %s", path)
            return m.group(0)

    html = re.sub(
        r'<link[^>]+href="(css/[^"]+\.css)"[^>]*/?>',
        _inline_css,
        html,
    )

    # 3. Inline JS files  (e.g. <script src="js/app.js"></script>)
    def _inline_js(m: "re.Match") -> str:
        src = m.group(1)
        path = os.path.join(BASE_DIR, src.replace("/", os.sep))
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f"<script>{f.read()}</script>"
        except FileNotFoundError:
            logger.warning("JS asset not found, leaving tag as-is: %s", path)
            return m.group(0)

    html = re.sub(
        r'<script\s+src="(js/[^"]+\.js)"[^>]*>\s*</script>',
        _inline_js,
        html,
    )

    # 4. Fix body for iframe: allow scrolling, remove overflow:hidden
    html = html.replace(
        "overflow: hidden;",
        "overflow: auto;",
    )

    return html


# ── Render ────────────────────────────────────────────────────────────────────
html_content = build_inline_html()

components.html(
    html_content,
    height=860,      # fits typical laptop screens; app scrolls internally
    scrolling=False,
)
