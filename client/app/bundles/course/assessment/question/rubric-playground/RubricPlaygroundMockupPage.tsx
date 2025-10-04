// interface Previewanswer {
//   id: number;
//   name: string;
//   grades: number[];
//   answerText: string;
//   comment: string;
// }

// interface PreviewAnswerTableEntry extends Previewanswer {
//   expanded: boolean;
//   highlightEvaluations: {
//     fillColor: string;
//     backgroundColor: string;
//     borderColor: string;
//     grades: number[];
//     comment: string;
//   }[]
// }

// const rubrics = [
//   {
//     id: 0,
//     title: 'Saved Rubric 1',
//     fillColor: 'fill-red-500',
//     borderColor: 'border-red-500',
//     backgroundColor: 'bg-red-100',
//     createdAt: formatMiniDateTime(1759101000000),
//   },
//   {
//     id: 1,
//     title: 'Saved Rubric 2',
//     fillColor: 'fill-blue-500',
//     borderColor: 'border-blue-500',
//     backgroundColor: 'bg-blue-100',
//     createdAt: formatMiniDateTime(1759102000000),
//   },
//   {
//     id: 2,
//     title: 'Saved Rubric 3',
//     fillColor: 'fill-yellow-500',
//     borderColor: 'border-yellow-500',
//     backgroundColor: 'bg-yellow-100',
//     createdAt: formatMiniDateTime(1759103000000),
//   }
// ];

// const categoryIndices = [1, 2, 3, 4, 5, 6];
// const testDataSelections = [1, 2, 3, 4, 5, 6, 7];

//   const testData: Previewanswer[] = [
//   {
//     id: 1,
//     name: "Alice Tan",
//     grades: [2, 2, 2, 2, 2, 2],
//     answerText:
//       "The data in Figures 2B and 2C show that wild-type cells are able to neutralize the acidic medium, while the ato5 mutant fails to do so. This leads to a defect in hyphal morphogenesis under conditions where pH neutralization is needed. The supplemental figure further confirms that ATO5 is necessary for ammonia secretion. Together, this indicates that the defect in the ato5 mutant is not in morphogenesis itself, but in environmental modification. The role of ATO5 is therefore crucial for pH regulation and indirectly for hyphal growth.",
//     comment: "Excellent answer, full marks across all rubric criteria."
//   },
//   {
//     id: 2,
//     name: "Brian Wong",
//     grades: [1, 2, 1, 2, 1, 1],
//     answerText:
//       "In the figures, we see that the ato5 mutant does not form hyphae like the wild type. This suggests a role for ATO5 in the process. It may be because of the mutant's inability to change the medium pH. Another explanation could be that the gene directly controls hyphal development. These results are important for understanding morphogenesis.",
//     comment: "Good attempt, but needs stronger background information and a clearer conclusion."
//   },
//   {
//     id: 3,
//     name: "Cheryl Lim",
//     grades: [2, 1, 0, 1, 1, 1],
//     answerText:
//       "The ato5 mutant cannot make hyphae in the same way as the wild type. The data support this observation. It looks like ATO5 is somehow involved, maybe with pH. I am not sure of the details, but it seems like the cells are affected in multiple ways. This could explain the growth defect we see.",
//     comment: "Partial use of data; terminology and background information are weak."
//   },
//   {
//     id: 4,
//     name: "Daniel Koh",
//     grades: [0, 1, 0, 0, 0, 1],
//     answerText:
//       "The mutant just does not grow hyphae as well. Maybe the gene is broken. I think the data say the mutant cannot make hyphae, so it fails at morphogenesis. That is the main conclusion from the figures.",
//     comment: "Superficial description, missing key interpretation of pH neutralization."
//   },
//   {
//     id: 5,
//     name: "Elaine Ng",
//     grades: [2, 2, 1, 2, 2, 2],
//     answerText:
//       "Figures 2B and 2C indicate that the ato5 mutant is defective in raising the medium pH, unlike the wild type. This is important because neutral pH is necessary for hyphal induction. The supplemental data confirm the defect in ammonia excretion. Thus, the inability to neutralize the environment explains the reduced hyphal growth in the mutant, rather than a direct defect in morphogenesis. The data support the model that ATO5 enables environmental changes that promote hyphae.",
//     comment: "Strong explanation overall, but could include more background details."
//   }
// ,
//   {
//     id: 6,
//     name: "Farid Rahman",
//     grades: [1, 1, 1, 1, 1, 0],
//     answerText:
//       "The ato5 mutant does not form hyphae well. This could mean the gene is related to growth. The figures show some difference compared to wild type, but the exact reason is not clear. Maybe the cells are unhealthy. More data would be needed to conclude strongly.",
//     comment: "Minimal detail; lacks interpretation and misses logical deduction."
//   },
//   {
//     id: 7,
//     name: "Grace Lee",
//     grades: [2, 2, 1, 2, 1, 2],
//     answerText:
//       "Wild-type cells excrete ammonia and raise the pH, allowing hyphal growth, as seen in Figures 2B and 2C. The ato5 mutant fails to do this, which explains its inability to form hyphae. Although it might seem like ATO5 is a morphogenesis gene, the supplemental data suggest its real role is in pH neutralization. This environmental role is essential for hyphae formation in the mutant background.",
//     comment: "Well-argued, though could expand on alternative hypotheses."
//   },
//   {
//     id: 8,
//     name: "Hiroshi Tanaka",
//     grades: [0, 0, 0, 0, 0, 0],
//     answerText:
//       "The figures are confusing. I think the mutant just doesn’t make hyphae and that is the problem. Maybe it is because the gene is missing. That’s all I can say.",
//     comment: "Very weak response, no meaningful use of data or terminology."
//   },
//   {
//     id: 9,
//     name: "Isabelle Goh",
//     grades: [2, 1, 2, 1, 1, 2],
//     answerText:
//       "Figures 2B and 2C suggest that the ato5 mutant has a deficiency compared to wild type. The background information shows that ammonia release is part of the process. The supplemental data point in the same direction. This could mean the mutant fails to change its surroundings in a way that supports hyphae formation.",
//     comment: "Solid background knowledge, but interpretation and deduction could be clearer."
//   },
//   {
//     id: 10,
//     name: "Jason Lim",
//     grades: [1, 2, 2, 1, 2, 1],
//     answerText:
//       "The ato5 mutant has trouble forming hyphae, which the figures make obvious. However, the wild type succeeds because it can modify the environment. The data imply that ATO5 is not directly building hyphae, but is supporting the conditions that allow it. Therefore, the main conclusion is about environmental control, not morphogenesis.",
//     comment: "Accurate interpretation, but missing deeper alternative hypotheses."
//   },
//   {
//     id: 11,
//     name: "Kimberly Ho",
//     grades: [2, 2, 0, 2, 2, 1],
//     answerText:
//       "The mutant strain cannot neutralize the medium and fails to form hyphae. The figures show that wild type cells raise the pH, while ato5 does not. This supports the idea that ATO5 is indirectly needed for morphogenesis. The supplemental data confirm this by showing the loss of ammonia secretion in the mutant.",
//     comment: "Good interpretation and conclusion, but lacking background context."
//   },
//   {
//     id: 12,
//     name: "Liam Chen",
//     grades: [1, 0, 1, 0, 1, 0],
//     answerText:
//       "The mutant cannot grow hyphae. The figures prove this because there are no hyphae. I think the gene is important for hyphae. Maybe it is related to pH but I am not sure.",
//     comment: "Simplistic; misses main mechanistic insight about pH neutralization."
//   }
// ];

