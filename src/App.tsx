import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Subject,
  StudentMarks,
  SequenceResult,
  TermResult,
  AnnualResult,
} from "./types";
import StudentModal from "./components/StudentModal";
import SubjectModal from "./components/SubjectModal";
import ReportModal from "./components/ReportModal";
import MarksTable from "./components/MarksTable";
import ResultsTable from "./components/ResultsTable";
import BulkMarksEntry from "./components/BulkMarksEntry";
import { generateStudentReport, generateResultsPDF } from "./utils/pdfGenerator";

function App() {
  const { t, i18n } = useTranslation();

  // Language handler
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // Student state
  const [students, setStudents] = useState<string[]>([]);
  const [studentsOpen, setStudentsOpen] = useState<boolean>(false);

  // Subject state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsOpen, setSubjectsOpen] = useState<boolean>(false);

  // Marks and results state
  const [marks, setMarks] = useState<StudentMarks[]>([]);
  const [studentComments, setStudentComments] = useState<{
    [studentIndex: number]: { [sequence: string]: string };
  }>({});
  const [sequenceResults, setSequenceResults] = useState<SequenceResult[]>([]);
  const [firstTermResults, setFirstTermResults] = useState<TermResult[]>([]);
  const [secondTermResults, setSecondTermResults] = useState<TermResult[]>([]);
  const [thirdTermResults, setThirdTermResults] = useState<TermResult[]>([]);
  const [annualResults, setAnnualResults] = useState<AnnualResult[]>([]);
  const [sequenceClassAverage, setSequenceClassAverage] = useState<
    number | null
  >(null);
  const [sequencePassPercentage, setSequencePassPercentage] = useState<
    number | null
  >(null);
  const [firstTermClassAverage, setFirstTermClassAverage] = useState<
    number | null
  >(null);
  const [secondTermClassAverage, setSecondTermClassAverage] = useState<
    number | null
  >(null);
  const [thirdTermClassAverage, setThirdTermClassAverage] = useState<
    number | null
  >(null);
  const [annualClassAverage, setAnnualClassAverage] = useState<number | null>(
    null
  );
  const [firstTermPassPercentage, setFirstTermPassPercentage] = useState<
    number | null
  >(null);
  const [secondTermPassPercentage, setSecondTermPassPercentage] = useState<
    number | null
  >(null);
  const [thirdTermPassPercentage, setThirdTermPassPercentage] = useState<
    number | null
  >(null);
  const [annualPassPercentage, setAnnualPassPercentage] = useState<
    number | null
  >(null);
  const [selectedSequence, setSelectedSequence] = useState<
    | "firstSequence"
    | "secondSequence"
    | "thirdSequence"
    | "fourthSequence"
    | "fifthSequence"
    | "sixthSequence"
  >("firstSequence");
  const [selectedResultView, setSelectedResultView] = useState<
    "sequence" | "firstTerm" | "secondTerm" | "thirdTerm" | "annual"
  >("sequence");
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [bulkMarksModalOpen, setBulkMarksModalOpen] = useState<boolean>(false);

  const PASSING_MARK = 10;

  // Load data from localStorage
  useEffect(() => {
    const savedStudents = localStorage.getItem("students");
    const savedSubjects = localStorage.getItem("subjects");
    const savedMarks = localStorage.getItem("marks");
    const savedComments = localStorage.getItem("studentComments");

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
    if (savedMarks) {
      const parsedMarks = JSON.parse(savedMarks);
      if (
        Array.isArray(parsedMarks) &&
        parsedMarks.length > 0 &&
        !parsedMarks[0].firstSequence
      ) {
        setMarks(
          parsedMarks.map((oldMark: { [key: string]: number | "" }) => ({
            firstSequence: oldMark,
            secondSequence: {},
            thirdSequence: {},
            fourthSequence: {},
            fifthSequence: {},
            sixthSequence: {},
          }))
        );
      } else {
        setMarks(
          parsedMarks.map((mark: Partial<StudentMarks>) => ({
            firstSequence: mark.firstSequence || {},
            secondSequence: mark.secondSequence || {},
            thirdSequence: mark.thirdSequence || {},
            fourthSequence: mark.fourthSequence || {},
            fifthSequence: mark.fifthSequence || {},
            sixthSequence: mark.sixthSequence || {},
          }))
        );
      }
    } else if (savedStudents && !savedMarks) {
      setMarks(
        JSON.parse(savedStudents).map(() => ({
          firstSequence: {},
          secondSequence: {},
          thirdSequence: {},
          fourthSequence: {},
          fifthSequence: {},
          sixthSequence: {},
        }))
      );
    }
    if (savedComments) {
      setStudentComments(JSON.parse(savedComments));
    }
  }, []);

  // Save students to localStorage
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem("students", JSON.stringify(students));
    } else {
      localStorage.removeItem("students");
    }
  }, [students]);

  // Save subjects to localStorage
  useEffect(() => {
    if (subjects.length > 0) {
      localStorage.setItem("subjects", JSON.stringify(subjects));
    } else {
      localStorage.removeItem("subjects");
    }
  }, [subjects]);

  // Save marks to localStorage
  useEffect(() => {
    if (marks.length > 0) {
      localStorage.setItem("marks", JSON.stringify(marks));
    } else {
      localStorage.removeItem("marks");
    }
  }, [marks]);

  // Save comments to localStorage
  useEffect(() => {
    if (Object.keys(studentComments).length > 0) {
      localStorage.setItem("studentComments", JSON.stringify(studentComments));
    } else {
      localStorage.removeItem("studentComments");
    }
  }, [studentComments]);

  // Reset all data
  const handleResetData = () => {
    if (window.confirm(t("confirm_reset"))) {
      localStorage.clear();
      setStudents([]);
      setSubjects([]);
      setMarks([]);
      setStudentComments({});
      setSequenceResults([]);
      setFirstTermResults([]);
      setSecondTermResults([]);
      setThirdTermResults([]);
      setAnnualResults([]);
      setSequenceClassAverage(null);
      setSequencePassPercentage(null);
      setFirstTermClassAverage(null);
      setSecondTermClassAverage(null);
      setThirdTermClassAverage(null);
      setAnnualClassAverage(null);
      setFirstTermPassPercentage(null);
      setSecondTermPassPercentage(null);
      setThirdTermPassPercentage(null);
      setAnnualPassPercentage(null);
      setSelectedSequence("firstSequence");
      setSelectedResultView("sequence");
    }
  };

  // Student handlers
  const handleAddStudent = (name: string) => {
    const updatedStudents = [...students, name];
    setStudents(updatedStudents);
    setMarks((prevMarks) => [
      ...prevMarks,
      {
        firstSequence: {},
        secondSequence: {},
        thirdSequence: {},
        fourthSequence: {},
        fifthSequence: {},
        sixthSequence: {},
      },
    ]);
  };

  const handleEditStudent = (index: number, name: string) => {
    const updatedStudents = [...students];
    updatedStudents[index] = name;
    setStudents(updatedStudents);
  };

  const handleDeleteStudent = (index: number) => {
    const updatedStudents = students.filter((_, i) => i !== index);
    const updatedMarks = marks.filter((_, i) => i !== index);
    const updatedComments = { ...studentComments };
    delete updatedComments[index];
    setStudents(updatedStudents);
    setMarks(updatedMarks);
    setStudentComments(updatedComments);
  };

  // Subject handlers
  const handleAddSubject = (name: string, total: number) => {
    const newSubject: Subject = { name, total };
    setSubjects([...subjects, newSubject]);
  };

  const handleEditSubject = (index: number, name: string, total: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { name, total };
    setSubjects(updatedSubjects);
  };

  const handleDeleteSubject = (index: number) => {
    const subjectToDelete = subjects[index].name;
    const updatedSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(updatedSubjects);
    const updatedMarks = marks.map((studentMarks) => {
      const newMarks = { ...studentMarks };
      delete newMarks.firstSequence[subjectToDelete];
      delete newMarks.secondSequence[subjectToDelete];
      delete newMarks.thirdSequence[subjectToDelete];
      delete newMarks.fourthSequence[subjectToDelete];
      delete newMarks.fifthSequence[subjectToDelete];
      delete newMarks.sixthSequence[subjectToDelete];
      return newMarks;
    });
    setMarks(updatedMarks);
  };

  // Marks handler
  const handleMarkChange = (
    studentIndex: number,
    subject: string,
    value: string,
    maxTotal: number
  ) => {
    const numValue = value === "" ? "" : Number(value);
    if (
      numValue === "" ||
      (typeof numValue === "number" && numValue >= 0 && numValue <= maxTotal)
    ) {
      setMarks((prevMarks) => {
        const updatedMarks = [...prevMarks];
        updatedMarks[studentIndex] = {
          ...updatedMarks[studentIndex],
          [selectedSequence]: {
            ...updatedMarks[studentIndex][selectedSequence],
            [subject]: numValue,
          },
        };
        return updatedMarks;
      });
    }
  };

  // Comment handler
  const handleCommentChange = (
    studentIndex: number,
    sequence: string,
    comment: string
  ) => {
    setStudentComments((prev) => ({
      ...prev,
      [studentIndex]: {
        ...prev[studentIndex],
        [sequence]: comment,
      },
    }));
  };

  // Calculate Sequence Results
  const calculateSequenceResults = () => {
    const studentResults = students.map((student, index) => {
      const studentMarks = marks[index];
      let totalMarks = 0;
      let totalScore = 0;
      let subjectCount = 0;

      subjects.forEach((subject) => {
        const mark = studentMarks[selectedSequence][subject.name] ?? 0;
        totalMarks += Number(mark);
        const scaledScore = (Number(mark) / subject.total) * 20;
        totalScore += scaledScore;
        subjectCount++;
      });

      const average = subjectCount > 0 ? totalScore / subjectCount : 0;
      return { student, totalMarks, average };
    });

    const sortedResults = [...studentResults].sort(
      (a, b) => b.average - a.average
    );
    const resultsWithRank = sortedResults.map((result, idx) => ({
      ...result,
      rank: idx + 1,
    }));

    const totalAverage = studentResults.reduce(
      (sum, { average }) => sum + average,
      0
    );
    const classAvg = students.length > 0 ? totalAverage / students.length : 0;
    const passedCount = studentResults.filter(
      ({ average }) => average >= PASSING_MARK
    ).length;
    const passPerc =
      students.length > 0 ? (passedCount / students.length) * 100 : 0;

    setSequenceResults(resultsWithRank);
    setSequenceClassAverage(classAvg);
    setSequencePassPercentage(passPerc);
    setSelectedResultView("sequence");
  };

  // Calculate Term Results
  const calculateTermResults = (
    sequence1: keyof StudentMarks,
    sequence2: keyof StudentMarks,
    setResults: React.Dispatch<React.SetStateAction<TermResult[]>>,
    setClassAverage: React.Dispatch<React.SetStateAction<number | null>>,
    setPassPercentage: React.Dispatch<React.SetStateAction<number | null>>,
    requireBoth: boolean = true
  ) => {
    const hasSequence1 = marks.some((m) =>
      Object.values(m[sequence1]).some((v) => v !== "")
    );
    const hasSequence2 = marks.some((m) =>
      Object.values(m[sequence2]).some((v) => v !== "")
    );

    if (requireBoth && (!hasSequence1 || !hasSequence2)) return;
    if (!hasSequence1 && !hasSequence2) return;

    const studentResults = students.map((student, index) => {
      const studentMarks = marks[index];
      let totalMarks = 0;
      let totalScore = 0;
      let subjectCount = 0;

      subjects.forEach((subject) => {
        const mark1 = Number(studentMarks[sequence1][subject.name] ?? 0);
        const mark2 = Number(studentMarks[sequence2][subject.name] ?? 0);
        const rawMark = hasSequence2 ? (mark1 + mark2) / 2 : mark1;
        totalMarks += rawMark;
        const scaledScore = (rawMark / subject.total) * 20;
        totalScore += scaledScore;
        subjectCount++;
      });

      const average = subjectCount > 0 ? totalScore / subjectCount : 0;
      return { student, totalMarks, average };
    });

    const sortedResults = [...studentResults].sort(
      (a, b) => b.average - a.average
    );
    const resultsWithRank = sortedResults.map((result, idx) => ({
      ...result,
      rank: idx + 1,
    }));

    const totalAverage = studentResults.reduce(
      (sum, { average }) => sum + average,
      0
    );
    const classAvg = students.length > 0 ? totalAverage / students.length : 0;
    const passedCount = studentResults.filter(
      ({ average }) => average >= PASSING_MARK
    ).length;
    const passPerc =
      students.length > 0 ? (passedCount / students.length) * 100 : 0;

    setResults(resultsWithRank);
    setClassAverage(classAvg);
    setPassPercentage(passPerc);
  };

  // Calculate Annual Results
  const calculateAnnualResults = () => {
    const hasFirstTerm = marks.some((m) =>
      [m.firstSequence, m.secondSequence].some((s) =>
        Object.values(s).some((v) => v !== "")
      )
    );
    const hasSecondTerm = marks.some((m) =>
      [m.thirdSequence, m.fourthSequence].some((s) =>
        Object.values(s).some((v) => v !== "")
      )
    );
    const hasThirdTerm = marks.some((m) =>
      [m.fifthSequence, m.sixthSequence].some((s) =>
        Object.values(s).some((v) => v !== "")
      )
    );

    if (!hasFirstTerm || !hasSecondTerm || !hasThirdTerm) return;

    const studentResults = students.map((student, index) => {
      const studentMarks = marks[index];
      let firstTermTotal = 0;
      let secondTermTotal = 0;
      let thirdTermTotal = 0;
      let subjectCount = 0;

      subjects.forEach((subject) => {
        const mark1 = Number(studentMarks.firstSequence[subject.name] ?? 0);
        const mark2 = Number(studentMarks.secondSequence[subject.name] ?? 0);
        const mark3 = Number(studentMarks.thirdSequence[subject.name] ?? 0);
        const mark4 = Number(studentMarks.fourthSequence[subject.name] ?? 0);
        const mark5 = Number(studentMarks.fifthSequence[subject.name] ?? 0);
        const mark6 = Number(studentMarks.sixthSequence[subject.name] ?? 0);

        const firstTermAvg = (mark1 + mark2) / 2;
        const secondTermAvg = (mark3 + mark4) / 2;
        const thirdTermAvg = mark6 ? (mark5 + mark6) / 2 : mark5;

        firstTermTotal += (firstTermAvg / subject.total) * 20;
        secondTermTotal += (secondTermAvg / subject.total) * 20;
        thirdTermTotal += (thirdTermAvg / subject.total) * 20;
        subjectCount++;
      });

      const firstTermAverage =
        subjectCount > 0 ? firstTermTotal / subjectCount : 0;
      const secondTermAverage =
        subjectCount > 0 ? secondTermTotal / subjectCount : 0;
      const thirdTermAverage =
        subjectCount > 0 ? thirdTermTotal / subjectCount : 0;
      const finalAverage =
        (firstTermAverage + secondTermAverage + thirdTermAverage) / 3;

      return {
        student,
        firstTermAverage,
        secondTermAverage,
        thirdTermAverage,
        finalAverage,
      };
    });

    const sortedResults = [...studentResults].sort(
      (a, b) => b.finalAverage - a.finalAverage
    );
    const resultsWithRank = sortedResults.map((result, idx) => ({
      ...result,
      rank: idx + 1,
    }));

    const totalFinalAverage = studentResults.reduce(
      (sum, { finalAverage }) => sum + finalAverage,
      0
    );
    const classAvg =
      students.length > 0 ? totalFinalAverage / students.length : 0;
    const passedCount = studentResults.filter(
      ({ finalAverage }) => finalAverage >= PASSING_MARK
    ).length;
    const passPerc =
      students.length > 0 ? (passedCount / students.length) * 100 : 0;

    setAnnualResults(resultsWithRank);
    setAnnualClassAverage(classAvg);
    setAnnualPassPercentage(passPerc);
  };

  // Handle Term Results Calculation
  const handleCalculateTermResults = () => {
    calculateTermResults(
      "firstSequence",
      "secondSequence",
      setFirstTermResults,
      setFirstTermClassAverage,
      setFirstTermPassPercentage,
      true
    );
    calculateTermResults(
      "thirdSequence",
      "fourthSequence",
      setSecondTermResults,
      setSecondTermClassAverage,
      setSecondTermPassPercentage,
      true
    );
    calculateTermResults(
      "fifthSequence",
      "sixthSequence",
      setThirdTermResults,
      setThirdTermClassAverage,
      setThirdTermPassPercentage,
      false
    );
    calculateAnnualResults();
    setSelectedResultView("firstTerm");
  };

  // Generate Individual Student Report
  const handleGenerateStudentReport = (studentIndex: number) => {
    const student = students[studentIndex];
    const studentMarks = marks[studentIndex];
    
    generateStudentReport(
      student,
      studentIndex,
      studentMarks,
      subjects,
      studentComments,
      firstTermResults,
      secondTermResults,
      thirdTermResults,
      annualResults,
      t
    );
  };

  // Generate All Student Reports
  const handleGenerateAllStudentReports = () => {
    students.forEach((_, index) => handleGenerateStudentReport(index));
  };

  // Handle Download PDF for Results
  const handleDownloadPDF = () => {
    let title = "";
    let results: SequenceResult[] | TermResult[] | AnnualResult[] = [];
    let classAvg = 0;
    let passPerc = 0;
    let isAnnual = false;

    if (selectedResultView === "sequence" && sequenceResults.length > 0) {
      title = t(`${selectedSequence}`);
      results = sequenceResults;
      classAvg = sequenceClassAverage ?? 0;
      passPerc = sequencePassPercentage ?? 0;
    } else if (
      selectedResultView === "firstTerm" &&
      firstTermResults.length > 0
    ) {
      title = t("first_term");
      results = firstTermResults;
      classAvg = firstTermClassAverage ?? 0;
      passPerc = firstTermPassPercentage ?? 0;
    } else if (
      selectedResultView === "secondTerm" &&
      secondTermResults.length > 0
    ) {
      title = t("second_term");
      results = secondTermResults;
      classAvg = secondTermClassAverage ?? 0;
      passPerc = secondTermPassPercentage ?? 0;
    } else if (
      selectedResultView === "thirdTerm" &&
      thirdTermResults.length > 0
    ) {
      title = t("third_term");
      results = thirdTermResults;
      classAvg = thirdTermClassAverage ?? 0;
      passPerc = thirdTermPassPercentage ?? 0;
    } else if (selectedResultView === "annual" && annualResults.length > 0) {
      title = t("annual_summary");
      results = annualResults;
      classAvg = annualClassAverage ?? 0;
      passPerc = annualPassPercentage ?? 0;
      isAnnual = true;
    }

    if (results.length === 0) return;
    
    generateResultsPDF(title, results, classAvg, passPerc, isAnnual, t);
  };

  const hasMarks = marks.some((studentMarks) =>
    [
      "firstSequence",
      "secondSequence",
      "thirdSequence",
      "fourthSequence",
      "fifthSequence",
      "sixthSequence",
    ].some((seq) =>
      Object.values(studentMarks[seq as keyof StudentMarks]).some(
        (mark) => mark !== ""
      )
    )
  );

  // Determine if Download PDF button should be disabled
  const isDownloadDisabled =
    (selectedResultView === "sequence" && sequenceResults.length === 0) ||
    (selectedResultView === "firstTerm" && firstTermResults.length === 0) ||
    (selectedResultView === "secondTerm" && secondTermResults.length === 0) ||
    (selectedResultView === "thirdTerm" && thirdTermResults.length === 0) ||
    (selectedResultView === "annual" && annualResults.length === 0);

  // Bulk marks handler
  const handleBulkMarksSave = (
    studentIndex: number,
    subjectName: string,
    mark: number | "",
    maxTotal: number
  ) => {
    const valueStr = mark === "" ? "" : mark.toString();
    handleMarkChange(studentIndex, subjectName, valueStr, maxTotal);
  };

  return (
    <Container maxWidth="lg" sx={{ padding: { xs: 1, sm: 2 }, animationDuration: "0.3s" }}>
      <Grid container spacing={2}>
        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ 
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
              transition: "color 0.3s ease-in-out" 
            }}
          >
            {t("app_title")}
          </Typography>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="language-select-label">{t("language")}</InputLabel>
            <Select
              labelId="language-select-label"
              value={i18n.language}
              label={t("language")}
              onChange={(e) => handleLanguageChange(e.target.value)}
              size="small"
            >
              <MenuItem value="en">{t("english")}</MenuItem>
              <MenuItem value="fr">{t("french")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setStudentsOpen(true)}
              sx={{ 
                minWidth: { xs: 100, sm: 120 },
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)"
                }
              }}
            >
              {t("students")}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setSubjectsOpen(true)}
              disabled={students.length === 0}
              sx={{ 
                minWidth: { xs: 100, sm: 120 },
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)"
                }
              }}
            >
              {t("subjects")}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleResetData}
              sx={{ 
                minWidth: { xs: 100, sm: 120 },
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)"
                }
              }}
            >
              {t("reset_data")}
            </Button>
          </Box>
        </Grid>

        {/* Marks and Comments Entry Table */}
        {subjects.length > 0 && students.length > 0 && (
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{ 
                p: { xs: 1, sm: 2 }, 
                borderRadius: 2, 
                mt: 2,
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: 6
                }
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                {t("enter_marks_comments")}
              </Typography>
              <FormControl sx={{ mb: 2, minWidth: 200 }}>
                <InputLabel id="sequence-select-label">
                  {t("sequence")}
                </InputLabel>
                <Select
                  labelId="sequence-select-label"
                  value={selectedSequence}
                  label={t("sequence")}
                  onChange={(e) =>
                    setSelectedSequence(
                      e.target.value as
                        | "firstSequence"
                        | "secondSequence"
                        | "thirdSequence"
                        | "fourthSequence"
                        | "fifthSequence"
                        | "sixthSequence"
                    )
                  }
                  size="small"
                >
                  <MenuItem value="firstSequence">
                    {t("first_sequence")}
                  </MenuItem>
                  <MenuItem value="secondSequence">
                    {t("second_sequence")}
                  </MenuItem>
                  <MenuItem value="thirdSequence">
                    {t("third_sequence")}
                  </MenuItem>
                  <MenuItem value="fourthSequence">
                    {t("fourth_sequence")}
                  </MenuItem>
                  <MenuItem value="fifthSequence">
                    {t("fifth_sequence")}
                  </MenuItem>
                  <MenuItem value="sixthSequence">
                    {t("sixth_sequence")}
                  </MenuItem>
                </Select>
              </FormControl>
              
              <MarksTable 
                students={students}
                subjects={subjects}
                marks={marks}
                selectedSequence={selectedSequence}
                studentComments={studentComments}
                onMarkChange={handleMarkChange}
                onCommentChange={handleCommentChange}
              />
              
              <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={calculateSequenceResults}
                  disabled={!hasMarks}
                  sx={{ 
                    minWidth: { xs: 100, sm: 120 },
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  {t("calculate_results")}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCalculateTermResults}
                  disabled={!hasMarks}
                  sx={{ 
                    minWidth: { xs: 100, sm: 120 },
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  {t("term_results")}
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => setReportModalOpen(true)}
                  disabled={!hasMarks}
                  sx={{ 
                    minWidth: { xs: 100, sm: 120 },
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  {t("student_reports")}
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setBulkMarksModalOpen(true)}
                  disabled={subjects.length === 0 || students.length === 0}
                  sx={{ 
                    minWidth: { xs: 100, sm: 120 },
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  {t("bulk_marks_entry")}
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Results Table */}
        {(sequenceResults.length > 0 ||
          firstTermResults.length > 0 ||
          secondTermResults.length > 0 ||
          thirdTermResults.length > 0 ||
          annualResults.length > 0) && (
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{ 
                p: { xs: 1, sm: 2 }, 
                borderRadius: 2, 
                mt: 2,
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: 6
                }
              }}
            >
              <ResultsTable 
                selectedResultView={selectedResultView}
                onResultViewChange={setSelectedResultView}
                sequenceResults={sequenceResults}
                firstTermResults={firstTermResults}
                secondTermResults={secondTermResults}
                thirdTermResults={thirdTermResults}
                annualResults={annualResults}
                sequenceClassAverage={sequenceClassAverage}
                firstTermClassAverage={firstTermClassAverage}
                secondTermClassAverage={secondTermClassAverage}
                thirdTermClassAverage={thirdTermClassAverage}
                annualClassAverage={annualClassAverage}
                sequencePassPercentage={sequencePassPercentage}
                firstTermPassPercentage={firstTermPassPercentage}
                secondTermPassPercentage={secondTermPassPercentage}
                thirdTermPassPercentage={thirdTermPassPercentage}
                annualPassPercentage={annualPassPercentage}
                passingMark={PASSING_MARK}
                onDownloadPDF={handleDownloadPDF}
                isDownloadDisabled={isDownloadDisabled}
              />
            </Paper>
          </Grid>
        )}

        {/* Student Modal */}
        <StudentModal 
          open={studentsOpen}
          onClose={() => setStudentsOpen(false)}
          students={students}
          onAddStudent={handleAddStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
        />

        {/* Subject Modal */}
        <SubjectModal 
          open={subjectsOpen}
          onClose={() => setSubjectsOpen(false)}
          subjects={subjects}
          onAddSubject={handleAddSubject}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
        />

        {/* Student Report Selection Modal */}
        <ReportModal 
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          students={students}
          onGenerateReport={handleGenerateStudentReport}
          onGenerateAllReports={handleGenerateAllStudentReports}
        />

        {/* Bulk Marks Entry Modal */}
        <BulkMarksEntry
          open={bulkMarksModalOpen}
          onClose={() => setBulkMarksModalOpen(false)}
          students={students}
          subjects={subjects}
          selectedSequence={selectedSequence}
          onSave={handleBulkMarksSave}
        />
      </Grid>
    </Container>
  );
}

export default App;