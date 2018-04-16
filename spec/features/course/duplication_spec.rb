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
