# frozen_string_literal: true

test_case_properties = [
  {
    type: :evaluation_test,
    expression: 'test_result("evaluation", 1)',
    identifier: 'ProgQuestionEvaluation/ProgQuestionEvaluation/test_evaluation_1'
  }, {
    type: :evaluation_test,
    expression: 'test_result("evaluation", 2)',
    identifier: 'ProgQuestionEvaluation/ProgQuestionEvaluation/test_evaluation_2'
  }, {
    type: :public_test,
    expression: 'test_result("public", 1)',
    identifier: 'ProgQuestionPublic/ProgQuestionPublic/test_public_1'
  }, {
    type: :private_test,
    expression: 'test_result("private", 1)',
    identifier: 'ProgQuestionPrivate/ProgQuestionPrivate/test_private_1'
  }, {
    type: :private_test,
    expression: 'test_result("private", 2)',
    identifier: 'ProgQuestionPrivate/ProgQuestionPrivate/test_private_2'
  }
]

namespace :coursemology do
  task seed: 'db:seed' do
    require 'factory_girl_rails'
    require 'coursemology/polyglot'

    ActsAsTenant.with_tenant(Instance.default) do
      # Get the admin user
      admin = User::Email.find_by_email('test@example.org').user

      # Create a course owner
      course_owner = FactoryGirl.create(:user, name: 'Course Owner')

      # Create courses
      # This course is owned by course owner, admin user is a course staff
      User.stamper = course_owner
      course1 = FactoryGirl.create(:course, title: 'Unpublished Course')
      FactoryGirl.create(:course_manager, user: admin, course: course1,
                                          name: 'Administrator')

      # Other courses are owned by admin user
      User.stamper = admin
      course2 = FactoryGirl.create(:course, :published, :enrollable, title: 'Enrollable Course')
      course3 = FactoryGirl.create(:course, :published, title: 'Unenrollable Course')

      [course1, course2, course3].each do |course|
        # Add users to the course
        FactoryGirl.create_list(:course_student, 20, course: course)
        FactoryGirl.create_list(:course_teaching_assistant, 5, course: course)
        FactoryGirl.create_list(:course_manager, 5, course: course)

        # Add assessments
        FactoryGirl.create(:assessment, :published_with_all_question_types,
                           course: course, title: 'Published, All Question Types')
        FactoryGirl.create(:assessment, :published_with_mcq_question, :autograded,
                           course: course, title: 'Published, Autograded with MCQ Question')
        FactoryGirl.create(:assessment, :with_all_question_types,
                           course: course, title: 'Unpublished, All Question Types')

        # Create assessment with programming Question
        template_file = FactoryGirl.build(
          :course_assessment_question_programming_template_file,
          content: "# return True if you want the test to pass\n# each test passes"\
                   "in the test type and a number\ndef test_result(test_types, numbers):"\
                   "\n    return True", filename: 'template.py', question: nil
        )
        test_cases = test_case_properties.map do |t|
          FactoryGirl.build(
            :course_assessment_question_programming_test_case,
            test_case_type: t[:type], question: nil, expression: t[:expression],
            expected: 'True', hint: 'Unhelpful hint', identifier: t[:identifier]
          )
        end
        assessment = FactoryGirl.build(
          :assessment, :autograded, course: course,
                                    title: 'Published, Autograded with Programming Question'
        )
        question = FactoryGirl.create(
          :course_assessment_question_programming, :auto_gradable,
          template_files: [template_file], test_cases: test_cases, assessment: assessment,
          file: File.new(Rails.root.join('lib/tasks/coursemology/programming_question.zip'))
        )
        assessment.questions << question.acting_as
        assessment.published = true
        assessment.save!
      end
    end
  end
end
