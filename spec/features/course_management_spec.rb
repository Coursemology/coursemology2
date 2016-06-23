# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses' do
  subject { page }
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    before { login_as(user, scope: :user) }

    scenario 'Users can see a list of all courses' do
      create(:course)

      visit courses_path
      expect(all('.course').count).to eq(1)
      expect(subject).to have_link(nil, href: new_course_path)
    end

    scenario 'Users can see a list of their courses' do
      course_attending = create(:course_student, :approved, user: user).course
      course_teaching = create(:course_teaching_assistant, :approved, user: user).course
      other_course = create(:course)

      visit root_path
      expect(page).to have_link(course_attending.title, href: course_path(course_attending))
      expect(page).to have_link(course_teaching.title, href: course_path(course_teaching))
      expect(page).not_to have_link(other_course.title, href: course_path(other_course))
    end

    scenario 'Users can create a new course' do
      visit new_course_path

      expect(subject).to have_field('course_title')
      expect(subject).to have_field('course_description')

      expect do
        click_button I18n.t('helpers.submit.course.create')
      end.not_to change(instance.courses, :count)

      expect do
        fill_in 'course_title', with: 'Lorem ipsum'
        click_button I18n.t('helpers.submit.course.create')
      end.to change(instance.courses, :count).by(1)
    end
  end
end
