class AddSectionIdToSurveyQuestions < ActiveRecord::Migration
  def change
    add_reference :course_survey_questions, :section,
                  index: true, foreign_key: { references: :course_survey_sections }
    Course::Survey::Question.reset_column_information

    Course::Survey.find_each do |survey|
      largest_section_weight = survey.sections.maximum(:weight)
      weight = largest_section_weight && largest_section_weight + 1 || 0
      questions = Course::Survey::Question.where(survey_id: survey.id)
      section = survey.sections.create(title: 'Questions', weight: weight)
      questions.each { |question| question.update_attribute(:section_id, section.id) }
    end

    change_column_null :course_survey_questions, :section_id, false
    remove_reference :course_survey_questions, :survey, null: false
  end
end
