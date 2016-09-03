# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Events' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let(:event) { create(:course_lesson_plan_event, course: course) }
    let(:new_event_title) { 'Modified event title' }

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

      scenario 'I can edit a course event' do
        event
        visit course_lesson_plan_path(course)

        find_link(nil, href: edit_course_lesson_plan_event_path(course, event)).click
        fill_in 'title', with: new_event_title
        click_button I18n.t('helpers.submit.lesson_plan_event.update')

        expect(event.reload.title).to eq(new_event_title)
      end

      scenario 'I can delete a course event' do
        event
        visit course_lesson_plan_path(course)

        expect do
          find_link(nil, href: course_lesson_plan_event_path(course, event)).click
        end.to change(course.lesson_plan_events, :count).by(-1)
      end
    end
  end
end
