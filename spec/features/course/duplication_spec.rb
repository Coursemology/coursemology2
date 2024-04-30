# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Duplication', js: true do
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

          expect(find_sidebar).not_to have_text(I18n.t('layouts.duplication.title'))
        end
      end

      context 'when I am enrolled in the course as a manager' do
        let!(:course_user) { create(:course_manager, course: course, user: user) }

        scenario 'I can view the Duplication Sidebar item' do
          visit course_path(course)

          expect(find_sidebar).to have_text(I18n.t('layouts.duplication.title'))
        end
      end
    end

    context 'As a Course Administrator' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view the Duplication Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).to have_text(I18n.t('layouts.duplication.title'))
      end

      context 'when I am a manager in one specific course' do
        let(:source_course) { create(:course) }
        let!(:course_user) { create(:course_manager, course: source_course, user: user) }
        let(:assessment_title1) { SecureRandom.hex }
        let(:assessment_title2) { SecureRandom.hex }
        let(:new_course_title) { SecureRandom.hex }
        let!(:assessment1) { create(:assessment, title: assessment_title1, tab: source_course.assessment_tabs.first) }

        let!(:assessment2) do
          create(:assessment,
                 title: assessment_title2,
                 tab: source_course.assessment_tabs.first,
                 end_at: 2.days.from_now)
        end

        scenario 'I can duplicate objects from that course' do
          visit course_duplication_path(source_course)

          find("input[value='OBJECT']", visible: false).click

          find("[class*='destination-course-dropdown']").click
          find("[role='option']", text: course.title).click

          find("div[class*='items-selector-menu-assessment']", text: 'Assessments').click
          find('label', text: assessment_title1).click
          click_on 'Duplicate Items'
          click_on 'Duplicate'

          wait_for_job
          expect(course.assessments.where(title: assessment_title1).count).to be(1)
        end

        scenario 'I can duplicate the whole course' do
          visit course_duplication_path(source_course)

          fill_in 'new_title', with: ''
          fill_in 'new_title', with: new_course_title

          click_on 'Duplicate Course'
          click_on 'Continue'

          wait_for_job
          duplicated_course = Course.find_by(title: new_course_title)
          expect(duplicated_course).to be_present
          expect(duplicated_course.assessments.where(title: assessment_title1).count).to eq(1)
          expect(duplicated_course.assessments.where(title: assessment_title2).count).to eq(1)

          # As only course and assessment duplication source tracing is currently supported,
          # we will only test for these two
          expect(duplicated_course.assessments.where(title: assessment_title1).first.source.id).to eq(assessment1.id)
          expect(duplicated_course.assessments.where(title: assessment_title2).first.source.id).to eq(assessment2.id)
          expect(duplicated_course.source.id).to eq(source_course.id)
        end
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot view the Duplication Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).not_to have_text(I18n.t('layouts.duplication.title'))
      end

      scenario 'I cannot access the duplication page' do
        visit course_duplication_path(course)

        expect_forbidden
      end
    end
  end
end
