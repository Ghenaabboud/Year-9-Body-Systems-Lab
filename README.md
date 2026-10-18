# Year 9 Body Systems Lab

An interactive Year 9 science resource on seven human body systems (circulatory, muscular, digestive, skeletal, nervous, excretory, respiratory).

- **Student page:** `index.html`. Animated diagrams, the Systems of the Body organiser with instant feedback, and a quick-check quiz. Students type their name and choose their class (9A–9E).
- **Teacher panel:** `teacher.html`. Results by class and by system, each student's answers, quiz scores and a CSV download. Protected by a teacher passcode.
- **Results storage:** a Google Sheet, via the script in `apps-script/Code.gs`.

## One-time setup

### 1. Connect the Google Sheet
1. Create a new Google Sheet (for example "Body Systems Lab results").
2. Open **Extensions → Apps Script**. Delete what is there and paste in the contents of `apps-script/Code.gs`.
3. Change `TEACHER_PASSCODE` on line 9 to your own passcode, then click **Save**.
4. Click **Deploy → New deployment**. Click the cog next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, then **Authorize access** and allow it. (Google may warn that the app is unverified: choose **Advanced → Go to … (unsafe)**. It is your own script.)
6. Copy the **Web app URL** (it ends in `/exec`).
7. In this repository, edit `config.js` and paste the URL between the quotes.

### 2. Turn on GitHub Pages
**Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.**

### Links
- Students: `https://ghenaabboud.github.io/Year-9-Body-Systems-Lab/`
- Teachers: `https://ghenaabboud.github.io/Year-9-Body-Systems-Lab/teacher.html`

## Notes
- Student progress also saves in the student's own browser, so nothing is lost if the internet drops; it re-sends automatically.
- Each student's browser is one row in the sheet. If a student switches device, they appear as a second row with the same name.
- To remove a student, delete their row in the **Results** sheet.
- If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
