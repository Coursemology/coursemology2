FactoryGirl.define do
  factory :course_assessment_question_programming,
          class: Course::Assessment::Question::Programming,
          parent: :course_assessment_question do
    transient do
      template_file_count 1
    end

    memory_limit 32
    time_limit 10
    language '' # TODO: Implement the Polyglot component
    template_files do
      template_file_count.downto(0).map do
        build(:course_assessment_question_programming_template_file, question: nil)
      end
    end
  end
end
