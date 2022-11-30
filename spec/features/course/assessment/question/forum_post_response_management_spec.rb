# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Forum Post Response Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a new forum post response question' do
        skill = create(:course_assessment_skill, course: course)
        visit course_assessment_path(course, assessment)
        click_on 'New Question'
        new_page = window_opened_by { click_link 'Forum Post Response' }

        within_window new_page do
          expect(current_path).to eq(
            new_course_assessment_question_forum_post_response_path(course, assessment)
          )
          question_attributes = attributes_for(:course_assessment_question_forum_post_response)
          fill_in 'title', with: question_attributes[:title]
          fill_in_rails_summernote '.question_forum_post_response_description',
                                   question_attributes[:description]
          fill_in_rails_summernote '.question_forum_post_response_staff_only_comments',
                                   question_attributes[:staff_only_comments]
          fill_in 'maximum_grade', with: question_attributes[:maximum_grade]

          select question_attributes[:max_posts], from: 'question_forum_post_response_max_posts', visible: false

          check 'question_forum_post_response_has_text_response'

          show_skills = "$('select[name=\"question_forum_post_response[question_assessment][skill_ids][]\"]').show()"
          page.execute_script show_skills
          within find_field('skills') do
            select skill.title
          end
          click_button I18n.t('helpers.buttons.create')

          question_created = assessment.questions.first.specific
          expect(page).to have_selector('div',
                                        text: I18n.t('course.assessment.question.forum_post_responses.create.success'))
          expect(question_created.question_assessments.first.skills).to contain_exactly(skill)
          expect(question_created.title).to eq(question_attributes[:title])
          expect(question_created.description).to include(question_attributes[:description])
          expect(question_created.staff_only_comments).to include(question_attributes[:staff_only_comments])
          expect(question_created.maximum_grade).to eq(question_attributes[:maximum_grade])
          expect(question_created.max_posts).to eq(question_attributes[:max_posts])
          expect(question_created.has_text_response).to eq(true)
        end
      end

      scenario 'I can edit a forum post response question' do
        question = create(:course_assessment_question_forum_post_response, assessment: assessment)
        visit course_assessment_path(course, assessment)
        edit_path = edit_course_assessment_question_forum_post_response_path(course, assessment, question)
        find_link(nil, href: edit_path).click

        maximum_grade = 999.9
        fill_in 'maximum_grade', with: maximum_grade
        click_button I18n.t('helpers.buttons.update')

        message = I18n.t('course.assessment.question.forum_post_responses.update.success')
        expect(page).to have_selector('div.alert', text: message)
        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(question.reload.maximum_grade).to eq(maximum_grade)

        visit edit_path

        select '5', from: 'question_forum_post_response_max_posts', visible: false

        uncheck 'question_forum_post_response_has_text_response'

        click_button I18n.t('helpers.buttons.update')

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).to have_selector('div.alert.alert-success')
        expect(question.reload.max_posts).to eq(5)
        expect(question.has_text_response).to eq(false)
      end

      scenario 'I can delete a forum post response question' do
        question = create(:course_assessment_question_forum_post_response, assessment: assessment)
        visit course_assessment_path(course, assessment)

        within find('section', text: question.title) { click_button 'Delete' }
        click_button 'Delete question'

        expect_toastify('Question successfully deleted.')
        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).not_to have_content(question.title)
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot add questions', js: false do
        visit new_course_assessment_question_forum_post_response_path(course, assessment)

        expect(page.status_code).to eq(403)
      end
    end
  end
end
