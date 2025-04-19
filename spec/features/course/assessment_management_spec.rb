# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Assessments: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user, redirect_url: course_assessments_path(course)) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create an assessment' do
        assessment_tab = create(:course_assessment_tab,
                                category: course.assessment_categories.first)
        assessment = build_stubbed(:assessment)

        visit course_assessments_path(course, category: assessment_tab.category,
                                              tab: assessment_tab)
        find('button[aria-label="New Assessment"]').click

        expect(page).to have_selector('h2', text: 'New Assessment')

        fill_in 'title', with: assessment.title
        fill_in 'base_exp', with: assessment.base_exp
        start_at = assessment.start_at.strftime('%d-%m-%Y %H:%M')
        fill_in_mui_datetime('start_at', start_at)
        find('button.btn-submit').click

        expect(page).not_to have_selector('h2', text: 'New Assessment')
        assessment_created = course.assessments.last
        expect(assessment_created.tab).to eq(assessment_tab)
        expect(assessment_created.title).to eq(assessment.title)
        expect(assessment_created.base_exp).to eq(assessment.base_exp)
        expect(assessment_created).not_to be_autograded
        expect(page).to have_text(assessment_created.title)
      end

      scenario 'I can delete an assessment' do
        assessment = create(:assessment, course: course)
        category_id, tab_id = assessment.tab.category_id, assessment.tab_id
        visit course_assessment_path(course, assessment)

        expect do
          find('svg[data-testid="DeleteIcon"]').click
          find('button.prompt-primary-btn').click
          expect_toastify('Assessment successfully deleted.')
        end.to change { course.reload.assessments.count }.by(-1)

        visit course_assessments_path(course, category: category_id, tab: tab_id)
        expect(page).not_to have_content(assessment.title)
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the Assessment Sidebar item' do
        assessment_sidebar = 'activerecord.attributes.course/assessment/category/title.default'
        expect(find_sidebar).to have_text(assessment_sidebar)
      end

      scenario 'I can see published assessments' do
        category = course.assessment_categories.first
        assessment = create(:assessment, :published_with_mrq_question,
                            course: course, tab: category.tabs.first)
        visit course_assessments_path(course)

        find_link(assessment.title, href: course_assessment_path(course, assessment)).click

        expect(page).to have_current_path(course_assessment_path(course, assessment))
      end
    end
  end
end
