import test from "node:test"; // Use Node's built-in test runner.
import assert from "node:assert/strict"; // Fail on incorrect security and extraction behavior.
// Import the module dependencies used below.
// Import the module dependencies used below.
import {
  // Exercise import and retrieval boundaries.
  // Exercise import and retrieval boundaries.
  publicAddress,
  // Exercise import and retrieval boundaries.
  // Exercise import and retrieval boundaries.
  normalizeLink,
  // Exercise import and retrieval boundaries.
  // Exercise import and retrieval boundaries.
  retrieve,
  // Exercise import and retrieval boundaries.
  // Exercise import and retrieval boundaries.
  extract,
} from "../src/sources.js"; // Exercise import and retrieval boundaries.
import { exportArtifact } from "../src/export.js"; // Verify real Office and PDF serialization.
import { answer } from "../src/ai.js"; // Check provider failure and structured output handling.
import { zipSync, strToU8 } from "fflate"; // Construct an isolated Office XML fixture without legacy parsers.
// Initialize artifact for the current operation.
// Initialize artifact for the current operation.
const artifact = {
  // Set the title option for this operation.
  // Set the title option for this operation.
  title: "Learning test",
  // Set the sections option for this operation.
  // Set the sections option for this operation.
  sections: [
    // Supply this expression to the enclosing operation.
    // Set the heading option for this operation.
    {
      // Set the heading option for this operation.
      // Set the heading option for this operation.
      heading: "Active recall",
      // Set the body option for this operation.
      // Set the body option for this operation.
      body: "Close your notes. Retrieve the concept. Check the source. [S1]",
      // Close the current expression or block.
    // Close the current expression or block.
    },
    // Close the current expression or block.
  // Close the current expression or block.
  ],
  // Set the cards option for this operation.
  // Set the cards option for this operation.
  cards: [],
}; // Reuse a compact export fixture.
// Run test with the arguments below.
// Run test with the arguments below.
test("rejects private and mapped network destinations", () => {
  // Supply this expression to the enclosing operation.
  // Supply this literal value to the enclosing operation.
  for (const address of [
    // Supply this literal value to the enclosing operation.
    // Supply this literal value to the enclosing operation.
    "127.0.0.1",
    // Supply this literal value to the enclosing operation.
    // Supply this literal value to the enclosing operation.
    "10.0.0.1",
    // Supply this literal value to the enclosing operation.
    // Supply this literal value to the enclosing operation.
    "192.168.1.1",
    // Supply this literal value to the enclosing operation.
    // Supply this literal value to the enclosing operation.
    "169.254.169.254",
    // Supply this literal value to the enclosing operation.
    // Supply this literal value to the enclosing operation.
    "::1",
    // Supply this literal value to the enclosing operation.
    // Supply this literal value to the enclosing operation.
    "::ffff:127.0.0.1",
    // Supply this literal value to the enclosing operation.
    // Close the current expression or block.
    "fc00::1",
    // Close the current expression or block.
  // Close the current expression or block.
  ])
    // Run assert.equal with the arguments below.
    // Run assert.equal with the arguments below.
    assert.equal(publicAddress(address), false, address);
  // Run assert.equal with the arguments below.
  // Run assert.equal with the arguments below.
  assert.equal(publicAddress("8.8.8.8"), true);
}); // Cover SSRF address classifications.
// Run test with the arguments below.
// Run test with the arguments below.
test("normalizes public Google exports and rejects unsafe schemes", () => {
  // Run assert.equal with the arguments below.
  // Run assert.equal with the arguments below.
  assert.equal(
    // Run normalizeLink with the arguments below.
    // Run normalizeLink with the arguments below.
    normalizeLink("https://docs.google.com/document/d/abc123/edit"),
    // Supply this literal value to the enclosing operation.
    // Close the current expression or block.
    "https://docs.google.com/document/d/abc123/export?format=txt",
    // Close the current expression or block.
  // Close the current expression or block.
  );
  // Run assert.throws with the arguments below.
  // Run assert.throws with the arguments below.
  assert.throws(() => normalizeLink("http://localhost/"));
  // Run assert.throws with the arguments below.
  // Run assert.throws with the arguments below.
  assert.throws(() => normalizeLink("https://user:password@example.com/"));
}); // Verify the source URL contract.
// Run test with the arguments below.
// Run test with the arguments below.
test("retrieval ranks relevant evidence and keeps the context budget", () => {
  // Initialize results for the current operation.
  // Initialize results for the current operation.
  const results = retrieve(
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    [
      // Supply this expression to the enclosing operation.
      // Set the id option for this operation.
      {
        // Set the id option for this operation.
        // Set the id option for this operation.
        id: "a",
        // Set the name option for this operation.
        // Set the name option for this operation.
        name: "Notes",
        // Set the text option for this operation.
        // Set the text option for this operation.
        text: "Cells use membranes. ".repeat(200),
        // Set the url option for this operation.
        // Set the url option for this operation.
        url: "",
        // Close the current expression or block.
      // Close the current expression or block.
      },
      // Supply this expression to the enclosing operation.
      // Set the id option for this operation.
      {
        // Set the id option for this operation.
        // Set the id option for this operation.
        id: "b",
        // Set the name option for this operation.
        // Set the name option for this operation.
        name: "Network",
        // Set the text option for this operation.
        // Set the text option for this operation.
        text: "TLS secures network traffic.",
        // Set the url option for this operation.
        // Set the url option for this operation.
        url: "",
        // Close the current expression or block.
      // Close the current expression or block.
      },
      // Close the current expression or block.
    // Close the current expression or block.
    ],
    // Supply this literal value to the enclosing operation.
    // Supply this expression to the enclosing operation.
    "TLS network",
    // Supply this expression to the enclosing operation.
    // Close the current expression or block.
    1900,
    // Close the current expression or block.
  // Close the current expression or block.
  );
  // Run assert.equal with the arguments below.
  // Run assert.equal with the arguments below.
  assert.equal(results[0].id, "b");
  // Run assert.ok with the arguments below.
  // Run assert.ok with the arguments below.
  assert.ok(results.reduce((sum, row) => sum + row.text.length, 0) <= 1900);
  // Run assert.equal with the arguments below.
  // Run assert.equal with the arguments below.
  assert.equal(results[0].label, "S1");
}); // Check ranking and prompt size bounds.
// Run test with the arguments below.
// Run test with the arguments below.
test("extracts text and caption content; refuses unsupported files", async () => {
  // Run assert.match with the arguments below.
  // Run assert.match with the arguments below.
  assert.match(
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await extract(
      // Run Buffer.from with the arguments below.
      // Run Buffer.from with the arguments below.
      Buffer.from("WEBVTT\n00:01.000 --> 00:03.000\nA learning example."),
      // Supply this literal value to the enclosing operation.
      // Close the current expression or block.
      "lesson.vtt",
      // Close the current expression or block.
    // Close the current expression or block.
    ),
    // Supply this expression to the enclosing operation.
    // Close the current expression or block.
    /learning example/,
    // Close the current expression or block.
  // Close the current expression or block.
  );
  // Wait for this asynchronous operation before continuing.
  // Wait for this asynchronous operation before continuing.
  await assert.rejects(
    // Supply this expression to the enclosing operation.
    // Exercise transcript input without pretending to transcribe video.
    () => extract(Buffer.from("binary"), "movie.mp4"),
    // Exercise transcript input without pretending to transcribe video.
    // Close the current expression or block.
    /Supported formats/,
    // Close the current expression or block.
  // Close the current expression or block.
  );
}); // Exercise transcript input without pretending to transcribe video.
// Run test with the arguments below.
// Run test with the arguments below.
test("Word exports still reimport; PowerPoint export is intentionally disabled", async () => {
  const result = await exportArtifact(artifact, "docx");
  assert.equal(result.buffer.subarray(0, 2).toString(), "PK");
  const text = await extract(result.buffer, "fixture.docx");
  assert.match(text, /Active recall/);
  assert.match(text, /Retrieve the concept/);
  await assert.rejects(exportArtifact(artifact,"pptx"), /paused for the hackathon demo/i);
});