// const testData2: Previewanswer[] = [
//   {
//     id: 1,
//     name: "Alice Tan",
//     grades: [2, 2, 2, 2, 2, 2],
//     answerText:
//       "The data in Figures 2B and 2C show that wild-type cells are able to neutralize the acidic medium, while the ato5 mutant fails to do so. This leads to a defect in hyphal morphogenesis under conditions where pH neutralization is needed. The supplemental figure further confirms that ATO5 is necessary for ammonia secretion. Together, this indicates that the defect in the ato5 mutant is not in morphogenesis itself, but in environmental modification. The role of ATO5 is therefore crucial for pH regulation and indirectly for hyphal growth.",
//     comment: "Excellent work, you demonstrated clear understanding across all rubric criteria."
//   },
//   {
//     id: 2,
//     name: "Brian Wong",
//     grades: [1, 2, 1, 2, 2, 1],
//     answerText:
//       "In the figures, we see that the ato5 mutant does not form hyphae like the wild type. This suggests a role for ATO5 in the process. It may be because of the mutant's inability to change the medium pH. Another explanation could be that the gene directly controls hyphal development. These results are important for understanding morphogenesis.",
//     comment: "You did a good job describing the data, but add stronger background details and state your conclusion more clearly."
//   },
//   {
//     id: 3,
//     name: "Cheryl Lim",
//     grades: [2, 1, 1, 1, 1, 1],
//     answerText:
//       "The ato5 mutant cannot make hyphae in the same way as the wild type. The data support this observation. It looks like ATO5 is somehow involved, maybe with pH. I am not sure of the details, but it seems like the cells are affected in multiple ways. This could explain the growth defect we see.",
//     comment: "You picked up some key observations, but try to use more accurate terminology and connect your ideas to background concepts."
//   },
//   {
//     id: 4,
//     name: "Daniel Koh",
//     grades: [0, 1, 0, 1, 0, 1],
//     answerText:
//       "The mutant just does not grow hyphae as well. Maybe the gene is broken. I think the data say the mutant cannot make hyphae, so it fails at morphogenesis. That is the main conclusion from the figures.",
//     comment: "Your explanation is too surface-level. Focus more on what the data show about pH neutralization and environmental effects."
//   },
//   {
//     id: 5,
//     name: "Elaine Ng",
//     grades: [2, 2, 1, 2, 2, 1],
//     answerText:
//       "Figures 2B and 2C indicate that the ato5 mutant is defective in raising the medium pH, unlike the wild type. This is important because neutral pH is necessary for hyphal induction. The supplemental data confirm the defect in ammonia excretion. Thus, the inability to neutralize the environment explains the reduced hyphal growth in the mutant, rather than a direct defect in morphogenesis. The data support the model that ATO5 enables environmental changes that promote hyphae.",
//     comment: "This is a strong explanation. Next time, add a bit more background context to make your answer even stronger."
//   },
//   {
//     id: 6,
//     name: "Farid Rahman",
//     grades: [1, 1, 1, 1, 1, 1],
//     answerText:
//       "The ato5 mutant does not form hyphae well. This could mean the gene is related to growth. The figures show some difference compared to wild type, but the exact reason is not clear. Maybe the cells are unhealthy. More data would be needed to conclude strongly.",
//     comment: "You described the overall outcome, but try to connect it to pH changes and environmental effects to make your reasoning clearer."
//   },
//   {
//     id: 7,
//     name: "Grace Lee",
//     grades: [2, 2, 1, 2, 2, 2],
//     answerText:
//       "Wild-type cells excrete ammonia and raise the pH, allowing hyphal growth, as seen in Figures 2B and 2C. The ato5 mutant fails to do this, which explains its inability to form hyphae. Although it might seem like ATO5 is a morphogenesis gene, the supplemental data suggest its real role is in pH neutralization. This environmental role is essential for hyphae formation in the mutant background.",
//     comment: "You gave a clear and logical explanation. To improve, consider mentioning alternative hypotheses explicitly."
//   },
//   {
//     id: 8,
//     name: "Hiroshi Tanaka",
//     grades: [0, 0, 0, 0, 1, 0],
//     answerText:
//       "The figures are confusing. I think the mutant just doesn’t make hyphae and that is the problem. Maybe it is because the gene is missing. That’s all I can say.",
//     comment: "Your response is too limited. Review the figures carefully and try to explain how pH and ammonia secretion relate to hyphal growth."
//   },
//   {
//     id: 9,
//     name: "Isabelle Goh",
//     grades: [2, 1, 2, 1, 2, 2],
//     answerText:
//       "Figures 2B and 2C suggest that the ato5 mutant has a deficiency compared to wild type. The background information shows that ammonia release is part of the process. The supplemental data point in the same direction. This could mean the mutant fails to change its surroundings in a way that supports hyphae formation.",
//     comment: "You included useful background, but strengthen your data interpretation and make your conclusion more explicit."
//   },
//   {
//     id: 10,
//     name: "Jason Lim",
//     grades: [1, 2, 2, 1, 2, 2],
//     answerText:
//       "The ato5 mutant has trouble forming hyphae, which the figures make obvious. However, the wild type succeeds because it can modify the environment. The data imply that ATO5 is not directly building hyphae, but is supporting the conditions that allow it. Therefore, the main conclusion is about environmental control, not morphogenesis.",
//     comment: "You interpreted the figures well, but remember to propose alternative hypotheses to show deeper reasoning."
//   },
//   {
//     id: 11,
//     name: "Kimberly Ho",
//     grades: [2, 2, 1, 2, 2, 1],
//     answerText:
//       "The mutant strain cannot neutralize the medium and fails to form hyphae. The figures show that wild type cells raise the pH, while ato5 does not. This supports the idea that ATO5 is indirectly needed for morphogenesis. The supplemental data confirm this by showing the loss of ammonia secretion in the mutant.",
//     comment: "You interpreted the figures accurately. Add more background context about wild type behavior to strengthen your explanation."
//   },
//   {
//     id: 12,
//     name: "Liam Chen",
//     grades: [1, 0, 1, 0, 1, 1],
//     answerText:
//       "The mutant cannot grow hyphae. The figures prove this because there are no hyphae. I think the gene is important for hyphae. Maybe it is related to pH but I am not sure.",
//     comment: "Your explanation is too simplistic. Be more specific about what the figures show and connect it to the role of ATO5 in pH neutralization."
//   }
// ];

