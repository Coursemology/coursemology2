# This partial is required to DRY up the code because the abstract question model
# directly renders the actable partial by delegating :to_partial_path to the actable.

json.id question.id
json.description question.description
json.displayTitle question.display_title
json.maximumGrade question.maximum_grade.to_f

json.type case question.actable_type
          when Course::Assessment::Question::MultipleResponse.name
            question.actable.multiple_choice? ? 'MultipleChoice' : 'MultipleResponse'
          when Course::Assessment::Question::TextResponse.name
            question.actable.hide_text? ? 'FileUpload' : 'TextResponse'
          when Course::Assessment::Question::Programming.name
            'Programming'
          end

json.partial! question, question: question.specific, can_grade: can_grade
