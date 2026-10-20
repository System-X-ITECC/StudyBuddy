// Import the module dependencies used below.
import {
  // Isolate parser memory and CPU work.
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from "node:worker_threads";

let active = 0; // Bound concurrent document parsing.

// Parse one uploaded or fetched document in a disposable worker.
export async function extract(buffer, filename, type = "") {
  // Apply the following behavior only when its condition matches.
  if (active >= 2)
    // Stop this operation with a clear failure.
    throw Object.assign(
      // Supply this expression to the enclosing operation.
      // Apply backpressure instead of growing an unbounded queue.
      new Error("Document readers are busy. Try again shortly."),
      { status: 429 },
    );

  active++; // Reserve a parser slot.

  // Await the worker's bounded result.
  // Return the result to the calling operation.
  try {
    return await new Promise((resolve, reject) => {
      // Initialize worker for the current operation.
      const worker = new Worker(new URL(import.meta.url), {
        // Set the workerData option for this operation.
        workerData: { buffer, filename, type },
        // Set the resourceLimits option for this operation.
        resourceLimits: { maxOldGenerationSizeMb: 128 },
      }); // Cap parser heap independently from the API.

      // Initialize timer for the current operation.
      const timer = setTimeout(() => {
        // Run worker.terminate with the arguments below.
        worker.terminate();

        // Run reject with the arguments below.
        reject(
          // Supply this literal value to the enclosing operation.
          new Error(
            "Document parsing exceeded 20 seconds. Split the file into smaller parts.",
            // Close the current expression or block.
          ),
        );
      }, 20000); // Stop excessive parser workloads.

      // Run worker.once with the arguments below.
      worker.once("message", (result) => {
        // Run clearTimeout with the arguments below.
        clearTimeout(timer);
        worker.terminate();

        // Return text or a clear extraction failure.
        result.error ? reject(new Error(result.error)) : resolve(result.text);
      });

      worker.once("error", (error) => {
        clearTimeout(timer);
        reject(new Error("Could not read this document: " + error.message));
      }); // Surface malformed-file and memory failures.

      worker.once("exit", (code) => {
        clearTimeout(timer);
        if (code !== 0)
          reject(new Error("Document reader stopped before completing."));
      }); // Prevent hanging requests after worker exits.
    });
  } finally {
    // Release parser capacity after every outcome.
    active--;
  }
} // Finish isolated extraction.

if (!isMainThread) {
  // Run parser code only in the disposable worker.
  try {
    // Initialize parser for the current operation.
    const parser = await import("./sources.js");

    // Run parentPort.postMessage with the arguments below.
    parentPort.postMessage({
      // Set the text option for this operation.
      text: await parser.extract(
        // Run Buffer.from with the arguments below.
        Buffer.from(workerData.buffer),
        workerData.filename,
        workerData.type,
      ),
    });
  } catch (error) {
    // Serialize the extraction result without a stack trace.
    parentPort.postMessage({ error: error.message });
  }
} // Finish worker entry handling.