// const categoryNames = [
//   '"Use of Data  (Description of the figure and highlight significance)"',
//   'Accuracy of Terminology / Concepts / Definitions',
//   'Background information',
//   'Data interpretation',
//   'Logical deduction and Correct Conclusion',
//   'Organization & Writing Quality'
// ]

// const testData3: Previewanswer[] = [
//   {
//     id: 1,
//     name: "Alice Tan",
//     grades: [2, 2, 1, 2, 2, 2],
//     answerText:
//       "The data in Figures 2B and 2C show that wild-type cells are able to neutralize the acidic medium, while the ato5 mutant fails to do so. This leads to a defect in hyphal morphogenesis under conditions where pH neutralization is needed. The supplemental figure further confirms that ATO5 is necessary for ammonia secretion. Together, this indicates that the defect in the ato5 mutant is not in morphogenesis itself, but in environmental modification. The role of ATO5 is therefore crucial for pH regulation and indirectly for hyphal growth.",
//     comment:
//       "How might you make your explanation even stronger by emphasizing the contrast between wild type and mutant more directly?"
//   },
//   {
//     id: 2,
//     name: "Brian Wong",
//     grades: [1, 1, 1, 2, 1, 2],
//     answerText:
//       "In the figures, we see that the ato5 mutant does not form hyphae like the wild type. This suggests a role for ATO5 in the process. It may be because of the mutant's inability to change the medium pH. Another explanation could be that the gene directly controls hyphal development. These results are important for understanding morphogenesis.",
//     comment:
//       "When you consider both hypotheses you mentioned, which one fits the figures more convincingly, and why?"
//   },
//   {
//     id: 3,
//     name: "Cheryl Lim",
//     grades: [2, 1, 1, 2, 1, 1],
//     answerText:
//       "The ato5 mutant cannot make hyphae in the same way as the wild type. The data support this observation. It looks like ATO5 is somehow involved, maybe with pH. I am not sure of the details, but it seems like the cells are affected in multiple ways. This could explain the growth defect we see.",
//     comment:
//       "What background concepts about ammonia secretion or pH regulation could you bring in to clarify the role of ATO5?"
//   },
//   {
//     id: 4,
//     name: "Daniel Koh",
//     grades: [0, 1, 0, 1, 1, 0],
//     answerText:
//       "The mutant just does not grow hyphae as well. Maybe the gene is broken. I think the data say the mutant cannot make hyphae, so it fails at morphogenesis. That is the main conclusion from the figures.",
//     comment:
//       "How could you use the supplemental figure to decide whether the gene’s role is direct or indirect?"
//   },
//   {
//     id: 5,
//     name: "Elaine Ng",
//     grades: [2, 2, 2, 2, 1, 1],
//     answerText:
//       "Figures 2B and 2C indicate that the ato5 mutant is defective in raising the medium pH, unlike the wild type. This is important because neutral pH is necessary for hyphal induction. The supplemental data confirm the defect in ammonia excretion. Thus, the inability to neutralize the environment explains the reduced hyphal growth in the mutant, rather than a direct defect in morphogenesis. The data support the model that ATO5 enables environmental changes that promote hyphae.",
//     comment:
//       "You explained the data clearly. What extra background detail could help the reader connect pH regulation to morphogenesis more smoothly?"
//   },
//   {
//     id: 6,
//     name: "Farid Rahman",
//     grades: [1, 0, 1, 1, 1, 1],
//     answerText:
//       "The ato5 mutant does not form hyphae well. This could mean the gene is related to growth. The figures show some difference compared to wild type, but the exact reason is not clear. Maybe the cells are unhealthy. More data would be needed to conclude strongly.",
//     comment:
//       "What patterns in the figures might help you rule out ‘cell health’ as the explanation and instead link it to pH?"
//   },
//   {
//     id: 7,
//     name: "Grace Lee",
//     grades: [2, 2, 2, 2, 1, 2],
//     answerText:
//       "Wild-type cells excrete ammonia and raise the pH, allowing hyphal growth, as seen in Figures 2B and 2C. The ato5 mutant fails to do this, which explains its inability to form hyphae. Although it might seem like ATO5 is a morphogenesis gene, the supplemental data suggest its real role is in pH neutralization. This environmental role is essential for hyphae formation in the mutant background.",
//     comment:
//       "If you had to strengthen your answer with an alternative hypothesis, what would you propose?"
//   },
//   {
//     id: 8,
//     name: "Hiroshi Tanaka",
//     grades: [0, 0, 1, 0, 0, 0],
//     answerText:
//       "The figures are confusing. I think the mutant just doesn’t make hyphae and that is the problem. Maybe it is because the gene is missing. That’s all I can say.",
//     comment:
//       "Looking again at Figures 2B and 2C, what could you say about the role of pH even if you aren’t sure about all the details?"
//   },
//   {
//     id: 9,
//     name: "Isabelle Goh",
//     grades: [2, 1, 1, 2, 2, 1],
//     answerText:
//       "Figures 2B and 2C suggest that the ato5 mutant has a deficiency compared to wild type. The background information shows that ammonia release is part of the process. The supplemental data point in the same direction. This could mean the mutant fails to change its surroundings in a way that supports hyphae formation.",
//     comment:
//       "Could you strengthen your conclusion by stating more directly how the data support an indirect role rather than a direct one?"
//   },
//   {
//     id: 10,
//     name: "Jason Lim",
//     grades: [1, 2, 1, 1, 2, 1],
//     answerText:
//       "The ato5 mutant has trouble forming hyphae, which the figures make obvious. However, the wild type succeeds because it can modify the environment. The data imply that ATO5 is not directly building hyphae, but is supporting the conditions that allow it. Therefore, the main conclusion is about environmental control, not morphogenesis.",
//     comment:
//       "You described the data well. How could you phrase your two hypotheses more explicitly to show deeper reasoning?"
//   },
//   {
//     id: 11,
//     name: "Kimberly Ho",
//     grades: [2, 1, 2, 2, 1, 2],
//     answerText:
//       "The mutant strain cannot neutralize the medium and fails to form hyphae. The figures show that wild type cells raise the pH, while ato5 does not. This supports the idea that ATO5 is indirectly needed for morphogenesis. The supplemental data confirm this by showing the loss of ammonia secretion in the mutant.",
//     comment:
//       "How might adding more background on wild-type behavior help clarify why ato5 mutants fail?"
//   },
//   {
//     id: 12,
//     name: "Liam Chen",
//     grades: [1, 0, 1, 1, 0, 1],
//     answerText:
//       "The mutant cannot grow hyphae. The figures prove this because there are no hyphae. I think the gene is important for hyphae. Maybe it is related to pH but I am not sure.",
//     comment:
//       "If you think ATO5 may be related to pH, what evidence from the supplemental figure could you use to make that clearer?"
//   }
// ];

