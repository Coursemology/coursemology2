export const sorts = {
  byWeight: (a, b) => a.weight - b.weight,
};

export const formatQuestionFormData = (data) => {
  const payload = new FormData();
  ['question_type', 'description', 'max_options', 'min_options', 'required'].forEach((field) => {
    if (data[field] === 0 || data[field]) {
      payload.append(`question[${field}]`, data[field]);
    }
  });
  data.options
    .filter(option => option && (option.option || option.image))
    .forEach((option, index) => {
      ['option', 'image'].forEach((field) => {
        if (option[field]) {
          payload.append(`question[options_attributes][${index}][${field}]`, option[field]);
        }
      });
      payload.append(`question[options_attributes][${index}][weight]`, index + 1);
    });
  return payload;
}
