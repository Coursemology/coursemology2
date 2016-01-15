FactoryGirl.define do
  factory :course_assessment_question_programming,
          class: Course::Assessment::Question::Programming,
          parent: :course_assessment_question do
    transient do
      template_file_count 0
      template_package false
    end

    memory_limit 32
    time_limit 10
    language { Coursemology::Polyglot::Language::Python::Python2Point7.instance }
    template_files do
      template_file_count.downto(0).map do
        build(:course_assessment_question_programming_template_file, question: nil)
      end
    end
    file do
      File.new(File.join(Rails.root, 'spec/fixtures/course/'\
                         'programming_question_template.zip'), 'rb') if template_package
    end
  end
end
