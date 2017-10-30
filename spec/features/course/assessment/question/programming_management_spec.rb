# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Programming Management' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a new question', js: true do
        skill = create(:course_assessment_skill, course: course)
        visit course_assessment_path(course, assessment)
        page.find('.dropdown').click
        page.find('#programming-link').click

        expect(current_path).to eq(
          new_course_assessment_question_programming_path(course, assessment)
        )
        visit new_course_assessment_question_programming_path(course, assessment)
        expect(page).to have_xpath('//form[@id=\'programmming-question-form\']')
        question_attributes = attributes_for(:course_assessment_question_programming)
        fill_in 'question_programming[title]', with: question_attributes[:title]

        fill_in_react_summernote 'textarea#question_programming_description',
                                 question_attributes[:description]
        fill_in_react_summernote 'textarea#question_programming_staff_only_comments',
                                 question_attributes[:staff_only_comments]
        fill_in 'question_programming[maximum_grade]', with: question_attributes[:maximum_grade]

        page.execute_script("$('select[name=\"question_programming[skill_ids][]\"]').show()")
        within find_field('question_programming[skill_ids][]') do
          select skill.title
        end

        page.execute_script("$('select[name=\"question_programming[language_id]\"]').show()")
        select question_attributes[:language].name, from: 'question_programming[language_id]'
        page.find('#programmming-question-form-submit').click

        expect(page).to_not have_xpath('//form//*[contains(@class, \'fa-spinner\')]')
        expect(current_path).to eq(course_assessment_path(course, assessment))

        question_created = assessment.questions.first.specific.reload
        expect(question_created.description).
          to include(question_attributes[:description])
        expect(question_created.staff_only_comments).
          to include(question_attributes[:staff_only_comments])
        expect(question_created.skills).to contain_exactly(skill)
      end

      scenario 'I can upload a template package', js: true do
        question = create(:course_assessment_question_programming,
                          assessment: assessment, template_file_count: 0, template_package: true)
        visit edit_course_assessment_question_programming_path(course, assessment, question)
        expect(page).to have_xpath('//form[@id=\'programmming-question-form\']')

        page.find('#question_programming_file', visible: false).click

        attach_file 'question_programming[file]',
                    File.join(ActionController::TestCase.fixture_path,
                              'course/empty_programming_question_template.zip'),
                    visible: false
        page.find('#programmming-question-form-submit').click
        wait_for_job
        expect(page).to have_selector('div.alert.alert-danger')

        page.find('#question_programming_file', visible: false).click
        attach_file 'question_programming[file]',
                    File.join(ActionController::TestCase.fixture_path, 'course/programming_question_template.zip'),
                    visible: false
        page.find('#programmming-question-form-submit').click
        wait_for_job

        expect(page).to_not have_xpath('//form//*[contains(@class, \'fa-spinner\')]')
        expect(current_path).to eq(course_assessment_path(course, assessment))
        visit edit_course_assessment_question_programming_path(course, assessment, question)

        expect(page).to have_selector('div.alert.alert-success')

        question.template_files.reload.each do |template|
          expect(page).to have_selector('.template-tab', text: template.filename)
        end

        question.test_cases.reload.each do |test_case|
          expect(page).to have_content_tag_for(test_case)
        end
      end

      scenario 'I can edit a question', js: true do
        question = create(:course_assessment_question_programming, assessment: assessment)
        visit course_assessment_path(course, assessment)

        edit_path = edit_course_assessment_question_programming_path(course, assessment, question)
        find_link(nil, href: edit_path).click
        expect(page).to have_xpath('//form[@id=\'programmming-question-form\']')

        maximum_grade = 999.9
        # For some reasons we have to clear the old field first then can fill in the value, otherwise
        # the new value will append to the new value instead of replacing it.
        fill_in 'question_programming[maximum_grade]', with: ''
        fill_in 'question_programming[maximum_grade]', with: maximum_grade
        page.find('#programmming-question-form-submit').click

        expect(page).to_not have_xpath('//form//*[contains(@class, \'fa-spinner\')]')
        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(question.reload.maximum_grade).to eq(maximum_grade)
      end

      scenario 'I can delete a question' do
        question = create(:course_assessment_question_programming, assessment: assessment)
        visit course_assessment_path(course, assessment)

        delete_path = course_assessment_question_programming_path(course, assessment, question)
        find_link(nil, href: delete_path).click

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).not_to have_content_tag_for(question)
      end

      scenario 'I can create a new question and upload the template package', js: true do
        visit new_course_assessment_question_programming_path(course, assessment)

        expect(page).to have_xpath('//form[@id=\'programmming-question-form\']')

        question_attributes = attributes_for(:course_assessment_question_programming)
        fill_in 'question_programming[maximum_grade]', with: question_attributes[:maximum_grade]
        page.execute_script("$('select[name=\"question_programming[language_id]\"]').show()")
        select question_attributes[:language].name, from: 'question_programming[language_id]'
        page.check('question_programming[autograded]', visible: false)
        fill_in 'question_programming[memory_limit]', with: question_attributes[:memory_limit]
        # For some reasons we have to clear the old field first then can fill in the value, otherwise
        # the new value will append to the new value instead of replacing it.
        fill_in 'question_programming[time_limit]', with: ''
        fill_in 'question_programming[time_limit]', with: question_attributes[:time_limit]
        fill_in 'question_programming[attempt_limit]', with: question_attributes[:attempt_limit]

        page.find('#upload-package-tab').click
        page.find('#question_programming_file', visible: false).click
        attach_file 'question_programming[file]',
                    File.join(ActionController::TestCase.fixture_path, 'course/programming_question_template.zip'),
                    visible: false
        page.find('#programmming-question-form-submit').click
        wait_for_job

        expect(page).to_not have_xpath('//form//*[contains(@class, \'fa-spinner\')]')
        expect(current_path).to \
          start_with(course_assessment_path(course, assessment))

        question_created = assessment.questions.first.specific
        expect(question_created.memory_limit).to eq(question_attributes[:memory_limit])
        expect(question_created.time_limit).to eq(question_attributes[:time_limit])
        expect(question_created.attempt_limit).to eq(question_attributes[:attempt_limit])
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot add questions' do
        visit new_course_assessment_question_programming_path(course, assessment)

        expect(page.status_code).to eq(403)
      end
    end
  end
end
