import { lookup } from "node:dns/promises"; // Resolve source hosts before making requests.
import https from "node:https"; // Pin requests to a validated public address.
import ipaddr from "ipaddr.js"; // Classify IPv4 and IPv6 ranges consistently.
import { load } from "cheerio"; // Extract readable HTML without executing page scripts.
import { readDocxText } from "./docx-text.js"; // Extract bounded Word text, no embedded Mammoth.
import pdf from "pdf-parse/lib/pdf-parse.js"; // Read text-based PDFs without the package's demo loader.
import { unzipSync } from "fflate"; // Decode Office archive members after size checks.
import { XMLParser } from "fast-xml-parser"; // Read PowerPoint slide XML as text.
import { readXlsxText } from "./xlsx.js";

export const MAX_TEXT = 240000; // Bound retained source text and prompt preparation costs.

// Reject loopback, private, reserved, and mapped private destinations.
export function publicAddress(address) {
  // Supply this expression to the enclosing operation.
  // Return the result to the calling operation.
  try {
    return ipaddr.process(address).range() === "unicast";
    // Treat invalid addresses as unsafe.
  } catch {
    return false;
  }
} // Finish address classification.

// Convert supported public Google files to export links.
export function normalizeLink(input) {
  const url = new URL(input); // Require an absolute URL.

  // Apply the following behavior only when its condition matches.
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    // Close the current expression or block.
    (url.port && url.port !== "443")
  )
    // Stop this operation with a clear failure.
    throw new Error(
      // Restrict remote request surfaces.
      "Use a public HTTPS URL without credentials or custom ports.",
    );

  if (url.hostname === "docs.google.com") {
    // Support publicly accessible Google document exports.
    // Initialize match for the current operation.
    const match = url.pathname.match(
      // Accept canonical file IDs only.
      /^\/(document|presentation|spreadsheets)\/d\/([\w-]+)/,
    );

    if (match)
      return `https://docs.google.com/${match[1]}/d/${match[2]}/export?format=${match[1] === "document" ? "txt" : match[1] === "presentation" ? "pptx" : "xlsx"}`; // Request a parser-supported export.
  } // Preserve ordinary source URLs.

  return url.href; // Return the validated input URL.
} // Finish link normalization.

// Fetch bounded public content without DNS rebinding.
export async function fetchPublic(input, redirects = 0) {
  const url = new URL(normalizeLink(input)); // Validate every redirect as a fresh URL.
  if (redirects > 4) throw new Error("This source redirected too many times."); // Bound redirect chains.

  const addresses = await lookup(url.hostname, { all: true }); // Resolve all returned network addresses.

  if (
    // Run addresses.some with the arguments below.
    !addresses.length ||
    addresses.some((item) => !publicAddress(item.address))
  )
    throw new Error("Only public internet sources are supported."); // Reject mixed public/private answers.

  const address = addresses[0]; // Pin this request to one validated address.

  return new Promise((resolve, reject) => {
    // Expose the streamed download as a bounded promise.
    // Initialize request for the current operation.
    const request = https.get(
      // Preserve TLS hostname checks while pinning DNS.
      url,
      // Set the headers option for this operation.
      {
        headers: { "User-Agent": "StudySpace/1.0 document-reader" },
        // Set the lookup option for this operation.
        lookup: (_host, options, callback) =>
          options.all
            ?
              // Run callback with the arguments below.
              callback(null, [address])
            :
              callback(null, address.address, address.family),
      },
      (response) => {
        if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
          // Run response.resume with the arguments below.
          response.resume();

          return resolve(
            // Run fetchPublic with the arguments below.
            fetchPublic(
              new URL(response.headers.location, url).href,
              redirects + 1,
            ),
          );
        } // Revalidate each redirect destination.

        if (response.statusCode !== 200) {
          response.resume();

          return reject(
            // Supply this literal value to the enclosing operation.
            new Error(
              "Source unavailable. Check public sharing, or upload the file directly.",
            ),
          );
        } // Explain inaccessible sources without leaking network details.

        // Initialize chunks for the current operation.
        const chunks = [];
        let size = 0; // Track the download budget.

        // Run response.on with the arguments below.
        response.on("data", (chunk) => {
          size += chunk.length;

          if (size > 12 * 1024 * 1024)
            // Run request.destroy with the arguments below.
            request.destroy(new Error("Source exceeds the 12 MB limit."));
          // Handle the alternative case.
          else chunks.push(chunk);
        }); // Stop oversized responses early.

        response.on("end", () =>
          // Run resolve with the arguments below.
          resolve({
            // Set the buffer option for this operation.
            buffer: Buffer.concat(chunks),
            // Set the type option for this operation.
            type: response.headers["content-type"] || "",
            // Set the url option for this operation.
            url: url.href,
          }),
        ); // Return bytes with their reported format.

        response.on("error", reject); // Propagate interrupted responses.
      },
    ); // Finish request construction.

    // Run request.setTimeout with the arguments below.
    request.setTimeout(15000, () =>
      request.destroy(new Error("Source timed out. Try uploading it.")),
    ); // Bound stalled network requests.

    request.on("error", reject); // Propagate network failures.
  }); // Finish the download promise.
} // Finish the protected remote fetch.