// const referenceGrades = {
//   1: [2, 2, 2, 2, 2, 2],
//   2: [1, 1, 1, undefined, undefined, undefined]
// }

//   const allTestData = [testData, testData2, testData3];

// import Table, { ColumnTemplate } from 'lib/components/table';
// import { useParams } from 'react-router-dom';
// import {
//   RubricBasedResponseData,
//   RubricBasedResponseFormData,
// } from 'types/course/assessment/question/rubric-based-responses';

// import RadioButton from 'lib/components/core/buttons/RadioButton';
// import LoadingIndicator from 'lib/components/core/LoadingIndicator';
// import Preload from 'lib/components/wrappers/Preload';
// import toast from 'lib/hooks/toast';
// import useTranslation from 'lib/hooks/useTranslation';
// import formTranslations from 'lib/translations/form';

// import FormRichTextField from 'lib/components/form/fields/RichTextField';
// import FormTextField from 'lib/components/form/fields/TextField';
// import { fetchEditRubricBasedResponse, update } from './operations';
// import Form, { FormRef } from 'lib/components/form/Form';
// import { useRef, useState } from 'react';
// import CompactCategoryManager from './components/HorizontalCategoryManager';
// import { Controller, useForm, useFormContext, useWatch } from 'react-hook-form';
// import { Button, Card, Checkbox, Chip, Divider, IconButton, RadioGroup, Slider, Tab, Tooltip, Typography } from '@mui/material';
// import { Add, Circle, Close, Delete, ExpandLess, ExpandMore, PlayArrow, Save } from '@mui/icons-material';
// import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
// import CategoryManager from './components/CategoryManager';
// import { formatMiniDateTime } from 'lib/moment';