test("PowerPoint slide uploads still extract text without PptxGenJS", async () => {
  const slide = '<?xml version="1.0" encoding="UTF-8"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Important slide text</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>';
  const archive = zipSync({"ppt/slides/slide1.xml": strToU8(slide)});
  assert.match(await extract(Buffer.from(archive), "notes.pptx"), /Important slide text/);
});
// Run test with the arguments below.
// Run test with the arguments below.
test("exports a real PDF and reads workbook cells", async () => {
  // Initialize pdf for the current operation.
  // Initialize pdf for the current operation.
  const pdf = await exportArtifact(artifact, "pdf");
  // Run assert.equal with the arguments below.
  // Run assert.equal with the arguments below.
  assert.equal(pdf.buffer.subarray(0, 4).toString(), "%PDF");
  const bytes = zipSync({
    'xl/workbook.xml': strToU8('<?xml version="1.0"?><workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Tasks" sheetId="1" r:id="rId1"/></sheets></workbook>'),
    'xl/_rels/workbook.xml.rels': strToU8('<?xml version="1.0"?><Relationships><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
    'xl/sharedStrings.xml': strToU8('<sst><si><t>Review</t></si></sst>'),
    'xl/worksheets/sheet1.xml': strToU8('<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1"><v>30</v></c></row></sheetData></worksheet>'),
  });
  const text = await extract(Buffer.from(bytes), 'tasks.xlsx');
  // Run assert.match with the arguments below.
  // Run assert.match with the arguments below.
  assert.match(text, /Tasks/);
  // Run assert.match with the arguments below.
  // Run assert.match with the arguments below.
  assert.match(text, /Review \| 30/);
}); // Check two additional format paths.
// Run test with the arguments below.
// Run test with the arguments below.
test("DeepSeek request is grounded and validates structured answers", async (context) => {
  // Initialize previous for the current operation.
  // Initialize previous for the current operation.
  const previous = process.env.DEEPSEEK_API_KEY;
  // Supply this expression to the enclosing operation.
  // Initialize sent for the current operation.
  process.env.DEEPSEEK_API_KEY = "test-only";
  // Initialize sent for the current operation.
  // Initialize sent for the current operation.
  let sent;
  // Run context.mock.method with the arguments below.
  // Run context.mock.method with the arguments below.
  context.mock.method(globalThis, "fetch", async (url, options) => {
    // Run assert.equal with the arguments below.
    // Run assert.equal with the arguments below.
    assert.equal(url, "https://api.deepseek.com/chat/completions");
    // Supply this expression to the enclosing operation.
    // Return the result to the calling operation.
    sent = JSON.parse(options.body);
    // Return the result to the calling operation.
    // Return the result to the calling operation.
    return {
      // Set the ok option for this operation.
      // Set the ok option for this operation.
      ok: true,
      // Set the json option for this operation.
      // Set the json option for this operation.
      json: async () => ({
        // Set the choices option for this operation.
        // Set the choices option for this operation.
        choices: [
          // Supply this expression to the enclosing operation.
          // Set the finish_reason option for this operation.
          {
            // Set the finish_reason option for this operation.
            // Set the finish_reason option for this operation.
            finish_reason: "stop",
            // Set the message option for this operation.
            // Set the message option for this operation.
            message: { content: JSON.stringify(artifact) },
            // Close the current expression or block.
          // Close the current expression or block.
          },
          // Close the current expression or block.
        // Close the current expression or block.
        ],
        // Close the current expression or block.
      // Close the current expression or block.
      }),
      // Close the current expression or block.
    // Close the current expression or block.
    };
    // Close the current expression or block.
  // Close the current expression or block.
  });
  // Supply this expression to the enclosing operation.
  // Initialize result for the current operation.
  try {
    // Initialize result for the current operation.
    // Initialize result for the current operation.
    const result = await answer({
      // Set the question option for this operation.
      // Set the question option for this operation.
      question: "Make notes",
      // Set the history option for this operation.
      // Set the history option for this operation.
      history: [],
      // Set the sources option for this operation.
      // Set the sources option for this operation.
      sources: [
        // Supply this expression to the enclosing operation.
        // Set the id option for this operation.
        {
          // Set the id option for this operation.
          // Set the id option for this operation.
          id: "a",
          // Set the name option for this operation.
          // Set the name option for this operation.
          name: "Notes",
          // Set the text option for this operation.
          // Set the text option for this operation.
          text: "Close your notes and retrieve the concept.",
          // Set the url option for this operation.
          // Set the url option for this operation.
          url: "",
          // Close the current expression or block.
        // Close the current expression or block.
        },
        // Close the current expression or block.
      // Close the current expression or block.
      ],
      // Set the profile option for this operation.
      // Set the profile option for this operation.
      profile: { personalization: false, preferences: "PRIVATE_MEMORY" },
      // Set the style option for this operation.
      // Set the style option for this operation.
      style: "Bullet points",
      // Set the kind option for this operation.
      // Set the kind option for this operation.
      kind: "summary",
      // Set the feedback option for this operation.
      // Set the feedback option for this operation.
      feedback: [],
      // Close the current expression or block.
    // Close the current expression or block.
    });
    // Run assert.equal with the arguments below.
    // Run assert.equal with the arguments below.
    assert.equal(result.artifact.title, artifact.title);
    // Run assert.ok with the arguments below.
    // Run assert.ok with the arguments below.
    assert.ok(!JSON.stringify(sent).includes("PRIVATE_MEMORY"));
    // Run assert.match with the arguments below.
    // Run assert.match with the arguments below.
    assert.match(sent.messages[0].content, /If EVIDENCE is supplied/);
    // Run assert.equal with the arguments below.
    // Run assert.equal with the arguments below.
    assert.equal(result.citations[0].label, "S1");
    // Verify opt-out behavior and mock only the external provider boundary.
  // Apply the following behavior only when its condition matches.
  } finally {
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (previous === undefined) delete process.env.DEEPSEEK_API_KEY;
    // Handle the alternative case.
    // Handle the alternative case.
    else process.env.DEEPSEEK_API_KEY = previous;
    // Close the current expression or block.
  // Close the current expression or block.
  }
}); // Verify opt-out behavior and mock only the external provider boundary.

test('StudyBuddy answers general questions without uploaded documents', async (context) => {
  const existing = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = 'test-only';
  let sent;
  context.mock.method(globalThis, 'fetch', async (_url, options) => {
    sent=JSON.parse(options.body);
    return {ok:true, json:async()=>({choices:[{finish_reason:'stop',message:{content:'A concise answer.'}}]})};
  });
  try {
    const result=await answer({
      question:'What are study habits?',history:[],sources:[],profile:{displayName:'Learner',customPrompt:'Prefer short examples',personalization:false},
      style:'Short summary',kind:'chat',feedback:[],
    });
    assert.equal(result.content,'A concise answer.');
    assert.deepEqual(result.citations,[]);
    assert.match(sent.messages[0].content,/StudyBuddy/);
    assert.match(sent.messages[0].content,/Learner/);
    assert.doesNotMatch(sent.messages[0].content,/Prefer short examples/); // Memory is off: custom prompts must not be sent.
    // With memory enabled, a user's custom instructions should be used.
  } finally {
    if(existing===undefined)delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY=existing;
  }
});


test('StudyBuddy applies custom instructions when personalization is enabled', async (context) => {
  const previousKey = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = 'test-only';
  let request;
  context.mock.method(globalThis, 'fetch', async (_url, options) => {
    request = JSON.parse(options.body);
    return { ok:true, json:async()=>({ choices:[{finish_reason:'stop',message:{content:'OK'}}] }) };
  });
  try {
    await answer({
      question:'Explain study habits',history:[],sources:[],
      profile:{displayName:'Learner',customPrompt:'Prefer short examples',personalization:true},
      style:'Short summary',kind:'chat',feedback:[],
    });
    assert.match(request.messages[0].content, /Prefer short examples/);
  } finally {
    if (previousKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = previousKey;
  }
});
