# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Student Statistics' do
  subject { page }

  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:students) { create_list(:course_student, 2, course: course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Staff' do
      let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
      let(:user) { teaching_assistant.user }
      let(:group) { create(:course_group, course: course) }
      let(:other_group) { create(:course_group, :without_users, course: course) }
      let(:group_manager) do
        create(:course_group_manager, group: group, course_user: teaching_assistant)
      end
      let(:group_users) do
        create(:course_group_user, group: group, course_user: students.first)
        create(:course_group_user, group: other_group, course_user: students.last)
      end

      scenario 'I can only view all student statistics when I am not a group manager', js: true do
        students
        visit course_statistics_all_students_path(course)

        expect(page).to have_link(I18n.t('course.statistics.student.header'),
                                  href: course_statistics_all_students_path(course))

        students.each do |student|
          expect(page).to have_content_tag_for(student)
        end

        expect(page).not_to have_text(I18n.t('course.statistics.tabs.my_students_tab'))
        expect(page).
          not_to have_text(I18n.t('course.statistics.course_student_statistics.phantom_students'))

        # Test that phantom students are rendered only if they exist
        phantom_student = students.first
        phantom_student.phantom = true
        phantom_student.save
        visit course_statistics_all_students_path(course)
        students.each do |student|
          expect(page).to have_content_tag_for(student)
        end
        expect(page).
          to have_text(I18n.t('course.statistics.course_student_statistics.phantom_students'))
      end

      scenario 'I get redirected to all_students when I am not a group manager and I visit my_students', js: true do
        students
        visit course_statistics_my_students_path(course)

        expect(page).to have_current_path(course_statistics_all_students_path(course))
      end

      scenario 'I can view tabs when I am a group manager', js: true do
        students
        group_manager
        group_users

        visit course_statistics_all_students_path(course)
        expect(page).to have_text(I18n.t('course.statistics.tabs.my_students_tab'))
        expect(page).to have_text(I18n.t('course.statistics.tabs.all_students_tab'))
        visit course_statistics_my_students_path(course)
        expect(page).to have_text(I18n.t('course.statistics.tabs.my_students_tab'))
        expect(page).to have_text(I18n.t('course.statistics.tabs.all_students_tab'))
      end

      scenario 'I can view my student statistics when I am a group manager', js: true do
        students
        group_manager
        group_users
        visit course_statistics_my_students_path(course)

        expect(page).to have_link(I18n.t('course.statistics.student.header'),
                                  href: course_statistics_my_students_path(course))
        expect(page).to have_text(group_manager.course_user.name)
        expect(page).to have_content_tag_for(students.first)

        expect(page).
          not_to have_text(I18n.t('course.statistics.course_student_statistics.phantom_students'))

        # Test that phantom students are rendered only if they exist
        phantom_student = students.first
        phantom_student.phantom = true
        phantom_student.save
        visit course_statistics_my_students_path(course)
        expect(page).to have_content_tag_for(students.first)
        expect(page).
          to have_text(I18n.t('course.statistics.course_student_statistics.phantom_students'))
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot see the sidebar item' do
        visit course_path(course)

        expect(page).not_to have_selector('li', text: I18n.t('course.statistics.student.header'))
      end
    end
  end
end