// enum AddSampleMode {
//   SPECIFIC_ANSWER = 's',
//   RANDOM_STUDENT = 'r',
//   CUSTOM_ANSWER = 'c'
// }

// const RubricPlaygroundPage = (): JSX.Element => {
//   const { t } = useTranslation();

//   const params = useParams();
//   const id = parseInt(params?.questionId ?? '', 10) || undefined;

//   if (!id)
//     throw new Error(`RubricPlaygroundPage was loaded with ID: ${id}.`);

//   const fetchData = (): Promise<RubricBasedResponseFormData> =>
//     fetchEditRubricBasedResponse(id);

//   const formRef = useRef<FormRef<RubricBasedResponseFormData>>(null);
//   const [isCategoriesDirty, setIsCategoriesDirty] = useState(false);
//   const [isRubricExpanded, setIsRubricExpanded] = useState(false);

//   const { control: control2, setValue: setValue2, watch: watch2 } = useForm({
//     defaultValues: { title: 'Saved Rubric 1', id: 0 },
//   });
//   const rubric = watch2('id');

//   const selectedTestData = allTestData[rubric].filter(answer => testDataSelections.includes(answer.id));

//   // Add answers prompt
//   const [isAddingAnswers, setIsAddingAnswers] = useState(false);

//   const { control: control3, register: register3, getValues: getValues3, setValue: setValue3 } = useForm({
//     defaultValues: {
//       addMode: AddSampleMode.SPECIFIC_ANSWER,
//       addAnswerIds: [],
//       addRandomAnswerCount: 0,
//       addCustomAnswerText: ''
//     },
//   });

