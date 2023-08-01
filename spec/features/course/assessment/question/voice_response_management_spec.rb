# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Voice Response Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a new voice response question' do
        skill = create(:course_assessment_skill, course: course)
        visit course_assessment_path(course, assessment)
        click_on 'New Question'
        new_voice_page = window_opened_by { click_link 'Audio Response' }

        within_window new_voice_page do
          question_attributes = attributes_for(:course_assessment_question_voice_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in_react_ck 'textarea[name=description]', question_attributes[:description]
          fill_in_react_ck 'textarea[name=staffOnlyComments]', question_attributes[:staff_only_comments]
          fill_in 'maximumGrade', with: question_attributes[:maximum_grade]

          find_field('Skills').click
          find('li', text: skill.title).click

          click_button 'Save changes'
          wait_for_page

          question_created = assessment.questions.first.specific
          expect(question_created.title).to eq(question_attributes[:title])
          expect(question_created.description).to include(question_attributes[:description])
          expect(question_created.staff_only_comments).to include(question_attributes[:staff_only_comments])
          expect(question_created.maximum_grade).to eq(question_attributes[:maximum_grade])
          expect(question_created.question_assessments.first.skills).to contain_exactly(skill)
        end
      end

      scenario 'I can edit a question' do
        voice = create(:course_assessment_question_voice_response, assessment: assessment)
        visit course_assessment_path(course, assessment)

        edit_path = edit_course_assessment_question_voice_response_path(course, assessment, voice)
        find_link(nil, href: edit_path).click

        title = 'Trial Voice Response Question'
        description = 'Test of Creating Voice Response Question'
        staff_only_comments = 'No comments from staff'
        maximum_grade = 999.9
        fill_in 'title', with: title
        fill_in_react_ck 'textarea[name=description]', description
        fill_in_react_ck 'textarea[name=staffOnlyComments]', staff_only_comments
        fill_in 'maximumGrade', with: maximum_grade

        click_button 'Save changes'
        wait_for_page

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(voice.reload.title).to eq(title)
        expect(voice.reload.description).to include(description)
        expect(voice.reload.staff_only_comments).to include(staff_only_comments)
        expect(voice.reload.maximum_grade).to eq(maximum_grade)
      end

      scenario 'I can delete a question' do
        voice = create(:course_assessment_question_voice_response, assessment: assessment)
        visit course_assessment_path(course, assessment)
        wait_for_page
        within find('section', text: voice.title) { click_button 'Delete' }
        click_button 'Delete question'

        expect_toastify('Question successfully deleted.')
        expect(page).not_to have_content(voice.title)
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot add questions' do
        visit new_course_assessment_question_voice_response_path(course, assessment)

        expect_forbidden
      end
    end
  end
end
