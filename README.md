# Tyler Zaruba portfolio

A static, multi-page portfolio for job applications. The homepage gives a quick view of Tyler's work; each case study and interactive demo has its own URL for sharing with a relevant employer. The site has no build step, database, tracking script, paid service, or framework dependency.

## Site map

| Page | Best use |
| --- | --- |
| `index.html` | General portfolio link for applications and LinkedIn |
| `projects/meal-delivery-routing.html` | Applied analytics, field operations, logistics, mission-driven roles |
| `projects/documentation-lifecycle.html` | Business systems, transformation, process governance, responsible AI roles |
| `projects/sop-assistant.html` | Practical AI enablement, knowledge operations, adoption roles |
| `projects/education-scale.html` | Program management, multi-site operations, nonprofit/education roles |
| `demos/route-lab.html` | Fictional, interactive reconstruction of proximity-based volunteer routing |
| `demos/operations-system.html` | Fictional enhancement tracker and knowledge hub concept |

## Edit the site

1. Change the homepage text and project links in `index.html`.
2. Change one case study in its matching `projects/*.html` file. Keep the problem, your contribution, the outcome, and where the work translates to another setting.
3. Change shared colors, typography, or layout in `styles.css`. The palette is near the top under `:root`.
4. Change demo copy and fictional records in `demos/`. The interactive behavior is in `route-lab.js` and `operations-system.js`; demo styling is in `demo.css`.
5. Open the edited page at phone and desktop widths. Check all links, metrics, and claims before committing the changes.
6. Commit the file in GitHub. GitHub Pages will update the same public URL.

For a simple text change on GitHub, open the file in the repository, select the pencil icon, edit, and commit. You do not need a command line.

## Add a project

1. Copy an existing file in `projects/` and give it a short, readable filename.
2. Replace the title, description, challenge, approach, result, and role translation text. Remove any sections that are not supported by evidence.
3. Add a summary card and link to the new file in `index.html`.
4. Add the new page to the site map above and update the related-project links.
5. Follow `PROJECT_TEMPLATE.md` when gathering the story and checking claims.

## Claim and privacy rules

- Describe only your actual contribution. Say "assisted in building" for SOP Assistant and "co-founded" for Kids on Course University.
- Keep the documentation tracker, AI-assisted review, and Python validation results separate. The broader next-stage documentation model is in development or planned.
- Do not claim measured miles, fuel, or time savings for meal routing unless you have the data. Keep household addresses and route lists private.
- Do not upload internal documents, screenshots, data exports, or confidential employer content. Use original, illustrative diagrams when useful and label them as such.
- Keep the demos clearly labeled as fictional reconstructions. The route lab uses invented stops and simulated travel time. The knowledge hub is a portfolio concept inspired by the documentation work; it is not a claim that this exact hub was deployed.
- The current source of truth is the approved career material in the private Job Search OS workspace, especially `Achievement_Library.md`, `Master_Resume.md`, and `Career_Fact_Resolution_Log.md`.

## Hosting

This repository is intended for the free GitHub Pages service under `https://tzarubadata.github.io/`. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save. The published URL remains the same after later commits.

The public site includes email and LinkedIn contact links but omits a phone number. There are no contact forms or analytics to maintain.
