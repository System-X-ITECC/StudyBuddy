import app from "./index.js";
import { assertBackendEnvironment } from "./environment.js";
assertBackendEnvironment();
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
app.listen(port, host, () => console.log(`StudySpace ${process.env.APP_ENV || "testbed"} API listening on http://${host}:${port}`));