//   const [selectedAddMode, setSelectedAddMode] = useState(AddSampleMode.SPECIFIC_ANSWER);

//   const [expandedRowIds, setExpandedRowIds] = useState<number[]>([]);

//   const answerTableCols: ColumnTemplate<Previewanswer>[] = [
//     {
//       id: 'selectAnswer',
//       title: '',
//       cell: (answer) =>
//                   <Checkbox
//                     defaultChecked={false}  />
//     },
//     {
//       of: 'name',
//       title: 'Student',
//       searchable: true,
//       sortable: true,
//       cell: (answer) => answer.name,
//     },
//     {
//       title: 'Total Grade',
//       searchable: true,
//       sortable: true,
//       sortProps: {
//         sort: (x, y) => x.grades.reduce((a, b) => a + b, 0) - y.grades.reduce((a, b) => a + b, 0)
//       },
//       searchProps: {
//         getValue: (a) => a.grades.reduce((a, b) => a + b, 0),
//       },
//       cell: (answer) => `${answer.grades.reduce((a, b) => a + b, 0)} / 12`,
//     },
//     {
//       of: 'answerText',
//       title: 'Answer',
//       cell: (answer) => <div className='line-clamp-4'>{answer.answerText}</div>,
//     }
//   ];

//   const toggleExpandedRowIds = (answerId) => {
//     if (expandedRowIds.includes(answerId)) {
//       setExpandedRowIds(expandedRowIds.filter(e => e !== answerId));
//     } else {
//       setExpandedRowIds([...expandedRowIds, answerId]);
//     }
//   }

//   const [highlightRubrics, setHighlightRubrics] = useState<number[]>([]);
//   const toggleHighlightRubrics = (rubricId) => {
//     console.log({ rubricId, highlightRubrics });
//     if (highlightRubrics.includes(rubricId)) {
//       setHighlightRubrics(highlightRubrics.filter(e => e !== rubricId));
//     } else {
//       setHighlightRubrics([...highlightRubrics, rubricId]);
//     }
//   }
//   const evalTableCols: ColumnTemplate<PreviewAnswerTableEntry>[] = [
//     {
//       of: 'name',
//       title: 'Student',
//       searchable: true,
//       sortable: true,
//       cell: (answer) => answer.name,
//     },
//     ...categoryIndices.map((_, categoryIndex) => ({
//       id: `grade_${categoryIndex + 1}`,
//       title: (((() => <Tooltip title={categoryNames[categoryIndex]}>
//         <span>C{categoryIndex + 1}</span>
//       </Tooltip>) as unknown) as string),
//       sortable: true,
//       sortProps: {
//         sort: (a, b) => a.grades[categoryIndex] - b.grades[categoryIndex]
//       },
//       searchProps: {
//         getValue: (a) => a.grades[categoryIndex],
//       },
//       cell: (answer: PreviewAnswerTableEntry) => <div className='space-y-1'>
//         {answer.id in referenceGrades && (
//           typeof referenceGrades[answer.id][categoryIndex] === 'number' ?
//         <Card variant='outlined' className={`p-1 bg-green-100 border-green-500`}>
//           <p className='m-0 text-center w-full'>{referenceGrades[answer.id][categoryIndex]} / 2</p>
//         </Card>: <div className='py-1'> &nbsp; </div>)}
//         <p className='m-0 text-center w-full'>{answer.grades[categoryIndex]} / 2</p>
//         {answer.highlightEvaluations.map((ev) => <Card variant='outlined' className={`p-1 ${ev.backgroundColor} ${ev.borderColor}`}>
//           <p className='m-0 text-center w-full'>{ev.grades[categoryIndex]} / 2</p>
//         </Card>)}
//       </div>,
//     })),
//     {
//       title: 'Total',
//       sortable: true,
//       sortProps: {
//         sort: (x, y) => x.grades.reduce((a, b) => a + b, 0) - y.grades.reduce((a, b) => a + b, 0)
//       },
//       searchProps: {
//         getValue: (a) => a.grades.reduce((a, b) => a + b, 0),
//       },
//       cell: (answer: PreviewAnswerTableEntry) => <div className='space-y-1'>
//         {answer.id in referenceGrades && (
//           !referenceGrades[answer.id].some(v => typeof v !== 'number') ?
//         <Card variant='outlined' className={`p-1 bg-green-100 border-green-500`}>
//           <p className='m-0 text-center w-full'>{referenceGrades[answer.id].reduce((a, b) => a + b, 0)} / 12</p>
//         </Card>: <div className='py-1'> &nbsp; </div>)}
//         <p className='m-0 text-center w-full'>{answer.grades.reduce((a, b) => a + b, 0)} / 12</p>
//         {answer.highlightEvaluations.map((ev) => <Card variant='outlined' className={`p-1 ${ev.backgroundColor} ${ev.borderColor}`}>
//           <p className='m-0 text-center w-full'>{ev.grades.reduce((a, b) => a + b, 0)} / 12</p>
//         </Card>)}
//       </div>
//     },
//     {
//       of: 'answerText',
//       title: 'Answer',
//       cell: (answer) => <div className={answer.expanded ? '' : 'line-clamp-4'} onClick={() => toggleExpandedRowIds(answer.id)}>
//         {answer.answerText}
//       </div>
//     },
//     {
//       of: 'comment',
//       title: 'Feedback',
//       cell: (answer) => <div className={answer.expanded ? '' : 'line-clamp-4'} onClick={() => toggleExpandedRowIds(answer.id)}>
//         {answer.comment}
//       </div>
//     },
//     ...highlightRubrics.toSorted().map((rubricId, index) => ({
//       title: `Feedback (${rubrics[rubricId].title})`,
//       cell: (answer: PreviewAnswerTableEntry) => <Card variant='outlined' className={`p-2 ${rubrics[rubricId].backgroundColor} ${rubrics[rubricId].borderColor} ${answer.expanded ? '' : 'line-clamp-4'}`} onClick={() => toggleExpandedRowIds(answer.id)}>
//           {answer.highlightEvaluations[index].comment}
//         </Card>
//     }))
//   ];

