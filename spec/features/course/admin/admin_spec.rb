# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Administration' do
  subject { page }

  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As an Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can view the Course Admin Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'layouts.course_admin.title')
      end

      scenario 'I can view the course settings page' do
        visit course_admin_path(course)

        expect(page).to have_selector('h1', text: 'layouts.course_admin.title')
      end

      scenario 'I can change the course attributes' do
        visit course_admin_path(course)

        fill_in 'course_title', with: ''
        click_button I18n.t('helpers.submit.course.update')
        expect(course.reload.title).not_to eq('')
        expect(page).to have_selector('div.has-error')

        new_title = 'New Title'
        new_description = 'New Description'
        fill_in 'course_title',          with: new_title
        fill_in 'course_description',    with: new_description
        attach_file :course_logo, File.join(Rails.root, '/spec/fixtures/files/picture.jpg')
        click_button I18n.t('helpers.submit.course.update')

        expect(page).to have_selector('div.alert.alert-success')
        expect(page).to have_content(course.logo.medium.url)
        expect(course.reload.title).to eq(new_title)
        expect(course.reload.description).to eq(new_description)
      end

      scenario 'I can delete the course' do
        visit course_admin_path(course)

        expect { click_link(I18n.t('course.admin.admin.index.delete.button')) }.
          to change(instance.courses, :count).by(-1)
        expect(page).to have_selector('div', text: I18n.t('course.admin.admin.destroy.success'))
      end
    end

    context 'As a Course Teaching Assistant' do
      let(:user) { create(:course_teaching_assistant, :approved, course: course).user }

      scenario 'I cannot view the Course Admin Sidebar item' do
        visit course_path(course)

        expect(page).not_to have_selector('li', text: 'layouts.course_admin.title')
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }

      scenario 'I cannot view the Course Admin Sidebar item' do
        visit course_path(course)

        expect(page).not_to have_selector('li', text: 'layouts.course_admin.title')
      end
    end
  end
end
