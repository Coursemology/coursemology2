export const sorts = {
  byWeight: (a, b) => a.weight - b.weight,
};

/**
 * Sorts an array attribute of an object and returns the updated item.
 * By default, the attribute is sorted by weight. Each member of the  array attribute may
 * be further sorted by specifying an appropriate mapMethod.
 *
 * @param {Object} item
 * @param {string} attribute
 * @param {function} mapMethod
 * @param {function=} sortMethod
 * @return {Object} The updated item
 */
export const sortAttributeArray = (
  item,
  attribute,
  mapMethod = option => option,
  sortMethod = sorts.byWeight
) => {
  const attributeArray = item[attribute];
  if (!attributeArray) { return item; }
  return { ...item, [attribute]: attributeArray.map(mapMethod).sort(sortMethod) };
};

const sortQuestionElements = question => sortAttributeArray(question, 'options');

export const sortSectionElements = section => (
  sortAttributeArray(section, 'questions', sortQuestionElements)
);

/**
 * Returns the given survey with it's descendent elements sorted appropriately.
 *
 * @param {Object} survey
 * @return {Object} The updated survey
 */
export const sortSurveyElements = survey => (
  sortAttributeArray(survey, 'sections', sortSectionElements)
);

const sortAnswerElements = answer => sortAttributeArray(answer, 'options');

const sortResponseSectionElements = (section) => {
  const sortByQuestionWeight = (a, b) => a.question.weight - b.question.weight;
  return sortAttributeArray(section, 'answers', sortAnswerElements, sortByQuestionWeight);
};

/**
 * Returns the given survey response with it's descendent elements sorted appropriately.
 *
 * @param {Object} response
 * @return {Object} The updated response
 */
export const sortResponseElements = response => (
  sortAttributeArray(response, 'sections', sortResponseSectionElements)
);

/**
 * Returns the given survey results section with it's descendent elements sorted appropriately.
 *
 * @param {Object} section
 * @return {Object} The updated section
 */
export const sortResultsSectionElements = section => sortAttributeArray(section, 'questions');

export const sortSurveysByDate = surveys => surveys.sort((a, b) => {
  const dateOrder = new Date(a.start_at) - new Date(b.start_at);
  return dateOrder === 0 ? a.title.localeCompare(b.title) : dateOrder;
});

export const formatQuestionFormData = (data) => {
  const payload = new FormData();
  const filledOptions = data.options.filter(option =>
    option && (option.option || option.file || option.image_url)
  );
  const filledOptionsCount = filledOptions.length;

  [
    'question_type', 'description', 'max_options', 'min_options', 'required',
    'grid_view', 'section_id',
  ].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`question[${field}]`, data[field]);
    }
  });

  filledOptions.forEach((option, index) => {
    ['id', 'option', 'file'].forEach((field) => {
      if (option[field] !== undefined && option[field] !== null) {
        payload.append(`question[options_attributes][${index}][${field}]`, option[field]);
      }
    });
    payload.append(`question[options_attributes][${index}][weight]`, index + 1);
  });

  if (data.optionsToDelete) {
    data.optionsToDelete.forEach((option, index) => {
      const arrayIndex = filledOptionsCount + index;
      payload.append(`question[options_attributes][${arrayIndex}][id]`, option.id);
      payload.append(`question[options_attributes][${arrayIndex}][_destroy]`, true);
    });
  }

  return payload;
};
