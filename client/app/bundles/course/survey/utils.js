export const sorts = {
  byWeight: (a, b) => a.weight - b.weight,
};

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
