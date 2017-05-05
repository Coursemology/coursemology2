json.(section, :id, :title, :weight)
json.description format_html(section.description)
questions = @questions || section.questions
json.questions questions, partial: 'course/survey/questions/question', as: :question
json.canCreateQuestion can?(:create, Course::Survey::Question.new(section: section))
json.canUpdate can?(:update, section)
json.canDelete can?(:destroy, section)
