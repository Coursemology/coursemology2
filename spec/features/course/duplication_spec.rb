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

      scenario 'I can view the Duplication Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'layouts.duplication.title')
      end

      scenario 'I can duplicate a course' do
        visit course_duplication_path(course)

        expect(page).to have_field('New start at')
        expect(page).to have_field('New title')

        expect do
          click_button I18n.t('course.duplications.show.duplicate')
          wait_for_job
        end.to change { instance.courses.count }.by(1)

        new_course = instance.courses.last

        # After duplicating, redirect to the new course
        expect(current_path).to eq(course_path(new_course))
      end
    end

    context 'As a Course Administrator' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view the Duplication Sidebar item and can duplicate a course' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'layouts.duplication.title')

        visit course_duplication_path(course)

        # Just test that the Duplicate form can be seen since the actual duplication is already
        # tested under the System Administrator context.
        expect(page).to have_field('New start at')
        expect(page).to have_field('New title')
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
