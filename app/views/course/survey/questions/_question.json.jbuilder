# frozen_string_literal: true
json.(question, :id, :required, :question_type, :max_options, :min_options, :weight,
      :grid_view, :section_id)
json.description format_ckeditor_rich_text(question.description)
json.canUpdate can?(:update, question)
json.canDelete can?(:destroy, question)
options = @question_options || question.options
json.options options, partial: 'course/survey/questions/option', as: :option
