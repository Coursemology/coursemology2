# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Events' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let(:events) { create_list(:course_lesson_plan_event, 2, course: course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a course event' do
        visit course_lesson_plan_path(course)
        find_link(nil, href: new_course_lesson_plan_event_path(course)).click

        fill_in 'title', with: 'Title'
        fill_in 'start_at', with: 1.day.from_now

        expect do
          click_button I18n.t('helpers.submit.lesson_plan_event.create')
        end.to change(course.lesson_plan_events, :count).by(1)
      end

      scenario 'I can delete a course event and visit the edit event page', js: true do
        event_to_delete, event_to_edit = events
        visit course_lesson_plan_path(course)

        # Delete an event
        expect(page).to have_text(event_to_delete.title)
        find("#item-#{event_to_delete.acting_as.id} button").click
        deletion_path = course_lesson_plan_event_path(course, event_to_delete)
        expect do
          find_link(nil, href: deletion_path).click
          expect(page).not_to have_link(nil, href: deletion_path)
          expect(page).to have_selector('.confirm-btn')
          accept_confirm_dialog
          expect(page).to have_selector('div.alert-success')
        end.to change(course.lesson_plan_events, :count).by(-1)

        # Go to edit event page
        expect(page).to have_text(event_to_edit.title)
        find("#item-#{event_to_edit.acting_as.id} button").click
        find_link(nil, href: edit_course_lesson_plan_event_path(course, event_to_edit)).click
        expect(page).to have_selector('h1', text: I18n.t('course.lesson_plan.events.edit.header'))
        expect(current_path).to eq(edit_course_lesson_plan_event_path(course, event_to_edit))
      end

      scenario 'I can update a course event' do
        event, = events
        visit edit_course_lesson_plan_event_path(course, event)

        new_event_title = 'Modified event title'
        fill_in 'title', with: new_event_title
        click_button I18n.t('helpers.submit.lesson_plan_event.update')

        expect(event.reload.title).to eq(new_event_title)
      end
    end
  end
end
