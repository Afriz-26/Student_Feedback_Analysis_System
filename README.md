# Student-Feedback-Analysis

Students Feedback Analysis Model Using Deep Learning-Based Method and Linguistic Knowledge for Intelligent Educational Systems

## Student Feedback Analysis

Full-stack web app that classifies student feedback as positive or negative and groups it by course topic (teaching, course content, facilities, assessment).

Team 3 college project, based on: Abdi et al., *Students feedback analysis model using deep learning-based method and linguistic knowledge for intelligent educational systems*, Soft Computing 27, 14073-14094 (2023), DOI 10.1007/s00500-023-07926-2.

## What is inside
```
public/                  Frontend (HTML, CSS, JavaScript, sample CSV)
netlify/functions/       Backend API (Node.js serverless functions)
  analyze.js             POST /api/analyze  { text } or { comments: [] }
  info.js                GET  /api/info     project data, benchmarks, roadmap, team
  lib/engine.js          Analysis engine (rule-based for now)
server.js                Local dev server (no installs needed)
test.js                  Engine tests (npm test)
netlify.toml             Netlify settings (publish folder, functions, /api redirect)
```

## Run locally
Needs Node.js 18 or newer.
```
npm start        # open http://localhost:8888
npm test
```

## Deploy on Netlify
1. Push this project to the [GitHub repository](https://github.com/lasyapriyapasam-ai/Student-Feedback-Analysis).
2. In Netlify, select **Add new site → Import an existing project → GitHub**, authorize Netlify if asked, and choose `Student-Feedback-Analysis`.
3. Keep the build command empty. Netlify reads the publish directory (`public`), functions directory (`netlify/functions`), and `/api/*` redirect from `netlify.toml`.
4. Select **Deploy site**. Netlify will provide a public `*.netlify.app` URL; each later push to the connected branch triggers a new deployment.

No environment variables or build-time secrets are required for this demo.

## Model status (important)
The API currently uses a rule-based engine (word lists, negation and "but" rules) so the whole application works end to end. The CNN-BiLSTM-attention model from the base paper is the next stage. To plug it in, keep the return shape of `analyse()` in `netlify/functions/lib/engine.js` and replace its body, for example by calling a separately hosted Python model service. The accuracy figures in the Results section are the base paper's published values, not results of this repository.

## Edit team names
Open `netlify/functions/info.js` and fill in the `name` fields in `team`.
