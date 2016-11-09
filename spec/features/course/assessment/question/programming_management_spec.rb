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

      scenario 'I can create a new question' do
        skill = create(:course_assessment_skill, course: course)
        visit course_assessment_path(course, assessment)
        click_link I18n.t('course.assessment.assessments.show.new_question.programming')

        expect(current_path).to eq(
          new_course_assessment_question_programming_path(course, assessment)
        )
        question_attributes = attributes_for(:course_assessment_question_programming)
        fill_in 'title', with: question_attributes[:title]
        fill_in 'description', with: question_attributes[:description]
        fill_in 'staff_only_comments', with: question_attributes[:staff_only_comments]
        fill_in 'maximum_grade', with: question_attributes[:maximum_grade]
        fill_in 'weight', with: question_attributes[:weight]
        within find_field('skills') do
          select skill.title
        end
        select question_attributes[:language].name, from: 'language'
        fill_in 'memory_limit', with: question_attributes[:memory_limit]
        fill_in 'time_limit', with: question_attributes[:time_limit]
        fill_in 'attempt_limit', with: question_attributes[:attempt_limit]
        click_button 'submit'

        expect(current_path).to eq(course_assessment_path(course, assessment))

        question_created = assessment.questions.first.specific
        expect(page).to have_content_tag_for(question_created)
        expect(question_created.skills).to contain_exactly(skill)
        expect(question_created.weight).to eq(question_attributes[:weight])
        expect(question_created.memory_limit).to eq(question_attributes[:memory_limit])
        expect(question_created.time_limit).to eq(question_attributes[:time_limit])
        expect(question_created.attempt_limit).to eq(question_attributes[:attempt_limit])
      end

      scenario 'I can upload a template package' do
        question = create(:course_assessment_question_programming,
                          assessment: assessment, template_file_count: 0)
        visit edit_course_assessment_question_programming_path(course, assessment, question)

        attach_file 'question_programming[file]',
                    File.join(ActionController::TestCase.fixture_path,
                              'course/empty_programming_question_template.zip')
        click_button 'submit'
        wait_for_job
        expect(page).to have_selector('div.alert.alert-danger')

        attach_file 'question_programming[file]',
                    File.join(ActionController::TestCase.fixture_path,
                              'course/programming_question_template.zip')
        click_button 'submit'
        wait_for_job

        expect(current_path).to \
          start_with(course_assessment_path(course, assessment))

        expect(page).to have_selector('div.alert.alert-success')
        question.template_files.reload.each do |template|
          expect(page).to have_selector('ul.nav a', text: template.filename)
          expect(page).to have_selector('div.question_programming_template_file',
                                        text: template.content)
        end

        question.test_cases.reload.each do |test_case|
          expect(page).to have_content_tag_for(test_case)
        end
      end

      scenario 'I can edit a question' do
        question = create(:course_assessment_question_programming, assessment: assessment)
        visit course_assessment_path(course, assessment)

        edit_path = edit_course_assessment_question_programming_path(course, assessment, question)
        find_link(nil, href: edit_path).click

        maximum_grade = 999.9
        fill_in 'maximum_grade', with: maximum_grade
        click_button 'submit'

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(question.reload.maximum_grade).to eq(maximum_grade)
        expect(page).to have_selector('div.alert.alert-success')
      end

      scenario 'I can delete a question' do
        question = create(:course_assessment_question_programming, assessment: assessment)
        visit course_assessment_path(course, assessment)

        delete_path = course_assessment_question_programming_path(course, assessment, question)
        find_link(nil, href: delete_path).click

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).not_to have_content_tag_for(question)
      end

      scenario 'I can create a new question and upload the template package' do
        visit new_course_assessment_question_programming_path(course, assessment)
        question_attributes = attributes_for(:course_assessment_question_programming)
        fill_in 'title', with: question_attributes[:title]
        fill_in 'description', with: question_attributes[:description]
        fill_in 'maximum_grade', with: question_attributes[:maximum_grade]
        select question_attributes[:language].name, from: 'language'
        fill_in 'memory_limit', with: question_attributes[:memory_limit]
        fill_in 'time_limit', with: question_attributes[:time_limit]
        attach_file 'question_programming[file]',
                    File.join(ActionController::TestCase.fixture_path,
                              'course/programming_question_template.zip')

        click_button 'submit'
        wait_for_job

        expect(current_path).to \
          start_with(course_assessment_path(course, assessment))
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_user, :approved, course: course).user }

      scenario 'I cannot add questions' do
        visit new_course_assessment_question_programming_path(course, assessment)

        expect(page.status_code).to eq(403)
      end
    end
  end
end
