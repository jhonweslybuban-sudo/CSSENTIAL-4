import { LessonContent } from '../types';

export function generateAcademicHTML(
  lesson: LessonContent,
  studentName: string = 'Registered Student',
  studentId: string = 'CSS-2024-STD',
  yearSection: string = 'General Section'
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #111; line-height: 1.5; padding: 24px; max-width: 820px; margin: 0 auto; background: #ffffff;">
      
      <!-- INSTITUTIONAL ACADEMIC HEADER -->
      <div style="border-bottom: 3px double #1f2937; padding-bottom: 14px; margin-bottom: 20px; text-align: center;">
        <div style="font-size: 11pt; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; color: #1e3a8a;">
          CSSENTIAL • Computer Systems Installation &amp; Configuration
        </div>
        <div style="font-size: 9pt; letter-spacing: 0.5px; color: #4b5563; margin-top: 2px;">
          National Competency Standards Aligned Laboratory Training Program
        </div>
        <div style="font-size: 15pt; font-weight: bold; text-transform: uppercase; margin-top: 10px; color: #111827; letter-spacing: 0.5px;">
          FORMAL LABORATORY PRACTICUM MANUAL &amp; COMPETENCY GUIDE
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9pt; font-family: monospace; color: #374151; margin-top: 8px; border-top: 1px solid #e5e7eb; padding-top: 6px;">
          <span>DOCUMENT REF: <strong>CSS-LAB-M0${lesson.topicNumber}-REV4</strong></span>
          <span>COURSE CODE: <strong>CSIC-301</strong></span>
          <span>ESTIMATED DURATION: <strong>${lesson.duration}</strong></span>
        </div>
      </div>

      <!-- STUDENT IDENTIFICATION & VERIFICATION BLOCK -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 10pt; border: 1px solid #9ca3af;">
        <tbody>
          <tr style="background-color: #f3f4f6;">
            <td style="padding: 6px 10px; border: 1px solid #9ca3af; width: 18%; font-weight: bold;">STUDENT NAME:</td>
            <td style="padding: 6px 10px; border: 1px solid #9ca3af; width: 32%; font-family: sans-serif; font-weight: 600;">${studentName}</td>
            <td style="padding: 6px 10px; border: 1px solid #9ca3af; width: 18%; font-weight: bold;">STUDENT ID:</td>
            <td style="padding: 6px 10px; border: 1px solid #9ca3af; width: 32%; font-family: monospace;">${studentId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #9ca3af; font-weight: bold;">YEAR &amp; SECTION:</td>
            <td style="padding: 6px 10px; border: 1px solid #9ca3af; font-family: sans-serif;">${yearSection}</td>
            <td style="padding: 6px 10px; border: 1px solid #9ca3af; font-weight: bold;">DATE PERFORMED:</td>
            <td style="padding: 6px 10px; border: 1px solid #9ca3af;">${dateStr}</td>
          </tr>
          <tr style="background-color: #f9fafb;">
            <td style="padding: 6px 10px; border: 1px solid #9ca3af; font-weight: bold;">LAB STATION NO.:</td>
            <td style="padding: 6px 10px; border: 1px solid #9ca3af;">Station # [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</td>
            <td style="padding: 6px 10px; border: 1px solid #9ca3af; font-weight: bold;">EVALUATOR:</td>
            <td style="padding: 6px 10px; border: 1px solid #9ca3af;">Lab Instructor / Professor</td>
          </tr>
        </tbody>
      </table>

      <!-- MODULE TITLE BANNER -->
      <div style="background-color: #1e3a8a; color: #ffffff; padding: 10px 16px; margin-bottom: 20px; border-radius: 4px;">
        <div style="font-size: 9pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #93c5fd;">
          LABORATORY MODULE ${lesson.topicNumber}
        </div>
        <div style="font-size: 14pt; font-weight: bold; margin-top: 2px;">
          ${lesson.title}
        </div>
      </div>

      <!-- 1. LEARNING OUTCOMES -->
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 8px; color: #1e3a8a;">
          1. Competency Learning Objectives (Bloom's Taxonomy)
        </h3>
        <p style="font-size: 9.5pt; font-style: italic; color: #374151; margin-bottom: 6px;">
          Upon successful completion of this laboratory module, the technician student will be capable of demonstrating:
        </p>
        <ul style="margin: 0; padding-left: 24px; font-size: 10pt; line-height: 1.6;">
          ${lesson.objectives.map(obj => `<li style="margin-bottom: 4px;"><strong>[LO]</strong> ${obj}</li>`).join('')}
        </ul>
      </div>

      <!-- 2. OCCUPATIONAL SAFETY & ESD PROTOCOLS -->
      <div style="margin-bottom: 22px; border: 1.5px solid #dc2626; background-color: #fef2f2; padding: 12px 16px; border-radius: 4px;">
        <div style="font-size: 10pt; font-weight: bold; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          &#9888; MANDATORY OCCUPATIONAL HEALTH &amp; SAFETY (OHS) PROTOCOLS
        </div>
        <ul style="margin: 0; padding-left: 20px; font-size: 9.5pt; color: #7f1d1d; line-height: 1.5;">
          ${lesson.reminders.map(rem => `<li style="margin-bottom: 3px;">${rem}</li>`).join('')}
        </ul>
      </div>

      <!-- 3. STEP-BY-STEP PRACTICAL PROCEDURE -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 10px; color: #1e3a8a;">
          2. Step-by-Step Technical Operating Procedure
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; border: 1px solid #d1d5db;">
          <thead>
            <tr style="background-color: #1f2937; color: #ffffff; text-align: left;">
              <th style="padding: 8px 10px; border: 1px solid #374151; width: 8%; text-align: center;">STEP</th>
              <th style="padding: 8px 10px; border: 1px solid #374151; width: 32%;">PROCEDURE MILESTONE</th>
              <th style="padding: 8px 10px; border: 1px solid #374151; width: 42%;">OPERATIONAL DETAILS</th>
              <th style="padding: 8px 10px; border: 1px solid #374151; width: 18%; text-align: center;">VERIFIED</th>
            </tr>
          </thead>
          <tbody>
            ${lesson.steps.map(s => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 10px; border: 1px solid #d1d5db; text-align: center; font-weight: bold; vertical-align: top;">
                  ${s.step}
                </td>
                <td style="padding: 8px 10px; border: 1px solid #d1d5db; vertical-align: top; font-weight: 600; color: #111827;">
                  ${s.title}
                </td>
                <td style="padding: 8px 10px; border: 1px solid #d1d5db; vertical-align: top;">
                  <div>${s.details}</div>
                  ${s.warning ? `<div style="margin-top: 4px; font-size: 8.5pt; color: #b91c1c; font-style: italic;"><strong>CAUTION:</strong> ${s.warning}</div>` : ''}
                </td>
                <td style="padding: 8px 10px; border: 1px solid #d1d5db; text-align: center; vertical-align: middle; font-family: monospace; font-size: 9pt;">
                  [ &nbsp; ] PASS
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- 4. CORE THEORETICAL PRINCIPLES & SCHEMATICS -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 10px; color: #1e3a8a;">
          3. Technical Principles &amp; Reference Concepts
        </h3>
        ${lesson.contentSections.map(c => `
          <div style="margin-bottom: 12px; background-color: #f9fafb; padding: 10px 14px; border-left: 3px solid #2563eb; border-radius: 0 4px 4px 0;">
            <div style="font-weight: bold; font-size: 10pt; color: #1e40af; margin-bottom: 4px;">
              ${c.heading}
            </div>
            <p style="font-size: 9.5pt; color: #374151; margin: 0 0 6px 0; line-height: 1.5;">
              ${c.body}
            </p>
            ${c.keyPoints && c.keyPoints.length > 0 ? `
              <ul style="margin: 0; padding-left: 18px; font-size: 9pt; color: #1f2937;">
                ${c.keyPoints.map(kp => `<li style="margin-bottom: 2px;">${kp}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <!-- 5. DIAGNOSTIC TROUBLESHOOTING MATRIX -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 10px; color: #1e3a8a;">
          4. Fault Isolation &amp; Diagnostic Benchmarks
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; border: 1px solid #d1d5db;">
          <thead>
            <tr style="background-color: #374151; color: #ffffff;">
              <th style="padding: 6px 10px; border: 1px solid #4b5563; width: 10%; text-align: center;">NO.</th>
              <th style="padding: 6px 10px; border: 1px solid #4b5563; width: 90%;">DIAGNOSTIC BENCHMARK &amp; TROUBLESHOOTING RULE</th>
            </tr>
          </thead>
          <tbody>
            ${lesson.troubleshootingTips.map((tip, idx) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 6px 10px; border: 1px solid #e5e7eb; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 6px 10px; border: 1px solid #e5e7eb; line-height: 1.4;">${tip}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- 6. PERFORMANCE EVALUATION RUBRIC -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 10px; color: #1e3a8a;">
          5. Performance Evaluation Rubric (100% Total)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 9pt; border: 1px solid #9ca3af;">
          <thead>
            <tr style="background-color: #f3f4f6; text-align: left;">
              <th style="padding: 6px 10px; border: 1px solid #9ca3af; width: 35%;">CRITERIA</th>
              <th style="padding: 6px 10px; border: 1px solid #9ca3af; width: 45%;">PERFORMANCE INDICATOR</th>
              <th style="padding: 6px 10px; border: 1px solid #9ca3af; width: 10%; text-align: center;">MAX</th>
              <th style="padding: 6px 10px; border: 1px solid #9ca3af; width: 10%; text-align: center;">SCORE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; font-weight: bold;">Procedural Execution</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af;">Followed precise technical steps, proper socket handling, and connector orientations.</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: center;">30</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: center;">____</td>
            </tr>
            <tr>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; font-weight: bold;">OHS &amp; ESD Compliance</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af;">Observed anti-static grounding, power isolation, and tool safety throughout assembly.</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: center;">25</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: center;">____</td>
            </tr>
            <tr>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; font-weight: bold;">Diagnostic Verification</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af;">Successfully executed POST check, verified hardware telemetry, or resolved fault state.</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: center;">25</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: center;">____</td>
            </tr>
            <tr>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; font-weight: bold;">Workspace &amp; Housekeeping</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af;">Maintained organized 5S bench, proper cable routing, and returned all diagnostic tools.</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: center;">20</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: center;">____</td>
            </tr>
            <tr style="background-color: #f9fafb; font-weight: bold;">
              <td colspan="2" style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: right;">TOTAL EVALUATED SCORE:</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: center;">100</td>
              <td style="padding: 6px 10px; border: 1px solid #9ca3af; text-align: center;">/ 100</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 7. FORMAL SIGN-OFF & CERTIFICATION -->
      <div style="border-top: 2px solid #111827; padding-top: 14px; margin-top: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 9.5pt;">
          <div style="width: 45%; text-align: center;">
            <div style="border-bottom: 1px solid #374151; height: 35px;"></div>
            <div style="margin-top: 4px; font-weight: bold;">${studentName}</div>
            <div style="font-size: 8.5pt; color: #4b5563;">Technician Trainee / Student Signature</div>
          </div>
          <div style="width: 45%; text-align: center;">
            <div style="border-bottom: 1px solid #374151; height: 35px;"></div>
            <div style="margin-top: 4px; font-weight: bold;">Laboratory Faculty / Certifying Assessor</div>
            <div style="font-size: 8.5pt; color: #4b5563;">Assessor Verification &amp; Date</div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 8.5pt; color: #6b7280;">
          CSSENTIAL Competency-Based Educational Platform • Academic Practicum Series • All Rights Reserved
        </div>
      </div>

    </div>
  `;
}

export function generateDocxBlob(
  lesson: LessonContent,
  studentName: string = 'Registered Student',
  studentId: string = 'CSS-2024-STD',
  yearSection: string = 'General Section'
): Blob {
  const htmlContent = generateAcademicHTML(lesson, studentName, studentId, yearSection);
  
  // Microsoft Word XML/HTML Document Wrapper
  const wordDocumentTemplate = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>CSSENTIAL_Topic_${lesson.topicNumber}_Handout</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 8.5in 11.0in;
          margin: 0.8in 0.8in 0.8in 0.8in;
          mso-header-margin: 0.5in;
          mso-footer-margin: 0.5in;
          mso-paper-source: 0;
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000000;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1pt solid #999999;
          padding: 6pt;
        }
        h1, h2, h3 {
          font-family: 'Arial', sans-serif;
          color: #1e3a8a;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  return new Blob(['\ufeff' + wordDocumentTemplate], {
    type: 'application/msword'
  });
}
