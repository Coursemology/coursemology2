# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses', js: true do
  subject { page }
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:instance_user, :instructor).user }
    before { login_as(user, scope: :user) }

    scenario 'Users can see a list of published courses' do
      unpublished_course = create(:course)
      published_course = create(:course, :published)

      visit courses_path
      expect(page).to have_text(published_course.title)
      expect(page).not_to have_text(unpublished_course.title)
      expect(page).to have_button('New Course')
    end

    scenario 'Users can see a list of their courses' do
      course_attending = create(:course_student, user: user).course
      course_teaching = create(:course_teaching_assistant, user: user).course
      other_course = create(:course)

      visit root_path
      expect(page).to have_link(course_attending.title, href: course_path(course_attending))
      expect(page).to have_link(course_teaching.title, href: course_path(course_teaching))
      expect(page).not_to have_link(other_course.title, href: course_path(other_course))
    end

    scenario 'Users can create a new course' do
      visit courses_path

      click_button 'New Course'
      expect(page).to have_selector('h2', text: 'New Course')
      expect(subject).to have_field('title')

      expect(find('button.btn-submit')).to be_disabled

      expect do
        fill_in 'title', with: 'Lorem ipsum'
        find('button.btn-submit').click
        expect(page).not_to have_selector('h2', text: 'New Course')
      end.to change(instance.courses, :count).by(1)
    end
  end
end
