# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Student Statistics', js: true do
  subject { page }

  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:students) { create_list(:course_student, 2, course: course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Staff' do
      let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
      let(:user) { teaching_assistant.user }
      let(:group) { create(:course_group, course: course) }
      let(:other_group) { create(:course_group, course: course) }
      let(:group_manager) do
        create(:course_group_manager, group: group, course_user: teaching_assistant)
      end
      let(:group_users) do
        create(:course_group_user, group: group, course_user: students.first)
        create(:course_group_user, group: other_group, course_user: students.last)
      end

      scenario 'I can only view all student statistics when I am not a group manager' do
        visit course_statistics_students_path(course)

        students.each { |student| expect(page).to have_text(student.name) }
        expect(page).not_to have_text('Show My Students Only')
        expect(page).not_to have_text('Phantom')

        # Test that phantom students are rendered only if they exist
        phantom_student = students.first
        phantom_student.phantom = true
        phantom_student.save

        visit course_statistics_students_path(course)

        students.each { |student| expect(page).to have_text(student.name) }
        expect(page).to have_text('Phantom')
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot see the statistics sidebar item' do
        visit course_path(course)

        expect(find_sidebar).not_to have_text(I18n.t('course.statistics.header'))
      end

      scenario 'I cannot access the statistics page' do
        visit course_statistics_students_path(course)

        expect_forbidden
      end
    end
  end
end
