import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { StudentMarks, Subject, SequenceResult, TermResult, AnnualResult } from "../types";

export const generateStudentReport = (
  student: string,
  studentIndex: number,
  studentMarks: StudentMarks,
  subjects: Subject[],
  studentComments: {
    [studentIndex: number]: { [sequence: string]: string };
  },
  firstTermResults: TermResult[],
  secondTermResults: TermResult[],
  thirdTermResults: TermResult[],
  annualResults: AnnualResult[],
  t: (key: string, options?: any) => string
) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`${t("student_reports")}: ${student}`, 20, 20);

  const sequenceData: string[][] = [];
  const sequences = [
    "firstSequence",
    "secondSequence",
    "thirdSequence",
    "fourthSequence",
    "fifthSequence",
    "sixthSequence",
  ];

  sequences.forEach((seq, idx) => {
    const marksForSequence = studentMarks[seq as keyof StudentMarks];
    subjects.forEach((subject) => {
      const mark = marksForSequence[subject.name] ?? "-";
      const comment = studentComments[studentIndex]?.[seq] || t("no_comment");
      sequenceData.push([
        t(`${seq}`),
        subject.name,
        mark.toString(),
        comment,
      ]);
    });
  });

  autoTable(doc, {
    startY: 30,
    head: [
      [t("sequence"), t("subject_name"), t("mark"), t("teacher_comment")],
    ],
    body: sequenceData,
  });

  let finalY = (doc as any).lastAutoTable.finalY || 30;

  const termData: string[][] = [];
  const termResults = [
    { name: t("first_term"), results: firstTermResults },
    { name: t("second_term"), results: secondTermResults },
    { name: t("third_term"), results: thirdTermResults },
  ];

  termResults.forEach((term) => {
    const result = term.results.find((r) => r.student === student);
    if (result) {
      termData.push([
        term.name,
        result.average.toFixed(2),
        result.rank.toString(),
      ]);
    }
  });

  const annualResult = annualResults.find((r) => r.student === student);
  if (annualResult) {
    termData.push([
      t("annual_summary"),
      annualResult.finalAverage.toFixed(2),
      annualResult.rank.toString(),
    ]);
  }

  doc.setFontSize(12);
  doc.text(t("term_summary"), 20, finalY + 10);
  autoTable(doc, {
    startY: finalY + 20,
    head: [[t("period"), t("average"), t("rank")]],
    body: termData,
  });

  finalY = (doc as any).lastAutoTable.finalY || finalY + 20;
  doc.text(t("progress_notes"), 20, finalY + 10);
  const progressNote =
    studentComments[studentIndex]?.["annual"] || t("no_progress_note");
  doc.text(progressNote, 20, finalY + 20);

  doc.save(`${student}_report.pdf`);
};

export const generateResultsPDF = (
  title: string,
  results: SequenceResult[] | TermResult[] | AnnualResult[],
  classAvg: number,
  passPerc: number,
  isAnnual: boolean,
  t: (key: string, options?: any) => string
) => {
  const doc = new jsPDF();
  doc.text(`${t("app_title")} - ${title}`, 20, 20);
  
  const tableHead = isAnnual
    ? [
        [
          t("rank"),
          t("student"),
          t("first_term_avg"),
          t("second_term_avg"),
          t("third_term_avg"),
          t("final_avg"),
        ],
      ]
    : [[t("rank"), t("student"), t("total_marks"), t("average")]];
  
  const tableData = isAnnual
    ? (results as AnnualResult[]).map((result) => [
        result.rank.toString(),
        result.student,
        result.firstTermAverage.toFixed(2),
        result.secondTermAverage.toFixed(2),
        result.thirdTermAverage.toFixed(2),
        result.finalAverage.toFixed(2),
      ])
    : (results as (SequenceResult | TermResult)[]).map((result) => [
        result.rank.toString(),
        result.student,
        result.totalMarks.toFixed(2),
        result.average.toFixed(2),
      ]);

  autoTable(doc, {
    startY: 30,
    head: tableHead,
    body: tableData,
  });

  const finalY = (doc as any).lastAutoTable.finalY || 30;
  doc.text(t("class_average", { value: classAvg.toFixed(2) }), 20, finalY + 10);
  doc.text(
    t("pass_percentage", { value: passPerc.toFixed(2) }),
    20,
    finalY + 20
  );

  doc.save(`${title.toLowerCase().replace(" ", "-")}.pdf`);
};