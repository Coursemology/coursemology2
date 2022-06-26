# frozen_string_literal: true
# This partial is required to DRY up the code because the abstract question model
# directly renders the actable partial by delegating :to_partial_path to the actable.

json.id question.id
json.description format_ckeditor_rich_text(question.description)
json.maximumGrade question.maximum_grade.to_f

json.canViewHistory case question.actable_type
                    when Course::Assessment::Question::MultipleResponse.name,
                      Course::Assessment::Question::Programming.name,
                      Course::Assessment::Question::TextResponse.name
                      true
                    else
                      false
                    end

json.type case question.actable_type
          when Course::Assessment::Question::MultipleResponse.name
            question.actable.multiple_choice? ? 'MultipleChoice' : 'MultipleResponse'
          when Course::Assessment::Question::TextResponse.name
            if question.actable.hide_text?
              'FileUpload'
            elsif question.actable.comprehension_question?
              'Comprehension'
            else
              'TextResponse'
            end
          when Course::Assessment::Question::Programming.name
            'Programming'
          when Course::Assessment::Question::VoiceResponse.name
            'VoiceResponse'
          when Course::Assessment::Question::Scribing.name
            'Scribing'
          when Course::Assessment::Question::ForumPostResponse.name
            'ForumPostResponse'
          end

json.partial! question, question: question.specific, can_grade: can_grade, answer: answer
