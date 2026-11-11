# Bam0207.github.io

Professional site for Brooke Murphy, environmental scientist. Plain HTML and CSS with no build step, hosted on GitHub Pages.

## Pages

- `index.html`: Home
- `about.html`: About, experience, education and tools
- `research.html`: Thesis research
- `portfolio.html`: GIS portfolio
- `css/style.css`: All styling (colors are set at the top)
- `images/`: Photos, maps and figures
- `files/`: Downloadable files such as your CV

## Publish on GitHub Pages

1. Create a new public repository named `Bam0207.github.io` (your GitHub username, then `.github.io`).
2. Put these files in it and push:
   ```
   git init
   git add .
   git commit -m "First version of my site"
   git branch -M main
   git remote add origin https://github.com/Bam0207/Bam0207.github.io.git
   git push -u origin main
   ```
3. On GitHub, open the repo's **Settings → Pages**, set the source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. After a minute or two, the site is live at `https://bam0207.github.io`.

To update the site later: edit in VS Code, then `git add .`, `git commit -m "..."`, `git push`.

## To do before going live

- [ ] Add your CV as `files/Brooke_Murphy_CV.pdf` (consider removing your phone number from the public copy).
- [ ] Replace `YOUR-LINKEDIN` in the footer of all four pages.
- [ ] Decide whether to keep your Cal Poly email in the footer, or use another address.
- [ ] Replace the placeholder cover graphics (`images/cover-*.svg`) with real exports:
  - `cover-contours.svg`: a screenshot of the groundwater contour web map
  - `cover-calculator.svg`: a screenshot of the irrigation calculator
  - `cover-course.svg`: a screenshot of the CPGIS course site
  - `cover-eto.svg`: a thesis input map (no results until published)
- [ ] Swap in full-resolution originals of `recharge-pond.jpg` and `pfas-soil.jpg`.
- [ ] Confirm with Dr. Chiu that the workflow figure on the Research page is OK to share.
