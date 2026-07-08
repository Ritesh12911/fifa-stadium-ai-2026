"""Unit tests for streamlit_app.py asset-inlining logic."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from streamlit_app import build_inline_html


def test_build_inline_html_returns_string():
    html = build_inline_html()
    assert isinstance(html, str)
    assert len(html) > 0


def test_css_is_inlined():
    html = build_inline_html()
    assert 'href="css/' not in html
    assert "<style>" in html


def test_js_is_inlined():
    html = build_inline_html()
    assert 'src="js/' not in html
    assert "<script>" in html


def test_csp_meta_tag_preserved():
    html = build_inline_html()
    assert "Content-Security-Policy" in html
    assert "frame-ancestors" in html


def test_no_broken_asset_paths_remain():
    html = build_inline_html()
    assert 'href="css/' not in html
    assert 'src="js/' not in html
