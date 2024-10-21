# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Programming Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a new question' do
        skill = create(:course_assessment_skill, course: course)
        new_page = test_new_assessment_question_flow(course, assessment, 'Programming')

        within_window new_page do
          expect(current_path).to eq(new_course_assessment_question_programming_path(course, assessment))

          attributes = attributes_for(:course_assessment_question_programming)
          template = "print('Hello World')"

          fill_in 'Title', with: attributes[:title]
          fill_in 'Maximum grade', with: attributes[:maximum_grade]

          fill_in_react_ck 'textarea[name="question.description"]', attributes[:description]
          fill_in_react_ck 'textarea[name="question.staffOnlyComments"]', attributes[:staff_only_comments]

          find_field('Skills').click
          find('li', text: skill.title).click

          find_all('div', text: 'Language').last.click
          wait_for_animation
          find('li', exact_text: attributes[:language].name).click

          find('div', id: 'testUi.metadata.submission').click
          send_keys template

          click_button 'Save changes'
          expect_toastify('Question saved.')

          expect(page).to have_current_path(course_assessment_path(course, assessment))

          new_question = assessment.questions.first.specific.reload
          expect(assessment.questions.count).to eq(1)
          expect(new_question.title).to eq(attributes[:title])
          expect(new_question.maximum_grade).to eq(attributes[:maximum_grade])
          expect(new_question.description).to include(attributes[:description])
          expect(new_question.staff_only_comments).to include(attributes[:staff_only_comments])
          expect(new_question.question_assessments.first.skills).to contain_exactly(skill)
          expect(new_question.language).to eq(attributes[:language])
          expect(new_question.template_files.first.content).to include(template)
        end
      end

      scenario 'I can create a new question in an autograded assessment' do
        skill = create(:course_assessment_skill, course: course)
        assessment = create(:assessment, :autograded, course: course)
        visit new_course_assessment_question_programming_path(course, assessment)

        attributes = attributes_for(:course_assessment_question_programming)
        template = "print('Hello World')"

        fill_in 'Title', with: attributes[:title]
        fill_in 'Maximum grade', with: attributes[:maximum_grade]

        fill_in_react_ck 'textarea[name="question.description"]', attributes[:description]
        fill_in_react_ck 'textarea[name="question.staffOnlyComments"]', attributes[:staff_only_comments]

        find_field('Skills').click
        find('li', text: skill.title).click

        evaluator_check = find('label', text: 'Evaluate and test code').find('input', visible: false)
        expect(evaluator_check).to be_checked
        expect(page).not_to have_field('Attempt limit')

        find_all('div', text: 'Language').last.click
        wait_for_animation
        find('li', exact_text: attributes[:language].name).click

        find('span', text: 'Evaluate and test code').click
        expect(page).to have_text('submissions will always receive the maximum grade')
        find('span', text: 'Evaluate and test code').click

        find('div', id: 'testUi.metadata.submission').click
        send_keys template

        within find('div[aria-label="Public test cases"]') do
          find('button[aria-label="Add a test case"]').click

          test_case_fields = find_all('textarea')
          expression_field = test_case_fields[0]
          expected_field = test_case_fields[1]

          expression_field.click
          send_keys 1

          expected_field.click
          send_keys 1
        end

        click_button 'Save changes'
        expect_toastify('Question saved.')

        expect(page).to have_current_path(course_assessment_path(course, assessment))

        new_question = assessment.questions.first.specific.reload
        expect(assessment.questions.count).to eq(1)
        expect(new_question.title).to eq(attributes[:title])
        expect(new_question.maximum_grade).to eq(attributes[:maximum_grade])
        expect(new_question.description).to include(attributes[:description])
        expect(new_question.staff_only_comments).to include(attributes[:staff_only_comments])
        expect(new_question.question_assessments.first.skills).to contain_exactly(skill)
        expect(new_question.language).to eq(attributes[:language])
        expect(new_question.template_files.first.content).to include(template)
      end

      scenario 'I can upload a template package' do
        question = create(:course_assessment_question_programming,
                          assessment: assessment, template_file_count: 0, package_type: :zip_upload)

        empty_package = File.join(file_fixture_path, 'course/empty_programming_question_template.zip')
        valid_package = File.join(file_fixture_path, 'course/programming_question_template.zip')

        visit edit_course_assessment_question_programming_path(course, assessment, question)
        find('span', text: 'Evaluate and test code').click

        attach_file(empty_package) do
          click_button 'Upload a new package'
        end

        click_button 'Save changes'
        expect_toastify("package wasn't successfully imported")
        expect(page).to have_text('error')
        find('.Toastify').find('svg[data-testid="CloseIcon"]').click

        attach_file(valid_package) do
          click_button 'Upload a new package'
        end

        # TODO: close button on toastify messages doesn't work,
        # but scrolling the page causes it to close eventually
        page.scroll_to(find('footer'))
        page.scroll_to(find('button', text: 'Upload a new package'))
        expect(page).to_not have_css('.Toastify', text: "package wasn't successfully imported", wait: 60)

        click_button 'Save changes'
        expect_toastify('Question saved.')

        expect(page).to have_current_path(course_assessment_path(course, assessment))

        visit edit_course_assessment_question_programming_path(course, assessment, question)
        expect(page).to have_text('success')

        question.template_files.reload.each do |template|
          expect(page).to have_text(template.filename)
        end

        question.test_cases.reload.each do |test_case|
          expect(page).to have_text(test_case[:expression])
          expect(page).to have_text(test_case[:expected])
          expect(page).to have_text(test_case[:hint])
        end
      end

      scenario 'I can edit a question without updating the programming package' do
        programming_question = create(:course_assessment_question_programming, assessment: assessment)
        question = programming_question.acting_as
        visit course_assessment_path(course, assessment)

        edit_path = edit_course_assessment_question_programming_path(course, assessment, programming_question)
        find_link(nil, href: edit_path).click

        maximum_grade = 999.9

        fill_in 'Maximum grade', with: maximum_grade
        click_button 'Save changes'
        expect_toastify('Question saved.')

        expect(page).to have_current_path(course_assessment_path(course, assessment))
        expect(question.reload.maximum_grade).to eq(maximum_grade)
      end

      scenario 'I can delete a question' do
        question = create(:course_assessment_question_programming, assessment: assessment)
        visit course_assessment_path(course, assessment)

        within find('section', text: question.title) { click_button 'Delete' }
        click_button 'Delete question'

        expect_toastify('Question successfully deleted.')
        expect(page).not_to have_content(question.title)
      end

      scenario 'I can create a new question and upload the template package' do
        visit new_course_assessment_question_programming_path(course, assessment)

        attributes = attributes_for(:course_assessment_question_programming)
        fill_in 'Maximum grade', with: attributes[:maximum_grade]

        find_all('div', text: 'Language').last.click
        wait_for_animation
        find('li', text: attributes[:language].name).click

        find('span', text: 'Evaluate and test code').click

        fill_in 'Memory limit', with: attributes[:memory_limit]
        fill_in 'Time limit', with: attributes[:time_limit]
        fill_in 'Attempt limit', with: attributes[:attempt_limit]

        find('span', text: 'offline and upload').click

        attach_file(File.join(file_fixture_path, 'course/programming_question_template.zip')) do
          click_button 'Upload a new package'
        end

        click_button 'Save changes'
        expect_toastify('Question saved.')

        new_question = assessment.questions.first.specific.reload
        expect(new_question.memory_limit).to eq(attributes[:memory_limit])
        expect(new_question.time_limit).to eq(attributes[:time_limit])
        expect(new_question.attempt_limit).to eq(attributes[:attempt_limit])
      end

      describe 'updating a question' do
        let(:assessment) { create(:assessment, :autograded, course: course) }
        let!(:question) do
          create(:course_assessment_question_programming, :auto_gradable, template_package: true,
                                                                          assessment: assessment)
        end
        let(:student_user) { create(:course_student, course: course).user }
        let(:submission) { create(:submission, :published, assessment: assessment, creator: student_user) }

        it 'warns when updating memory limit and there is a submission' do
          submission
          visit edit_course_assessment_question_programming_path(course, assessment, question)

          fill_in 'Memory limit', with: question.memory_limit + 10
          click_button 'Save changes'

          expect(page).to have_css('button', text: 'Continue')
        end

        it 'does not show the confirmation dialog when the course is not gamified' do
          course.update!(gamified: false)
          visit edit_course_assessment_question_programming_path(course, assessment, question)

          fill_in 'Title', with: "#{question.title} updated"
          click_button 'Save changes'

          expect(page).not_to have_css('button', text: 'Continue')
        end

        it 'does not show the confirmation dialog when there is no submission' do
          visit edit_course_assessment_question_programming_path(course, assessment, question)

          fill_in 'Title', with: "#{question.title} updated"
          click_button 'Save changes'

          expect(page).not_to have_css('button', text: 'Continue')
        end

        it 'does not show the confirmation dialog when the assessment is non-autograded' do
          assessment.update!(autograded: false)
          visit edit_course_assessment_question_programming_path(course, assessment, question)

          fill_in 'Title', with: "#{question.title} updated"
          click_button 'Save changes'

          expect(page).not_to have_css('button', text: 'Continue')
        end
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot add questions' do
        visit new_course_assessment_question_programming_path(course, assessment)

        expect_forbidden
      end
    end
  end
end