//   return (
//     <Preload render={<LoadingIndicator />} while={fetchData}>
//       {(data): JSX.Element => {
//         return <>

//         <Card variant='outlined' className='sticky top-0 px-4 bg-white z-50'>
//         <Form
//           ref={formRef}
//           contextual
//           dirty={isCategoriesDirty}
//           disabled={false}
//           initialValues={data}
//           onSubmit={() => {}}
//         >
//           {(control) => <>
//             <div className='w-full flex justify-center'>
//             <Slider className='w-[90%] pb-10'
//             defaultValue={0}
//             marks={rubrics.map((rubric) => ({ label: <>{rubric.title}<br/>{rubric.createdAt}</>, value: rubric.id }))}
//             max={2}
//             min={0}
//             onChangeCommitted={(_, newIndex) => {
//               setValue2("title", rubrics[newIndex as number].title);
//               setValue2("id", rubrics[newIndex as number].id);
//             }}
//             step={null}/>
//             </div>
//             <div className='flex flex-row space-x-3 items-center'>
//           <Controller
//             control={control2}
//             name="title"
//             render={({ field, fieldState }): JSX.Element => (
//               <FormTextField
//                 disabled={false}
//                 field={field}
//                 fieldState={fieldState}
//                 variant='standard'
//                 fullWidth
//               />
//             )}
//           />

//           <IconButton
//             disabled={false}
//             onClick={() => setIsRubricExpanded(!isRubricExpanded)}
//           >
//             {isRubricExpanded ? <ExpandLess /> : <ExpandMore />}
//           </IconButton>

//           <IconButton
//             color="info"
//             disabled={false}
//             onClick={() => {}}
//           >
//             <PlayArrow />
//           </IconButton>

//           <IconButton
//             color="error"
//             disabled={false}
//             onClick={() => {}}
//           >
//             <Delete />
//           </IconButton>

//           <Chip
//             className="flex flex-1 whitespace-nowrap"
//             onClick={() => toggleHighlightRubrics(rubric)}
//             variant="outlined"
//             color='primary'
//             label={highlightRubrics.includes(rubric) ? 'Stop Highlighting' : 'Highlight for Comparison'}
//           >
//           </Chip>

//           <Chip
//             className="whitespace-nowrap"
//             onClick={() => {}}
//             variant="outlined"
//             color='primary'
//             label='Export to Question'
//           >
//           </Chip>

//           </div>
//           {isRubricExpanded &&
//           <div className='flex flex-row space-x-4'>
//             <div className='w-1/2'>
//           <Controller
//             control={control}
//             name="aiGradingCustomPrompt"
//             render={({ field, fieldState }): JSX.Element => (
//               <FormRichTextField
//                 disabled={false}
//                 field={field}
//                 fieldState={fieldState}
//                 fullWidth
//               />
//             )}
//           />
//           </div>

//             <CompactCategoryManager
//               disabled={false}
//               for={data.categories ?? []}
//               onDirtyChange={setIsCategoriesDirty}
//             /></div>}
//             </>

//           }

//         </Form>
// </Card>
//         <div className='flex flex-row space-x-4 items-center py-2'>
//         <Typography variant='h6'>
//           Sample Answer Evaluations
//           </Typography>
//           <Button
//             onClick={() => setIsAddingAnswers(true)}
//             startIcon={<Add />}
//             variant='outlined'
//             size='small'>
//               Add Sample Answers
//           </Button>

