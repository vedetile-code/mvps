#!/usr/bin/env python3
"""Build a GitHub Pages artifact that only redirects to https://mvps.pages.dev."""
from pathlib import Path
import os

DEST = Path(os.environ.get("REDIRECT_OUT", "redirects-out"))
NEW = "https://mvps.pages.dev"

# Paths relative to the GitHub project site root (/mvps/).
PAGES = [
    ("index.html", "/"),
    ("thanks.html", "/thanks"),
    ("404.html", None),  # special: preserve leftover path
    ("nookshift/index.html", "/nookshift/"),
    ("nookshift/app.html", "/nookshift/app"),
    ("nookshift/404.html", None),
    ("listready/index.html", "/listready/"),
    ("listready/app/index.html", "/listready/app/"),
    ("listready/404.html", None),
    ("tellme-coach/index.html", "/tellme-coach/"),
    ("tellme-coach/practice.html", "/tellme-coach/practice"),
    ("tellme-coach/404.html", None),
    ("quirepress/index.html", "/quirepress/"),
    ("quirepress/app.html", "/quirepress/app"),
    ("shiftready/index.html", "/shiftready/"),
    ("shiftready/app.html", "/shiftready/app"),
]


def page(target: str | None, title="This site has moved") -> str:
    if target is None:
        # Forward the current path (minus the /mvps project prefix) to the new host.
        script = """
<script>
(function(){
  var path = location.pathname.replace(/^\\/mvps(?=\\/|$)/, '') || '/';
  if (path.charAt(0) !== '/') path = '/' + path;
  location.replace(%r + path + location.search + location.hash);
})();
</script>
""" % NEW
        href_js = f"{NEW}/"
        canonical = NEW + "/"
        refresh = ""
        link = f'<a href="{NEW}/">{NEW}/</a>'
    else:
        dest = NEW + target
        script = f'<script>location.replace({dest!r} + location.search + location.hash);</script>\n'
        refresh = f'<meta http-equiv="refresh" content="0; url={dest}">\n'
        canonical = dest
        link = f'<a href="{dest}">{dest}</a>'
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {refresh}  <link rel="canonical" href="{canonical}">
  <title>{title}</title>
  {script}</head>
<body>
  <p>This page has moved to {link}.</p>
</body>
</html>
"""


def main() -> None:
    if DEST.exists():
        import shutil
        shutil.rmtree(DEST)
    for rel, target in PAGES:
        path = DEST / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(page(target), encoding="utf-8")
    print(f"wrote {len(PAGES)} redirect files to {DEST}")


if __name__ == "__main__":
    main()
