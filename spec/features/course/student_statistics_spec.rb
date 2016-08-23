# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Student Statistics' do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:students) { create_list(:course_student, 2, course: course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }
      let(:group) { create(:course_group, course: course) }
      let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
      let!(:group_manager) do
        create(:course_group_manager, group: group, course_user: teaching_assistant)
      end
      let!(:group_user) { create(:course_group_user, group: group, course_user: students.first) }

      scenario 'I can view student statistics' do
        visit course_statistics_student_path(course)

        students.each do |student|
          expect(page).to have_content_tag_for(student)
        end
        expect(page).to have_text(group_manager.course_user.name)
        expect(page).not_to have_text(I18n.t('course.statistics.student.phantom_students'))

        panthom_student = students.first
        panthom_student.phantom = true
        panthom_student.save
        visit course_statistics_student_path(course)

        students.each do |student|
          expect(page).to have_content_tag_for(student)
        end
        expect(page).to have_text(I18n.t('course.statistics.student.phantom_students'))
      end
    end
  end
end