// Reject expanded Office archives that exceed the parser budget.
function inspectArchive(buffer) {
  // Initialize total for the current operation.
  let total = 0;
  let count = 0; // Track central-directory expansion declarations.

  // Scan central-directory entries before decompression.
  for (let i = 0; i + 46 < buffer.length; i++) {
    if (buffer.readUInt32LE(i) !== 0x02014b50) continue; // Ignore bytes outside a central-directory record.

    // Sum declared uncompressed sizes and entry count.
    total += buffer.readUInt32LE(i + 24);
    count++;

    if (total > 40 * 1024 * 1024 || count > 3000)
      throw new Error("Office archive is too large to process safely."); // Prevent ordinary archive bombs.

    // Skip variable-length entry fields.
    i +=
      // Run buffer.readUInt16LE with the arguments below.
      45 +
      buffer.readUInt16LE(i + 28) +
      buffer.readUInt16LE(i + 30) +
      buffer.readUInt16LE(i + 32);
  } // Finish archive inspection.

  if (!count) throw new Error("This is not a supported Office archive."); // Reject malformed packages.
} // Finish archive validation.

// Extract text from supported document and caption formats.
export async function extract(buffer, filename, type = "") {
  const ext = filename.toLowerCase().split(".").pop(); // Identify the user-selected file format.
  let text = ""; // Collect readable source material.

  if (ext === "pdf" || type.includes("application/pdf"))
    text = (await pdf(buffer)).text; // Read text layers from PDF pages.
  else if (["docx", "pptx", "xlsx"].includes(ext)) {
    // Process modern Office documents.
    inspectArchive(buffer); // Check expansion limits before opening the archive.

    if (ext === "docx") text = readDocxText(buffer); // Preserve Word paragraph content.

    if (ext === "pptx") {
      // Preserve slide order for presentations.
      const files = unzipSync(buffer); // Expand the inspected slide archive.
      const parser = new XMLParser({ ignoreAttributes: false, processEntities: false }); // Read text nodes with their namespace labels.

      // Initialize texts for the current operation.
      const texts = (value) =>
        typeof value !== "object" || value === null
          ?
            []
          :
            // Run Object.entries with the arguments below.
            Object.entries(value).flatMap(([key, item]) =>
              key === "a:t"
                ?
                  [String(item)]
                :
                  // Run Array.isArray with the arguments below.
                  Array.isArray(item)
                  ?
                    // Run item.flatMap with the arguments below.
                    item.flatMap(texts)
                  : // Recursively collect slide text runs.
                    // Run texts with the arguments below.
                    texts(item),
            );

      // Continue the current transformation.
      text = Object.keys(files)
        .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
        .sort(
          // Run Number with the arguments below.
          (a, b) =>
            Number(a.match(/slide(\d+)/)[1]) - Number(b.match(/slide(\d+)/)[1]),
        )
        .map(
          (name, index) =>
            `Slide ${index + 1}\n${texts(parser.parse(Buffer.from(files[name]).toString())).join(" ")}`,
        )
        .join("\n\n"); // Label each slide in reading order.
    } // Finish slide extraction.

    if (ext === "xlsx") {
      // Read just the text-bearing Office XML; never load macros, links or formula engines.
      text = readXlsxText(buffer);
    }

    // Accept text, tables, and video captions.
  } else if (
    // Run type.startsWith with the arguments below.
    ["txt", "md", "csv", "vtt", "srt"].includes(ext) ||
    type.startsWith("text/plain")
  )
    text = buffer.toString("utf8");
  else if (type.includes("text/html")) {
    // Extract an accessible webpage.
    // Initialize $ for the current operation.
    const $ = load(buffer.toString("utf8"));

    $("script,style,nav,footer,header,iframe,form").remove(); // Remove executable and navigation noise.
    text = $("main,article").first().text() || $("body").text(); // Prefer the page's primary content.
  } else
    throw new Error(
      // Reject unsupported binary input.
      "Supported formats: PDF, DOCX, PPTX, XLSX, TXT, MD, CSV, VTT, and SRT.",
    );

  text = text
    .replace(/\r/g, "")
    // Normalize spacing without changing facts.
    .replace(/[ \t]+/g, " ")
    .replace(/\n{4,}/g, "\n\n")
    .trim();

  if (!text)
    throw new Error(
      // Avoid inventing content from image-only files.
      "No readable text found. Scanned PDFs need OCR before upload.",
    );

  if (text.length > MAX_TEXT)
    throw new Error(
      // Never silently truncate submitted documents.
      "This document is too long. Split it into smaller sections (240,000 characters each).",
    );

  return text; // Return the extracted source text.
} // Finish format extraction.

// Select labeled evidence within a deterministic prompt budget.
export function retrieve(sources, question, maxChars = 26000) {
  // Initialize terms for the current operation.
  const terms = [
    // Build simple multilingual search tokens without another AI model.
    ...new Set(question.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || []),
  ];

  const chunks = sources.flatMap((source) =>
    // Run source.text.match with the arguments below.
    source.text.match(/[\s\S]{1,1800}/g).map((text, index) => ({
      // Set the id option for this operation.
      id: source.id,
      // Set the name option for this operation.
      name: source.name,
      url: source.url,
      // Set the passage option for this operation.
      passage: index + 1,
      // Rank document passages by query overlap.
      // Set the score option for this operation.
      text,
      score: terms.reduce(
        (sum, term) => sum + (text.toLowerCase().includes(term) ? 1 : 0),
        0,
      ),
    })),
  );

  // Initialize selected for the current operation.
  const selected = [];
  let size = 0; // Track the chosen evidence budget.

  for (const chunk of chunks.sort((a, b) => b.score - a.score)) {
    if (size + chunk.text.length > maxChars) continue;

    // Run selected.push with the arguments below.
    selected.push(chunk);

    // Include as much ranked evidence as fits.
    size += chunk.text.length;
  }

  return selected.map((chunk, index) => ({ ...chunk, label: `S${index + 1}` })); // Assign citation labels used by the model and UI.
} // Finish retrieval.