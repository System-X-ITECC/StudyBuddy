# 🌸 StudyBuddy

### Your learning, your way.

**An AI-powered study workspace designed to make learning more organised, accessible and less overwhelming.**

Built by **Team System X** · ITE student hackathon project

[Explore the source code](https://github.com/System-X-ITECC/StudyBuddy) · [Contact our team](mailto:system.x.ite@gmail.com)

---

## 📖 About StudyBuddy

StudyBuddy brings everyday AI chat, study tools, document workspaces and learning resources together in one student-friendly web application. Instead of switching between unrelated tools, learners can ask questions, explore uploaded materials, prepare notes, practise recall and organise their work in one place.

Our goal is simple: **make complicated technology feel simple to use**, so students can focus on understanding the topic rather than figuring out the interface.

StudyBuddy is designed with students from Singapore's **ITE, polytechnics and other learning pathways** in mind, while remaining useful for independent learners.

## ✨ What can StudyBuddy do?

| Feature | What it does |
| --- | --- |
| **AI Chat** | Ask general questions, get explanations and continue conversations without having to upload a document first. |
| **Document Q&A** | Upload supported learning materials and ask questions grounded in the content. |
| **Study Tools** | Generate summaries, structured notes, mini-textbooks, study plans and revision material. |
| **Word Studio** | Draft and edit documents in a dedicated workspace; export to DOCX using DocShift or print/save as PDF. |
| **Slide Studio** | Generate and present readable **16:9 slides** in the browser, with a responsive, soft-background presentation view. |
| **Flashcard Studio** | Flip, shuffle and review interactive flashcards, with simple in-session progress tracking. |
| **My Library** | Find and manage uploaded and generated learning materials in a personal library. |
| **Singapore Resource Hub** | Discover curated links to official MOE, ITE, polytechnic and SkillsFuture learning or career resources. |
| **Conversation Organisation** | Rename chats and arrange them in custom, colour-coded folders. |
| **Personalisation** | Choose a preferred display name, response style, explanation level, interests and optional custom AI instructions. |
| **Privacy Controls** | Manage learning preferences and memory options, with account-based access to private study data. |

### A note about the Resource Hub

The Resource Hub is a **directory of useful official links**, not an unrestricted copy of the learning materials on those websites. Some portals require a school or institutional account. StudyBuddy should not claim to have read restricted content unless the user has supplied accessible source material.

### Current prototype limitations

- **Slide Studio** supports browser-based presentations; downloadable `.pptx` generation is not yet enabled.
- **Word Studio** uses DocShift for HTML-to-DOCX conversion, while its PDF option uses the browser's print-to-PDF functionality.
- Some functions depend on available AI services, authentication, deployment configuration and third-party websites. Features should be tested in the deployed environment before a demonstration.

## 🧭 How the app is organised

The interface separates different tasks so learners can quickly choose what they need:

1. **Chat** — ask, discuss and explore ideas.
2. **Study Tools** — generate summaries, textbooks and study plans.
3. **Word Studio** — write, revise and export documents.
4. **Slide Studio** — present ideas visually in a 16:9 format.
5. **Flashcards** — practise active recall.
6. **My Library & Resource Hub** — manage personal material and discover useful educational links.

## 🛠️ Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | Astro, JavaScript, responsive CSS |
| Backend | Node.js, Express |
| Data and authentication | Supabase (PostgreSQL, Auth and Storage) |
| AI integration | DeepSeek, accessed through the backend |
| Hosting | GitHub Pages (frontend), Vercel (API) |
| Documents | DOCX/PDF processing and export; DocShift HTML-to-DOCX in Word Studio |
| Project collaboration | Git and GitHub |

> **Security note:** AI credentials and Supabase administrative keys belong on the server, never in the public frontend or committed source files.

## 🚀 Running the project locally

**Prerequisites:** Node.js **22.22.0 or newer**, npm, and appropriately configured testbed credentials.

```bash
# Clone the repository
git clone https://github.com/System-X-ITECC/StudyBuddy.git
cd StudyBuddy

# Install workspace dependencies
npm ci

# Create the backend testbed configuration
cp backend/.env.testbed.example backend/.env.testbed

# Create the local frontend configuration
cat > frontend/.env.testbed <<'ENV'
PUBLIC_APP_ENV=testbed
PUBLIC_API_URL=http://localhost:8787
STUDYBUDDY_DEPLOY_TARGET=local
ENV
```

Add your own valid Supabase and AI configuration to `backend/.env.testbed`. Do **not** commit the real values. The local frontend only receives the public API address, never server secrets.

Start the backend and frontend in separate terminals:

```bash
# Terminal 1 — backend
npm run dev:testbed:backend

# Terminal 2 — frontend
npm run dev:testbed:frontend
```

Run the tests with:

```bash
npm test
```

For deployment and environment setup, refer to the configuration examples and GitHub Actions workflows in this repository. A successful local build does not by itself confirm that every live integration is ready.

## 👥 Meet Team System X

We are a five-member student team bringing together development, leadership, documentation, presentations and prompt engineering.

| Team member | Role | Contact |
| --- | --- | --- |
| **Cheng En** | **Team Lead** | [Team email](mailto:system.x.ite@gmail.com) |
| **Zul** | **Co-Lead** — task management support and advanced prompt engineering | [LinkedIn: zulfaqarnet](https://www.linkedin.com/in/zulfaqarnet/) · [Team email](mailto:system.x.ite@gmail.com) |
| **Jing Heng** | Markdown and Documentation | [Team email](mailto:system.x.ite@gmail.com) |
| **Hua Jin** | Presentation and Documentation | [Team email](mailto:system.x.ite@gmail.com) |
| **Ethan** | Prompt Engineering | [Team email](mailto:system.x.ite@gmail.com) |

*Individual contact profiles can be added when team members choose to share them.*

## 💭 Our reflection

Building StudyBuddy reminded us that creating an application is about more than adding features. It is also about deciding **which features are genuinely useful, how users find them and how to explain them clearly**. Working across leadership, technical implementation, prompt engineering, presentation and documentation pushed us to think about the same product from different perspectives.

### Zul's reflection — Co-Lead

> Developing StudyBuddy could be a little frustrating at times. I joked that I felt like an **“Angry Bird” almost 24/7** because so much thinking went into making the experience feel simple. The hardest part was not just solving technical problems; it was taking complicated ideas, decisions and workflows and turning them into something that users could understand without getting confused. This project taught me that a simple user experience often takes a surprising amount of effort behind the scenes. It also reminded me to balance ambition with teamwork, patience and the actual needs of students.

**Our takeaway:** Good learning tools should reduce friction, not create more of it. We want to keep improving StudyBuddy by listening to learners, simplifying difficult workflows and making the interface more comfortable to use.

## 📬 Contact and enquiries

For feedback, collaboration, bug reports or general enquiries, please email:

**📧 [system.x.ite@gmail.com](mailto:system.x.ite@gmail.com)**

You can also connect with **Zul** on [LinkedIn](https://www.linkedin.com/in/zulfaqarnet/).

---

**Made with curiosity, persistence and plenty of debugging by Team System X.** 🌸

*StudyBuddy is a student-built project and is not an official MOE, ITE, polytechnic or SkillsFuture service.*
