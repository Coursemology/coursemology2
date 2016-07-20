# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Assessments: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { course.creator }
      scenario 'I can create a new assessment' do
        assessment_tab = create(:course_assessment_tab,
                                category: course.assessment_categories.first)
        assessment = build_stubbed(:assessment)
        file = File.join(Rails.root, '/spec/fixtures/files/text.txt')

        visit course_assessments_path(course, category: assessment_tab.category,
                                              tab: assessment_tab)
        click_link(I18n.t('helpers.buttons.assessment.new'))

        expect(current_path).to eq(new_course_assessment_path(course))

        # Create an assessment with a missing title.
        fill_in 'assessment_description', with: assessment.description
        fill_in 'assessment_base_exp', with: assessment.base_exp
        fill_in 'assessment_time_bonus_exp', with: assessment.time_bonus_exp
        fill_in 'assessment_extra_bonus_exp', with: assessment.extra_bonus_exp
        fill_in 'assessment_start_at', with: assessment.start_at
        fill_in 'assessment_end_at', with: assessment.end_at
        fill_in 'assessment_bonus_end_at', with: assessment.bonus_end_at
        within '#assessment_display_mode' do
          find("option[value='guided']").select_option
        end

        click_button 'submit'

        expect(current_path).to eq(course_assessments_path(course))
        expect(page).to have_selector('div.alert.alert-danger')
        expect(page).to have_field('assessment_base_exp', with: assessment.base_exp)

        fill_in 'assessment_title', with: assessment.title
        attach_file :assessment_files_attributes, file
        click_button 'submit'

        assessment_created = course.assessments.last
        expect(assessment_created.tab).to eq(assessment_tab)
        expect(page).to have_content_tag_for(assessment_created)
        expect(assessment_created.folder.materials).to be_present
        expect(assessment_created).to be_guided
      end

      scenario 'I can edit an assessment' do
        assessment = create(:assessment, course: course)
        visit course_assessment_path(course, assessment)
        find_link(nil, href: edit_course_assessment_path(course, assessment)).click

        new_text = 'zzzz'
        fill_in 'assessment_title', with: new_text
        click_button 'submit'

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).to have_selector('h1', text: new_text)
      end

      scenario 'I can delete an assessment' do
        assessment = create(:assessment, course: course)
        visit course_assessment_path(course, assessment)

        find(:css, 'div.page-header a.btn-danger').click
        expect(current_path).to eq(course_assessments_path(course))

        expect(page).not_to have_selector("#assessment_#{assessment.id}")
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_user, :approved, course: course).user }

      scenario 'I can view the Assessment Sidebar item' do
        visit course_path(course)

        assessment_sidebar = 'activerecord.attributes.course/assessment/category/title.default'
        expect(page).to have_selector('li', text: assessment_sidebar)
      end

      scenario 'I can see non-draft assessments' do
        category = course.assessment_categories.first
        assessment = create(:assessment, :published_with_mcq_question,
                            course: course, tab: category.tabs.first)
        visit course_assessments_path(course)

        find_link(assessment.title, href: course_assessment_path(course, assessment)).click
        expect(current_path).to eq(course_assessment_path(course, assessment))
      end
    end
  end
end
