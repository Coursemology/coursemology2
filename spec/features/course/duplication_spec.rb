# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Duplication' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a System Administrator' do
      let(:user) { create(:administrator) }

      context 'when I am not enrolled in the course' do
        scenario 'I cannot view the Duplication Sidebar item' do
          visit course_path(course)

          expect(page).not_to have_selector('li', text: 'layouts.duplication.title')
        end
      end

      context 'when I am enrolled in the course as a manager' do
        let!(:course_user) { create(:course_manager, course: course, user: user) }

        scenario 'I can view the Duplication Sidebar item' do
          visit course_path(course)

          expect(page).to have_selector('li', text: 'layouts.duplication.title')
        end
      end
    end

    context 'As a Course Administrator' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view the Duplication Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'layouts.duplication.title')
      end

      context 'when I am a manager in another course', js: true do
        let(:source_course) { create(:course) }
        let!(:course_user) { create(:course_manager, course: source_course, user: user) }
        let(:assessment_title) { SecureRandom.hex }
        let!(:assessment) { create(:assessment, title: assessment_title, tab: source_course.assessment_tabs.first) }
        let(:new_course_title) { SecureRandom.hex }

        scenario 'I can duplicate objects from that course' do
          visit course_duplication_path(course)

          find('.source-course-dropdown').click
          find("[role='option']", text: source_course.title).click

          find("input[value='OBJECT']", visible: false).click

          find('.destination-course-dropdown').click
          find("[role='option']", text: course.title).click

          find('.items-selector-menu span span', text: 'Assessments').click
          find(:xpath, '//*[@id="app-root"]
                        /div[1]/div[2]/div[6]/div/div[2]/div[2]/label/span[1]', visible: false).click
          click_on 'Duplicate Items'
          click_on 'Duplicate'

          # expect(page).not_to have_css('.source-course-dropdown')
          wait_for_job
          expect(course.assessments.where(title: assessment_title).count).to be(1)
        end

        scenario 'I can duplicate the whole course' do
          visit course_duplication_path(course)

          find('.source-course-dropdown').click
          find("[role='option']", text: source_course.title).click

          fill_in 'new_title', with: ''
          fill_in 'new_title', with: new_course_title

          click_on 'Duplicate Course'
          click_on 'Continue'

          expect(page).not_to have_css('.source-course-dropdown')
          wait_for_job
          duplicated_course = Course.find_by(title: new_course_title)
          expect(duplicated_course).to be_present
          expect(duplicated_course.assessments.where(title: assessment_title).count).to eq(1)

          # As only course and assessment duplication source tracing is currently supported,
          # we will only test for these two
          expect(duplicated_course.assessments.where(title: assessment_title).first.source.id).to eq(assessment.id)
          expect(duplicated_course.source.id).to eq(source_course.id)
        end
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot view the Duplication Sidebar item and cannot duplicate a course' do
        visit course_path(course)

        expect(page).not_to have_selector('li', text: 'layouts.duplication.title')

        visit course_duplication_path(course)

        expect(page.status_code).to eq(403)
      end
    end
  end
end
