import PptxGenJS from "pptxgenjs";

/** Experimental PowerPoint export. NOT part of the demo runtime. */
export async function generatePowerPoint(artifact, sections) {
    // Build an editable widescreen slide deck.
    // Initialize pptx for the current operation.
    // Initialize pptx for the current operation.
    const pptx = new PptxGenJS();
    // Supply this expression to the enclosing operation.
    // Set presentation metadata.
    pptx.layout = "LAYOUT_WIDE";
    // Set presentation metadata.
    // Set presentation metadata.
    pptx.author = "StudySpace";
    pptx.subject = "Source-grounded study notes"; // Set presentation metadata.
    // Initialize slide for the current operation.
    // Initialize slide for the current operation.
    const slide = (title, body) => {
      // Initialize page for the current operation.
      // Initialize page for the current operation.
      const page = pptx.addSlide();
      // Supply this expression to the enclosing operation.
      // Run page.addText with the arguments below.
      page.background = { color: "F7F8F4" };
      // Run page.addText with the arguments below.
      // Run page.addText with the arguments below.
      page.addText(title, {
        // Set the x option for this operation.
        // Set the x option for this operation.
        x: 0.7,
        // Set the y option for this operation.
        // Set the y option for this operation.
        y: 0.55,
        // Set the w option for this operation.
        // Set the w option for this operation.
        w: 11.8,
        // Set the h option for this operation.
        // Set the h option for this operation.
        h: 1.1,
        // Set the fontSize option for this operation.
        // Set the fontSize option for this operation.
        fontSize: 28,
        // Set the bold option for this operation.
        // Set the bold option for this operation.
        bold: true,
        // Set the color option for this operation.
        // Set the color option for this operation.
        color: "193B34",
        // Set the breakLine option for this operation.
        // Set the breakLine option for this operation.
        breakLine: false,
        // Set the fit option for this operation.
        // Set the fit option for this operation.
        fit: "shrink",
        // Close the current expression or block.
      // Close the current expression or block.
      });
      // Run page.addText with the arguments below.
      // Run page.addText with the arguments below.
      page.addText(body, {
        // Set the x option for this operation.
        // Set the x option for this operation.
        x: 0.75,
        // Set the y option for this operation.
        // Set the y option for this operation.
        y: 1.85,
        // Set the w option for this operation.
        // Set the w option for this operation.
        w: 11.7,
        // Set the h option for this operation.
        // Set the h option for this operation.
        h: 4.7,
        // Set the fontSize option for this operation.
        // Set the fontSize option for this operation.
        fontSize: 19,
        // Set the color option for this operation.
        // Set the color option for this operation.
        color: "263D38",
        // Set the valign option for this operation.
        // Set the valign option for this operation.
        valign: "top",
        // Set the fit option for this operation.
        // Set the fit option for this operation.
        fit: "shrink",
        // Set the margin option for this operation.
        // Set the margin option for this operation.
        margin: 0.05,
        // Close the current expression or block.
      // Close the current expression or block.
      });
      // Run page.addText with the arguments below.
      // Run page.addText with the arguments below.
      page.addText("STUDYSPACE • Review against original sources", {
        // Set the x option for this operation.
        // Set the x option for this operation.
        x: 0.75,
        // Set the y option for this operation.
        // Set the y option for this operation.
        y: 7,
        // Set the w option for this operation.
        // Set the w option for this operation.
        w: 11,
        // Set the h option for this operation.
        // Set the h option for this operation.
        h: 0.2,
        // Set the fontSize option for this operation.
        // Set the fontSize option for this operation.
        fontSize: 9,
        // Set the color option for this operation.
        // Set the color option for this operation.
        color: "64766E",
        // Close the current expression or block.
      // Close the current expression or block.
      });
    }; // Apply a consistent, high-contrast slide layout.
    // Run slide with the arguments below.
    // Run slide with the arguments below.
    slide(
      // Supply this expression to the enclosing operation.
      // Create a clear title slide.
      artifact.title,
      // Create a clear title slide.
      // Create a clear title slide.
      "Learning notes • Generated from your selected sources",
    ); // Create a clear title slide.
    // Supply this expression to the enclosing operation.
    // Initialize parts for the current operation.
    for (const section of sections) {
      // Initialize parts for the current operation.
      // Initialize parts for the current operation.
      const parts = section.body.match(/[\s\S]{1,900}/g) || [""];
      // Run parts.forEach with the arguments below.
      // Run parts.forEach with the arguments below.
      parts.forEach(
        // Run slide with the arguments below.
        (part, index) =>
          // Run slide with the arguments below.
          // Run slide with the arguments below.
          slide(section.heading + (index ? " — continued" : ""), part),
        // Close the current expression or block.
      // Close the current expression or block.
      );
    } // Split dense material over multiple slides.
    // Return the result to the calling operation.
    // Return the result to the calling operation.
    return {
      // Set the buffer option for this operation.
      // Set the buffer option for this operation.
      buffer: await pptx.write({ outputType: "nodebuffer" }),
      // Set the mime option for this operation.
      // Set the mime option for this operation.
      mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    }; // Return a real PPTX package.
}
