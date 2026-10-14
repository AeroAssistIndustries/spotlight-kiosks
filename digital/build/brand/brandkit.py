"""Turn text into SVG outline paths (shaped with HarfBuzz, so kerning is real)."""
import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import os
FONTS = os.environ.get("CP_FONTS", os.path.join(os.path.dirname(__file__), "fonts")) + "/"
_cache = {}
def _font(name, axes):
    key = (name, tuple(sorted(axes.items())))
    if key not in _cache:
        blob = hb.Blob.from_file_path(FONTS + name + ".ttf")
        face = hb.Face(blob); f = hb.Font(face)
        if axes: f.set_variations(axes)
        _cache[key] = (f, face.upem)
    return _cache[key]

class _Rec:
    def __init__(self, pen): self.p = pen
    def move_to(self, x, y, c=None): self.p.moveTo((x, y))
    def line_to(self, x, y, c=None): self.p.lineTo((x, y))
    def quadratic_to(self, a, b, x, y, c=None): self.p.qCurveTo((a, b), (x, y))
    def cubic_to(self, a, b, c1, d, x, y, c=None): self.p.curveTo((a, b), (c1, d), (x, y))
    def close_path(self, c=None): self.p.closePath()

def text_path(text, font, size, axes=None, tracking=0.0, x=0.0, baseline=0.0, features=None):
    """Returns (d, advance_width, bounds). tracking in em units (e.g. -0.02). y is baseline."""
    f, upem = _font(font, axes or {})
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(f, buf, features or {"kern": True, "liga": True})
    s = size / upem
    svg = SVGPathPen(None, ntos=lambda v: ("%.2f" % v).rstrip("0").rstrip("."))
    bp = BoundsPen(None)
    pen_x = x
    n = len(buf.glyph_infos)
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        t = (s, 0, 0, -s, pen_x + pos.x_offset * s, baseline - pos.y_offset * s)
        for target in (svg, bp):
            tp = TransformPen(target, t)
            f.draw_glyph_with_pen(info.codepoint, _PenAdapter(tp))
        pen_x += pos.x_advance * s + (tracking * size if i < n - 1 else 0)
    return svg.getCommands(), pen_x - x, bp.bounds

class _PenAdapter:
    def __init__(self, p): self.p = p
    def moveTo(self, pt): self.p.moveTo(pt)
    def lineTo(self, pt): self.p.lineTo(pt)
    def qCurveTo(self, *pts): self.p.qCurveTo(*pts)
    def curveTo(self, *pts): self.p.curveTo(*pts)
    def closePath(self): self.p.closePath()
    def endPath(self): self.p.endPath()
