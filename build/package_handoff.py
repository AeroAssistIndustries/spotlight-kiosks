"""Bundle the WordPress handoff: theme zip, HANDOFF (md + pdf) and brand files.
Run after build/export_wp.py:  python3 build/package_handoff.py"""
import os, shutil, zipfile, asyncio, base64, markdown
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
OUT = os.path.join(DIST, "citypulse-wordpress-handoff")

import re
def normalize(md):
    """Python-Markdown needs 4-space nesting and a blank line before lists."""
    out, in_code = [], False
    lines = md.split("\n")
    for i, line in enumerate(lines):
        if line.startswith("```"):
            in_code = not in_code
        if not in_code:
            m = re.match(r"^( {1,3})([-*]|\d+\.) ", line)
            if m:
                line = "    " + line.lstrip(" ")
            is_list = re.match(r"^\s*([-*]|\d+\.) ", line)
            prev = out[-1] if out else ""
            if is_list and prev.strip() and not re.match(r"^\s*([-*]|\d+\.) ", prev) and not prev.startswith("    "):
                out.append("")
            if line.startswith("**") and i + 1 < len(lines) and lines[i + 1].startswith("**"):
                line += "  "
        out.append(line)
    return "\n".join(out)

def main():
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, "brand"))
    shutil.copy(os.path.join(DIST, "citypulse-theme.zip"), OUT)
    md = open(os.path.join(ROOT, "build", "HANDOFF.md")).read()
    open(os.path.join(OUT, "HANDOFF.md"), "w").write(md)
    for f in ["logo.svg", "logo-light.svg", "logo-mark.svg", "logo.png", "logo-light.png", "favicon.svg", "favicon.png", "apple-touch-icon.png", "og-card.png"]:
        shutil.copy(os.path.join(ROOT, "assets", f), os.path.join(OUT, "brand", f))

    logo = base64.b64encode(open(os.path.join(ROOT, "assets", "logo.svg"), "rb").read()).decode()
    body = markdown.markdown(normalize(md), extensions=["tables", "fenced_code", "sane_lists"])
    body = body.replace("<li>[ ] ", '<li class="todo">').replace("<p>[ ] ", '<p class="todo">')
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: Letter; margin: 18mm 16mm 18mm; }}
body {{ font: 10.5pt/1.55 -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #121B26; }}
header {{ display:flex; align-items:center; justify-content:space-between; border-bottom: 3px solid #22C7B6; padding-bottom: 10px; margin-bottom: 18px; }}
header img {{ height: 40px; }} header span {{ color:#536170; font-size: 9pt; }}
h1 {{ font-size: 21pt; margin: 0 0 6px; color:#0F1C2B; }}
h2 {{ font-size: 14pt; color:#0F1C2B; border-bottom: 1px solid #D5DCE2; padding-bottom: 4px; margin-top: 22px; page-break-after: avoid; }}
h3 {{ font-size: 11.5pt; margin: 14px 0 4px; color:#0E6B63; page-break-after: avoid; }}
code {{ font: 9pt/1.4 Menlo, Consolas, monospace; background:#EEF2F4; padding: 1px 4px; border-radius: 3px; }}
pre {{ background:#0F1C2B; color:#E6EEF4; padding: 10px 12px; border-radius: 6px; font-size: 8.6pt; page-break-inside: avoid; }}
pre code {{ background:none; color:inherit; padding:0; }}
table {{ border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 9.5pt; page-break-inside: avoid; }}
th, td {{ border: 1px solid #D5DCE2; padding: 6px 8px; text-align: left; vertical-align: top; }}
th {{ background: #F4F6F7; }}
li {{ margin: 3px 0; }} li.todo {{ list-style: none; margin-left: -18px; }} li.todo::before {{ content: "☐  "; color:#0E6B63; }}
hr {{ border: 0; border-top: 1px solid #D5DCE2; }}
a {{ color:#0E6B63; }}
</style></head><body><header><img src="data:image/svg+xml;base64,{logo}" alt=""><span>Developer handoff · v1.0.0</span></header>{body}</body></html>"""
    hp = os.path.join(OUT, "_handoff.html")
    open(hp, "w").write(html)

    async def pdf():
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            b = await p.chromium.launch(); pg = await b.new_page()
            await pg.goto("file://" + hp); await pg.pdf(path=os.path.join(OUT, "HANDOFF.pdf"), format="Letter", print_background=True,
                display_header_footer=True, header_template="<span></span>",
                footer_template='<div style="font-size:8px;color:#888;width:100%;text-align:center">CityPulse Kiosks · WordPress handoff · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
                margin={"top": "16mm", "bottom": "18mm", "left": "14mm", "right": "14mm"})
            await b.close()
    asyncio.run(pdf())
    os.remove(hp)

    zpath = os.path.join(DIST, "citypulse-wordpress-handoff.zip")
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for dp, _, fn in os.walk(OUT):
            for f in fn:
                full = os.path.join(dp, f)
                z.write(full, os.path.join("citypulse-wordpress-handoff", os.path.relpath(full, OUT)))
    print("Handoff package:", zpath, f"({os.path.getsize(zpath)//1024} KB)")

if __name__ == "__main__":
    main()
