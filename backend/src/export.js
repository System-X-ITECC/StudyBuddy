import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx"; // Produce editable Word documents.
import PDFDocument from "pdfkit"; // Produce searchable text-based PDF study notes.
import { artifactSchema } from "./ai.js"; // Revalidate client-submitted export content.

// Export structured content with predictable typography.
export async function exportArtifact(input, format) {
  const artifact = artifactSchema.parse(input); // Reject malformed or oversized export bodies.

  // Initialize sections for the current operation.
  const sections = [
    // Continue the current transformation.
    ...artifact.sections,
    // Set the heading option for this operation.
    ...artifact.cards.map((card, index) => ({
      heading: `Question ${index + 1}: ${card.front}`,
      // Set the body option for this operation.
      body: card.back,
      // Close the current expression or block.
    })),
  ]; // Include flashcards in exported study notes.

  // Apply the following behavior only when its condition matches.
  if (format === "docx") {
    // Build an editable document.
    // Initialize children for the current operation.
    const children = [
      // Supply this expression to the enclosing operation.
      new Paragraph({ text: artifact.title, heading: HeadingLevel.TITLE }),
      ...sections.flatMap((section) => [
        // Set the text option for this operation.
        new Paragraph({
          text: section.heading,
          heading: HeadingLevel.HEADING_1,
        }),
        ...section.body.split("\n").map(
          (text) =>
            new Paragraph({
              // Set the children option for this operation.
              children: [new TextRun(text)],
              // Set the spacing option for this operation.
              spacing: { after: 140 },
            }),
        ),
      ]),
    ]; // Use semantic headings and readable paragraph spacing.

    // Return the result to the calling operation.
    return {
      // Set the buffer option for this operation.
      buffer: await Packer.toBuffer(new Document({ sections: [{ children }] })),
      // Set the mime option for this operation.
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }; // Serialize a standards-based DOCX.
  } // Finish Word export.

  if (format === "pptx") {
    throw Object.assign(new Error("PowerPoint export is paused for the hackathon demo. Use Word or PDF instead."), { status: 422 });
  }

  if (format !== "pdf") throw new Error("Choose DOCX, PPTX, or PDF."); // Reject unsupported export formats.

  // Initialize doc for the current operation.
  const doc = new PDFDocument({ size: "A4", margin: 54, bufferPages: true });
  const chunks = []; // Create an automatically paginated document.

  // Initialize finished for the current operation.
  const finished = new Promise((resolve, reject) => {
    // Run doc.on with the arguments below.
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  }); // Collect PDF bytes asynchronously.

  if (process.env.PDF_FONT) doc.font(process.env.PDF_FONT); // Allow an installed Unicode font for multilingual work.

  doc.fontSize(25).fillColor("#193B34").text(artifact.title).moveDown(); // Render the document title.

  for (const section of sections) {
    if (doc.y > 680) doc.addPage();

    // Run doc.fontSize with the arguments below.
    doc.fontSize(16).fillColor("#193B34").text(section.heading).moveDown(0.4);

    doc
      .fontSize(11)
      .fillColor("#24372F")
      // Keep headings readable while allowing body pagination.
      .text(section.body, { lineGap: 4 })
      .moveDown();
  }

  // Run doc.end with the arguments below.
  doc.end();

  return { buffer: await finished, mime: "application/pdf" }; // Finalize the PDF bytes.
} // Finish document export.