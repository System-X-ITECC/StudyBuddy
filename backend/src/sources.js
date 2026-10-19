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
// Reject loopback, private, reserved, and mapped private destinations.
export function publicAddress(address) {
  // Reject loopback, private, reserved, and mapped private destinations.
  // Supply this expression to the enclosing operation.
  // Return the result to the calling operation.
  try {
    // Return the result to the calling operation.
    // Return the result to the calling operation.
    return ipaddr.process(address).range() === "unicast";
    // Treat invalid addresses as unsafe.
  // Return the result to the calling operation.
  } catch {
    // Return the result to the calling operation.
    // Return the result to the calling operation.
    return false;
  } // Treat invalid addresses as unsafe.
} // Finish address classification.
// Convert supported public Google files to export links.
// Convert supported public Google files to export links.
export function normalizeLink(input) {
  // Convert supported public Google files to export links.
  const url = new URL(input); // Require an absolute URL.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    url.protocol !== "https:" ||
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    url.username ||
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    url.password ||
    // Supply this expression to the enclosing operation.
    // Close the current expression or block.
    (url.port && url.port !== "443")
    // Close the current expression or block.
  // Close the current expression or block.
  )
    // Stop this operation with a clear failure.
    // Stop this operation with a clear failure.
    throw new Error(
      // Restrict remote request surfaces.
      // Restrict remote request surfaces.
      "Use a public HTTPS URL without credentials or custom ports.",
    ); // Restrict remote request surfaces.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (url.hostname === "docs.google.com") {
    // Support publicly accessible Google document exports.
    // Initialize match for the current operation.
    // Initialize match for the current operation.
    const match = url.pathname.match(
      // Accept canonical file IDs only.
      // Accept canonical file IDs only.
      /^\/(document|presentation|spreadsheets)\/d\/([\w-]+)/,
    ); // Accept canonical file IDs only.
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (match)
      return `https://docs.google.com/${match[1]}/d/${match[2]}/export?format=${match[1] === "document" ? "txt" : match[1] === "presentation" ? "pptx" : "xlsx"}`; // Request a parser-supported export.
  } // Preserve ordinary source URLs.
  return url.href; // Return the validated input URL.
} // Finish link normalization.
// Fetch bounded public content without DNS rebinding.
// Fetch bounded public content without DNS rebinding.
export async function fetchPublic(input, redirects = 0) {
  // Fetch bounded public content without DNS rebinding.
  const url = new URL(normalizeLink(input)); // Validate every redirect as a fresh URL.
  if (redirects > 4) throw new Error("This source redirected too many times."); // Bound redirect chains.
  const addresses = await lookup(url.hostname, { all: true }); // Resolve all returned network addresses.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (
    // Supply this expression to the enclosing operation.
    // Run addresses.some with the arguments below.
    !addresses.length ||
    // Run addresses.some with the arguments below.
    // Run addresses.some with the arguments below.
    addresses.some((item) => !publicAddress(item.address))
    // Close the current expression or block.
  // Close the current expression or block.
  )
    throw new Error("Only public internet sources are supported."); // Reject mixed public/private answers.
  const address = addresses[0]; // Pin this request to one validated address.
  // Return the result to the calling operation.
  // Return the result to the calling operation.
  return new Promise((resolve, reject) => {
    // Expose the streamed download as a bounded promise.
    // Initialize request for the current operation.
    // Initialize request for the current operation.
    const request = https.get(
      // Preserve TLS hostname checks while pinning DNS.
      // Supply this expression to the enclosing operation.
      url,
      // Supply this expression to the enclosing operation.
      // Set the headers option for this operation.
      {
        // Set the headers option for this operation.
        // Set the headers option for this operation.
        headers: { "User-Agent": "StudySpace/1.0 document-reader" },
        // Set the lookup option for this operation.
        // Set the lookup option for this operation.
        lookup: (_host, options, callback) =>
          // Supply this expression to the enclosing operation.
          // Supply this expression to the enclosing operation.
          options.all
            ? // Supply this expression to the enclosing operation.
              // Run callback with the arguments below.
              callback(null, [address])
            : // Supply this expression to the enclosing operation.
              // Run callback with the arguments below.
              callback(null, address.address, address.family),
        // Close the current expression or block.
      // Close the current expression or block.
      },
      // Preserve TLS hostname checks while pinning DNS.
      // Preserve TLS hostname checks while pinning DNS.
      (response) => {
        // Preserve TLS hostname checks while pinning DNS.
        // Apply the following behavior only when its condition matches.
        // Apply the following behavior only when its condition matches.
        if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
          // Run response.resume with the arguments below.
          // Run response.resume with the arguments below.
          response.resume();
          // Return the result to the calling operation.
          // Return the result to the calling operation.
          return resolve(
            // Run fetchPublic with the arguments below.
            // Run fetchPublic with the arguments below.
            fetchPublic(
              // Supply this expression to the enclosing operation.
              // Supply this expression to the enclosing operation.
              new URL(response.headers.location, url).href,
              // Supply this expression to the enclosing operation.
              // Close the current expression or block.
              redirects + 1,
              // Close the current expression or block.
            // Close the current expression or block.
            ),
            // Close the current expression or block.
          // Close the current expression or block.
          );
        } // Revalidate each redirect destination.
        // Apply the following behavior only when its condition matches.
        // Apply the following behavior only when its condition matches.
        if (response.statusCode !== 200) {
          // Run response.resume with the arguments below.
          // Run response.resume with the arguments below.
          response.resume();
          // Return the result to the calling operation.
          // Return the result to the calling operation.
          return reject(
            // Supply this expression to the enclosing operation.
            // Supply this literal value to the enclosing operation.
            new Error(
              // Supply this literal value to the enclosing operation.
              // Close the current expression or block.
              "Source unavailable. Check public sharing, or upload the file directly.",
              // Close the current expression or block.
            // Close the current expression or block.
            ),
            // Close the current expression or block.
          // Close the current expression or block.
          );
        } // Explain inaccessible sources without leaking network details.
        // Initialize chunks for the current operation.
        // Initialize chunks for the current operation.
        const chunks = [];
        let size = 0; // Track the download budget.
        // Run response.on with the arguments below.
        // Run response.on with the arguments below.
        response.on("data", (chunk) => {
          // Supply this expression to the enclosing operation.
          // Apply the following behavior only when its condition matches.
          size += chunk.length;
          // Apply the following behavior only when its condition matches.
          // Apply the following behavior only when its condition matches.
          if (size > 12 * 1024 * 1024)
            // Run request.destroy with the arguments below.
            // Run request.destroy with the arguments below.
            request.destroy(new Error("Source exceeds the 12 MB limit."));
          // Handle the alternative case.
          // Handle the alternative case.
          else chunks.push(chunk);
        }); // Stop oversized responses early.
        // Run response.on with the arguments below.
        // Run response.on with the arguments below.
        response.on("end", () =>
          // Run resolve with the arguments below.
          // Run resolve with the arguments below.
          resolve({
            // Set the buffer option for this operation.
            // Set the buffer option for this operation.
            buffer: Buffer.concat(chunks),
            // Set the type option for this operation.
            // Set the type option for this operation.
            type: response.headers["content-type"] || "",
            // Set the url option for this operation.
            // Set the url option for this operation.
            url: url.href,
            // Close the current expression or block.
          // Close the current expression or block.
          }),
        ); // Return bytes with their reported format.
        response.on("error", reject); // Propagate interrupted responses.
        // Close the current expression or block.
      // Close the current expression or block.
      },
    ); // Finish request construction.
    // Run request.setTimeout with the arguments below.
    // Run request.setTimeout with the arguments below.
    request.setTimeout(15000, () =>
      // Run request.destroy with the arguments below.
      // Run request.destroy with the arguments below.
      request.destroy(new Error("Source timed out. Try uploading it.")),
    ); // Bound stalled network requests.
    request.on("error", reject); // Propagate network failures.
  }); // Finish the download promise.
} // Finish the protected remote fetch.
// Reject expanded Office archives that exceed the parser budget.
// Reject expanded Office archives that exceed the parser budget.
function inspectArchive(buffer) {
  // Reject expanded Office archives that exceed the parser budget.
  // Initialize total for the current operation.
  // Initialize total for the current operation.
  let total = 0;
  let count = 0; // Track central-directory expansion declarations.
  // Scan central-directory entries before decompression.
  // Scan central-directory entries before decompression.
  for (let i = 0; i + 46 < buffer.length; i++) {
    // Scan central-directory entries before decompression.
    if (buffer.readUInt32LE(i) !== 0x02014b50) continue; // Ignore bytes outside a central-directory record.
    // Sum declared uncompressed sizes and entry count.
    // Sum declared uncompressed sizes and entry count.
    total += buffer.readUInt32LE(i + 24);
    count++; // Sum declared uncompressed sizes and entry count.
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (total > 40 * 1024 * 1024 || count > 3000)
      throw new Error("Office archive is too large to process safely."); // Prevent ordinary archive bombs.
    // Skip variable-length entry fields.
    // Supply this expression to the enclosing operation.
    i +=
      // Supply this expression to the enclosing operation.
      // Run buffer.readUInt16LE with the arguments below.
      45 +
      // Run buffer.readUInt16LE with the arguments below.
      // Run buffer.readUInt16LE with the arguments below.
      buffer.readUInt16LE(i + 28) +
      // Run buffer.readUInt16LE with the arguments below.
      // Run buffer.readUInt16LE with the arguments below.
      buffer.readUInt16LE(i + 30) +
      buffer.readUInt16LE(i + 32); // Skip variable-length entry fields.
  } // Finish archive inspection.
  if (!count) throw new Error("This is not a supported Office archive."); // Reject malformed packages.
} // Finish archive validation.
// Extract text from supported document and caption formats.
// Extract text from supported document and caption formats.
export async function extract(buffer, filename, type = "") {
  // Extract text from supported document and caption formats.
  const ext = filename.toLowerCase().split(".").pop(); // Identify the user-selected file format.
  let text = ""; // Collect readable source material.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (ext === "pdf" || type.includes("application/pdf"))
    text = (await pdf(buffer)).text; // Read text layers from PDF pages.
  // Handle the alternative case.
  // Handle the alternative case.
  else if (["docx", "pptx", "xlsx"].includes(ext)) {
    // Process modern Office documents.
    inspectArchive(buffer); // Check expansion limits before opening the archive.
    if (ext === "docx") text = readDocxText(buffer); // Preserve Word paragraph content.
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (ext === "pptx") {
      // Preserve slide order for presentations.
      const files = unzipSync(buffer); // Expand the inspected slide archive.
      const parser = new XMLParser({ ignoreAttributes: false, processEntities: false }); // Read text nodes with their namespace labels.
      // Initialize texts for the current operation.
      // Initialize texts for the current operation.
      const texts = (value) =>
        // Supply this expression to the enclosing operation.
        // Supply this expression to the enclosing operation.
        typeof value !== "object" || value === null
          ? // Supply this expression to the enclosing operation.
            // Supply this expression to the enclosing operation.
            []
          : // Supply this expression to the enclosing operation.
            // Run Object.entries with the arguments below.
            Object.entries(value).flatMap(([key, item]) =>
              // Supply this expression to the enclosing operation.
              // Supply this expression to the enclosing operation.
              key === "a:t"
                ? // Supply this expression to the enclosing operation.
                  // Supply this expression to the enclosing operation.
                  [String(item)]
                : // Supply this expression to the enclosing operation.
                  // Run Array.isArray with the arguments below.
                  Array.isArray(item)
                  ? // Supply this expression to the enclosing operation.
                    // Run item.flatMap with the arguments below.
                    item.flatMap(texts)
                  : // Recursively collect slide text runs.
                    // Run texts with the arguments below.
                    texts(item),
            ); // Recursively collect slide text runs.
      // Supply this expression to the enclosing operation.
      // Continue the current transformation.
      text = Object.keys(files)
        // Continue the current transformation.
        // Continue the current transformation.
        .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
        // Continue the current transformation.
        // Supply this expression to the enclosing operation.
        .sort(
          // Supply this expression to the enclosing operation.
          // Run Number with the arguments below.
          (a, b) =>
            // Run Number with the arguments below.
            // Run Number with the arguments below.
            Number(a.match(/slide(\d+)/)[1]) - Number(b.match(/slide(\d+)/)[1]),
          // Close the current expression or block.
        // Close the current expression or block.
        )
        // Continue the current transformation.
        // Supply this expression to the enclosing operation.
        .map(
          // Supply this expression to the enclosing operation.
          // Supply this expression to the enclosing operation.
          (name, index) =>
            // Supply this expression to the enclosing operation.
            // Close the current expression or block.
            `Slide ${index + 1}\n${texts(parser.parse(Buffer.from(files[name]).toString())).join(" ")}`,
          // Close the current expression or block.
        // Close the current expression or block.
        )
        .join("\n\n"); // Label each slide in reading order.
    } // Finish slide extraction.
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (ext === "xlsx") {
      // Read just the text-bearing Office XML; never load macros, links or formula engines.
      text = readXlsxText(buffer);
    }
    // Accept text, tables, and video captions.
  // Supply this expression to the enclosing operation.
  } else if (
    // Supply this expression to the enclosing operation.
    // Run type.startsWith with the arguments below.
    ["txt", "md", "csv", "vtt", "srt"].includes(ext) ||
    // Run type.startsWith with the arguments below.
    // Run type.startsWith with the arguments below.
    type.startsWith("text/plain")
    // Close the current expression or block.
  // Close the current expression or block.
  )
    text = buffer.toString("utf8"); // Accept text, tables, and video captions.
  // Handle the alternative case.
  // Handle the alternative case.
  else if (type.includes("text/html")) {
    // Extract an accessible webpage.
    // Initialize $ for the current operation.
    // Initialize $ for the current operation.
    const $ = load(buffer.toString("utf8"));
    $("script,style,nav,footer,header,iframe,form").remove(); // Remove executable and navigation noise.
    text = $("main,article").first().text() || $("body").text(); // Prefer the page's primary content.
    // Supply this expression to the enclosing operation.
  // Stop this operation with a clear failure.
  } else
    // Stop this operation with a clear failure.
    // Stop this operation with a clear failure.
    throw new Error(
      // Reject unsupported binary input.
      // Reject unsupported binary input.
      "Supported formats: PDF, DOCX, PPTX, XLSX, TXT, MD, CSV, VTT, and SRT.",
    ); // Reject unsupported binary input.
  // Supply this expression to the enclosing operation.
  // Continue the current transformation.
  text = text
    // Continue the current transformation.
    // Continue the current transformation.
    .replace(/\r/g, "")
    // Continue the current transformation.
    // Normalize spacing without changing facts.
    .replace(/[ \t]+/g, " ")
    // Normalize spacing without changing facts.
    // Normalize spacing without changing facts.
    .replace(/\n{4,}/g, "\n\n")
    .trim(); // Normalize spacing without changing facts.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (!text)
    // Stop this operation with a clear failure.
    // Stop this operation with a clear failure.
    throw new Error(
      // Avoid inventing content from image-only files.
      // Avoid inventing content from image-only files.
      "No readable text found. Scanned PDFs need OCR before upload.",
    ); // Avoid inventing content from image-only files.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (text.length > MAX_TEXT)
    // Stop this operation with a clear failure.
    // Stop this operation with a clear failure.
    throw new Error(
      // Never silently truncate submitted documents.
      // Never silently truncate submitted documents.
      "This document is too long. Split it into smaller sections (240,000 characters each).",
    ); // Never silently truncate submitted documents.
  return text; // Return the extracted source text.
} // Finish format extraction.
// Select labeled evidence within a deterministic prompt budget.
// Select labeled evidence within a deterministic prompt budget.
export function retrieve(sources, question, maxChars = 26000) {
  // Select labeled evidence within a deterministic prompt budget.
  // Initialize terms for the current operation.
  // Initialize terms for the current operation.
  const terms = [
    // Build simple multilingual search tokens without another AI model.
    // Build simple multilingual search tokens without another AI model.
    ...new Set(question.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || []),
  ]; // Build simple multilingual search tokens without another AI model.
  // Initialize chunks for the current operation.
  // Initialize chunks for the current operation.
  const chunks = sources.flatMap((source) =>
    // Run source.text.match with the arguments below.
    // Run source.text.match with the arguments below.
    source.text.match(/[\s\S]{1,1800}/g).map((text, index) => ({
      // Set the id option for this operation.
      // Set the id option for this operation.
      id: source.id,
      // Set the name option for this operation.
      // Set the name option for this operation.
      name: source.name,
      // Set the url option for this operation.
      // Set the url option for this operation.
      url: source.url,
      // Set the passage option for this operation.
      // Set the passage option for this operation.
      passage: index + 1,
      // Rank document passages by query overlap.
      // Set the score option for this operation.
      text,
      // Set the score option for this operation.
      // Set the score option for this operation.
      score: terms.reduce(
        // Supply this expression to the enclosing operation.
        // Supply this expression to the enclosing operation.
        (sum, term) => sum + (text.toLowerCase().includes(term) ? 1 : 0),
        // Supply this expression to the enclosing operation.
        // Close the current expression or block.
        0,
        // Close the current expression or block.
      // Close the current expression or block.
      ),
      // Close the current expression or block.
    // Close the current expression or block.
    })),
  ); // Rank document passages by query overlap.
  // Initialize selected for the current operation.
  // Initialize selected for the current operation.
  const selected = [];
  let size = 0; // Track the chosen evidence budget.
  // Supply this expression to the enclosing operation.
  // Apply the following behavior only when its condition matches.
  for (const chunk of chunks.sort((a, b) => b.score - a.score)) {
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (size + chunk.text.length > maxChars) continue;
    // Run selected.push with the arguments below.
    // Run selected.push with the arguments below.
    selected.push(chunk);
    // Include as much ranked evidence as fits.
    // Include as much ranked evidence as fits.
    size += chunk.text.length;
  } // Include as much ranked evidence as fits.
  return selected.map((chunk, index) => ({ ...chunk, label: `S${index + 1}` })); // Assign citation labels used by the model and UI.
} // Finish retrieval.
