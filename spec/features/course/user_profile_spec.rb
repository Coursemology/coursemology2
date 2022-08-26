# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: CourseUser Profile', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_student) { create(:course_student, course: course) }
    let(:achievement) { create(:course_user_achievement, course_user: course_student).achievement }
    let(:course_teaching_assistant) { create(:course_teaching_assistant, course: course) }

    context 'As a Course Teaching Assistant' do
      before { login_as(course_teaching_assistant.user, scope: :user) }

      scenario "I can view a student's profile" do
        achievement
        visit course_user_path(course, course_student)

        expect(page).to have_text(course_student.name)
        expect(page).to_not have_link(nil, href: course_user_manage_email_subscription_path(course, achievement))

        expect(page).to have_selector('div.user-achievements-stat')
        expect(page).to have_link(nil, href: course_achievement_path(course, achievement))
        expect(page).to have_selector('div.user-level-stat')
        expect(page).to have_selector('div.user-exp-stat')
        expect(page.find('h5.user-exp-stat-value').text).to eq(course_student.experience_points.to_s)
        expect(page.find('h5.user-level-stat-value').text).to eq(course_student.level_number.to_s)
      end
    end

    context 'As a Course Student' do
      let(:student_user) { create(:course_student, course: course).user }

      scenario "I can view a staff's profile" do
        login_as(student_user, scope: :user)
        visit course_user_path(course, course_teaching_assistant)

        expect(page).to have_text(course_teaching_assistant.name)
        expect(page).to_not have_link(nil, href: course_user_manage_email_subscription_path(course, achievement))

        expect(page).to_not have_selector('div.user-achievements-stat')
        expect(page).to_not have_selector('div.user-level-stat')
        expect(page).to_not have_selector('div.user-exp-stat')
      end

      scenario "I can view a coursemate's profile" do
        achievement
        login_as(student_user, scope: :user)
        visit course_user_path(course, course_student)

        expect(page).to have_text(course_student.name)
        expect(page).to_not have_link(nil, href: course_user_manage_email_subscription_path(course, course_student))

        expect(page).to have_selector('div.user-achievements-stat')
        expect(page).to have_link(nil, href: course_achievement_path(course, achievement))
        expect(page).to_not have_selector('div.user-level-stat')
        expect(page).to_not have_selector('div.user-exp-stat')
      end

      scenario 'I can view my own profile' do
        achievement
        login_as(course_student.user, scope: :user)
        visit course_user_path(course, course_student)

        expect(page).to have_text(course_student.name)
        expect(page).to have_link(nil, href: course_user_manage_email_subscription_path(course, course_student))

        expect(page).to have_selector('h5.user-exp-stat-value')
        expect(page).to have_selector('div.user-achievements-stat')
        expect(page).to have_link(nil, href: course_achievement_path(course, achievement))
        expect(page).to have_selector('div.user-level-stat')
        expect(page).to have_selector('div.user-exp-stat')
        expect(page.find('h5.user-exp-stat-value').text).to eq(course_student.experience_points.to_s)
        expect(page.find('h5.user-level-stat-value').text).to eq(course_student.level_number.to_s)
      end
    end
  end
end
