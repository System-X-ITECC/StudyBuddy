// Import the module dependencies used below.
// Import the module dependencies used below.
import {
  // Isolate parser memory and CPU work.
  // Isolate parser memory and CPU work.
  Worker,
  // Isolate parser memory and CPU work.
  // Isolate parser memory and CPU work.
  isMainThread,
  // Isolate parser memory and CPU work.
  // Isolate parser memory and CPU work.
  parentPort,
  // Isolate parser memory and CPU work.
  // Isolate parser memory and CPU work.
  workerData,
} from "node:worker_threads"; // Isolate parser memory and CPU work.
let active = 0; // Bound concurrent document parsing.
// Parse one uploaded or fetched document in a disposable worker.
// Parse one uploaded or fetched document in a disposable worker.
export async function extract(buffer, filename, type = "") {
  // Parse one uploaded or fetched document in a disposable worker.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (active >= 2)
    // Stop this operation with a clear failure.
    // Stop this operation with a clear failure.
    throw Object.assign(
      // Supply this expression to the enclosing operation.
      // Apply backpressure instead of growing an unbounded queue.
      new Error("Document readers are busy. Try again shortly."),
      // Apply backpressure instead of growing an unbounded queue.
      // Apply backpressure instead of growing an unbounded queue.
      { status: 429 },
    ); // Apply backpressure instead of growing an unbounded queue.
  active++; // Reserve a parser slot.
  // Await the worker's bounded result.
  // Return the result to the calling operation.
  try {
    // Return the result to the calling operation.
    // Return the result to the calling operation.
    return await new Promise((resolve, reject) => {
      // Await the worker's bounded result.
      // Initialize worker for the current operation.
      // Initialize worker for the current operation.
      const worker = new Worker(new URL(import.meta.url), {
        // Set the workerData option for this operation.
        // Set the workerData option for this operation.
        workerData: { buffer, filename, type },
        // Set the resourceLimits option for this operation.
        // Set the resourceLimits option for this operation.
        resourceLimits: { maxOldGenerationSizeMb: 128 },
      }); // Cap parser heap independently from the API.
      // Initialize timer for the current operation.
      // Initialize timer for the current operation.
      const timer = setTimeout(() => {
        // Run worker.terminate with the arguments below.
        // Run worker.terminate with the arguments below.
        worker.terminate();
        // Run reject with the arguments below.
        // Run reject with the arguments below.
        reject(
          // Supply this expression to the enclosing operation.
          // Supply this literal value to the enclosing operation.
          new Error(
            // Supply this literal value to the enclosing operation.
            // Close the current expression or block.
            "Document parsing exceeded 20 seconds. Split the file into smaller parts.",
            // Close the current expression or block.
          // Close the current expression or block.
          ),
          // Close the current expression or block.
        // Close the current expression or block.
        );
      }, 20000); // Stop excessive parser workloads.
      // Run worker.once with the arguments below.
      // Run worker.once with the arguments below.
      worker.once("message", (result) => {
        // Run clearTimeout with the arguments below.
        // Run clearTimeout with the arguments below.
        clearTimeout(timer);
        // Run worker.terminate with the arguments below.
        // Run worker.terminate with the arguments below.
        worker.terminate();
        // Return text or a clear extraction failure.
        // Return text or a clear extraction failure.
        result.error ? reject(new Error(result.error)) : resolve(result.text);
      }); // Return text or a clear extraction failure.
      // Run worker.once with the arguments below.
      // Run worker.once with the arguments below.
      worker.once("error", (error) => {
        // Run clearTimeout with the arguments below.
        // Run clearTimeout with the arguments below.
        clearTimeout(timer);
        // Run reject with the arguments below.
        // Run reject with the arguments below.
        reject(new Error("Could not read this document: " + error.message));
      }); // Surface malformed-file and memory failures.
      // Run worker.once with the arguments below.
      // Run worker.once with the arguments below.
      worker.once("exit", (code) => {
        // Run clearTimeout with the arguments below.
        // Run clearTimeout with the arguments below.
        clearTimeout(timer);
        // Apply the following behavior only when its condition matches.
        // Apply the following behavior only when its condition matches.
        if (code !== 0)
          // Run reject with the arguments below.
          // Run reject with the arguments below.
          reject(new Error("Document reader stopped before completing."));
      }); // Prevent hanging requests after worker exits.
      // Close the current expression or block.
    // Close the current expression or block.
    });
    // Release parser capacity after every outcome.
  // Release parser capacity after every outcome.
  } finally {
    // Release parser capacity after every outcome.
    // Release parser capacity after every outcome.
    active--;
  } // Release parser capacity after every outcome.
} // Finish isolated extraction.
// Apply the following behavior only when its condition matches.
// Apply the following behavior only when its condition matches.
if (!isMainThread) {
  // Run parser code only in the disposable worker.
  // Supply this expression to the enclosing operation.
  // Initialize parser for the current operation.
  try {
    // Initialize parser for the current operation.
    // Initialize parser for the current operation.
    const parser = await import("./sources.js");
    // Run parentPort.postMessage with the arguments below.
    // Run parentPort.postMessage with the arguments below.
    parentPort.postMessage({
      // Set the text option for this operation.
      // Set the text option for this operation.
      text: await parser.extract(
        // Run Buffer.from with the arguments below.
        // Run Buffer.from with the arguments below.
        Buffer.from(workerData.buffer),
        // Supply this expression to the enclosing operation.
        // Supply this expression to the enclosing operation.
        workerData.filename,
        // Supply this expression to the enclosing operation.
        // Close the current expression or block.
        workerData.type,
        // Close the current expression or block.
      // Close the current expression or block.
      ),
      // Close the current expression or block.
    // Close the current expression or block.
    });
    // Serialize the extraction result without a stack trace.
  // Run parentPort.postMessage with the arguments below.
  } catch (error) {
    // Run parentPort.postMessage with the arguments below.
    // Run parentPort.postMessage with the arguments below.
    parentPort.postMessage({ error: error.message });
  } // Serialize the extraction result without a stack trace.
} // Finish worker entry handling.
