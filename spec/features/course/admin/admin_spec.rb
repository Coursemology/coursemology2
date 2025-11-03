# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Administration', js: true do
  subject { page }

  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As an Course Owner' do
      let(:user) { create(:course_owner, course: course).user }

      scenario 'I can view the Course Admin Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).to have_text(I18n.t('layouts.course_admin.title'))
      end

      scenario 'I can change the course attributes' do
        visit course_admin_path(course)

        fill_in 'title', with: ''
        click_button 'Save changes'
        expect(course.reload.title).not_to be_empty
        expect(page).to have_text('Course name is required')

        new_title = 'New Title'
        new_description = 'New Description'
        fill_in 'title', with: new_title
        fill_in_react_ck 'textarea[name="description"]', new_description

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')

        expect(course.reload.title).to eq(new_title)
        expect(course.reload.description).to include(new_description)
      end

      scenario 'I can change the course logo' do
        visit course_admin_path(course)
        logo = File.join(Rails.root, '/spec/fixtures/files/picture.jpg')

        attach_file(logo) do
          find('label', text: 'Change', visible: false).click
        end

        find("[role='dialog']").find('button', text: 'Done').click
        click_button 'Save changes'
        expect_toastify('The new course logo was successfully uploaded.')

        visit current_path

        course_logo = find_sidebar.find_all('img').first
        expect(course_logo[:src]).to include(course.reload.logo.medium.url)
      end

      scenario 'I can enable/disable self directed learning' do
        visit course_admin_path(course)

        days = 10
        advance_start_at_duration_field = 'advanceStartAtDurationDays'
        fill_in advance_start_at_duration_field, with: days

        click_button 'Save changes'

        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.advance_start_at_duration).to be_within(1.hour).of(days.days)

        fill_in advance_start_at_duration_field, with: ''
        click_button 'Save changes'

        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.advance_start_at_duration).to eq 0
      end

      scenario 'I can delete the course' do
        visit course_admin_path(course)

        expect_delete_action = expect do
          click_button('Delete this course')
          expect(page).to have_button('Delete course', disabled: true)
          fill_in 'confirmDeleteField', with: 'coursemology'
          click_button('Delete course')
          expect(page).to have_current_path(courses_path)
        end

        expect_delete_action.to change(instance.courses, :count).by(-1)
      end
    end

    context 'As an Course Manager' do
      let(:user) { create(:course_owner, course: course).user }

      scenario 'I can view the Course Admin Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).to have_text(I18n.t('layouts.course_admin.title'))
      end

      scenario 'I cannot delete the course' do
        visit course_admin_path(course)

        expect(page).to_not have_button('Delete course', disabled: true)
      end
    end

    context 'As a Course Teaching Assistant' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario 'I cannot view the Course Admin Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).not_to have_text(I18n.t('layouts.course_admin.title'))
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot view the Course Admin Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).not_to have_text(I18n.t('layouts.course_admin.title'))
      end
    end
  end
end