//           <div className='flex-1'></div>
//           <div className='flex space-x-4 items-center'>
//             <Typography variant='body1' className='inline'>
//               Comparing against:
//             </Typography>
//             <Chip variant='outlined' size='small' className='bg-green-100 border-green-500' label="Reference Grading"/>
//             {highlightRubrics.toSorted().map((rubricId) => <Chip
//             size='small'
//             className={`${rubrics[rubricId].borderColor} ${rubrics[rubricId].backgroundColor} pr-0`}
//             label={<div className='flex space-x-2 items-center'>
//               {rubrics[rubricId].title}
//               <IconButton className={`scale-75`}
//                 onClick={() => toggleHighlightRubrics(rubricId)}>

//                 <Close className={`${rubrics[rubricId].fillColor}`} fontSize='medium'/>
//               </IconButton>
//             </div>}
//             variant='outlined'>

//             </Chip>)}
//           </div>
//           </div>

//                      <Table
//                        columns={evalTableCols}
//                        data={selectedTestData.map((datum) => ({
//                         ...datum,
//                         expanded: expandedRowIds.includes(datum.id),
//                         highlightEvaluations: highlightRubrics.toSorted().map((rubricId) => ({
//                           grades: allTestData[rubricId].find((p) => p.id === datum.id)?.grades ?? [],
//                           comment: allTestData[rubricId].find((p) => p.id === datum.id)?.comment ?? '',
//                           fillColor: rubrics[rubricId].fillColor,
//                           borderColor: rubrics[rubricId].borderColor,
//                           backgroundColor: rubrics[rubricId].backgroundColor,
//                         })),
//                       }))}
//                        getRowClassName={(answer): string => `answer_${answer.id}`}
//                        getRowEqualityData={(answer) => answer}
//                        getRowId={(instance): string => instance.id.toString()}/>

//           <Prompt
//             maxWidth={false}
//             onClickPrimary={() => setIsAddingAnswers(false)}
//             onClose={() => setIsAddingAnswers(false)}
//             open={isAddingAnswers}
//             primaryLabel='Add'
//             title={'Add Sample Answers'}
//           >
//             <Controller
//               control={control3}
//               name="addMode"
//               render={(field) =>
//                 <RadioGroup
//                 {...field}
//                 onChange={(_, value) => setSelectedAddMode(value as AddSampleMode)}
//                className="space-y-5" defaultValue={AddSampleMode.SPECIFIC_ANSWER}>
//                   <RadioButton
//                     className="my-0"
//                     disabled={false}
//                     label={'Add existing answers'}
//                     value={AddSampleMode.SPECIFIC_ANSWER}
//                   />
//                   { selectedAddMode === AddSampleMode.SPECIFIC_ANSWER &&
//                      <Table
//                      className='overflow-x-scroll'
//                       columns={answerTableCols}
//                       data={allTestData[0].filter((answer) => !testDataSelections.includes(answer.id))}
//                       search={{ searchPlaceholder: 'Search answers by student name or grade' }}
//                       getRowClassName={(answer): string => `answer_${answer.id}`}
//                       getRowEqualityData={(answer) => answer}
//                       getRowId={(instance): string => instance.id.toString()}
//                       pagination={{
//                         rowsPerPage: [5],
//                       }}

//       toolbar={{
//         show: true,
//       }} />}
//                   <RadioButton
//                     className="my-0"
//                     disabled={false}
//                     label={
//                       <div className='align-middle items-center'>
//                         <span> Add</span>
//                         <Controller
//               control={control3}
//               name="addRandomAnswerCount"
//               render={({field, fieldState}) =>

//                         <FormTextField
//                         className='w-16 mx-3'
//                         type='number'
//                           disabled={selectedAddMode !== AddSampleMode.RANDOM_STUDENT}
//                           field={field}
//                           fieldState={fieldState}
//                           disableMargins
//                           inputProps={{ className: 'text-right' }}
//                           variant='standard'
//                         />}/> random student answer(s)
//                       </div>}
//                     value={AddSampleMode.RANDOM_STUDENT}
//                   />
//                   <RadioButton
//                     className="my-0"
//                     disabled={false}
//                     label={'Write a custom answer'}
//                     value={AddSampleMode.CUSTOM_ANSWER}
//                   />

//                   {selectedAddMode === AddSampleMode.CUSTOM_ANSWER &&
//                   <Controller
//                     control={control3}
//                     name={'addCustomAnswerText'}
//                     render={({ field, fieldState }): JSX.Element => (
//                       <FormRichTextField
//                         disabled={false}
//                         disableMargins
//                         field={field}
//                         fieldState={fieldState}
//                         fullWidth
//                         variant="outlined"
//                       />
//                     )}
//                   />}
//                 </RadioGroup>
//               }
//             />
//           </Prompt>
//         </>
//       }}
//     </Preload>
//   );
// };

// export default RubricPlaygroundPage;
