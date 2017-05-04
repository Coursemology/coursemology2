# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Lesson Plan Milestones' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let(:milestones) do
      [2.days.ago, 2.days.from_now].map do |start_at|
        create(:course_lesson_plan_milestone, course: course, start_at: start_at)
      end
    end

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a milestone' do
        visit course_lesson_plan_path(course)
        find_link(nil, href: new_course_lesson_plan_milestone_path(course)).click

        fill_in 'title', with: 'Title'
        fill_in 'lesson_plan_milestone[start_at]', with: 1.day.from_now

        expect do
          click_button I18n.t('helpers.submit.lesson_plan_milestone.create')
        end.to change(course.lesson_plan_milestones, :count).by(1)
      end

      scenario 'I can update a milestone' do
        milestone, = milestones
        visit edit_course_lesson_plan_milestone_path(course, milestone)

        new_milestone_title = 'Modified milestone title'
        fill_in 'title', with: new_milestone_title
        click_button I18n.t('helpers.submit.lesson_plan_milestone.update')

        expect(milestone.reload.title).to eq(new_milestone_title)
      end

      scenario 'I can delete a course milestone and visit the edit milestone page', js: true do
        milestone_to_edit, milestone_to_delete = milestones
        visit course_lesson_plan_path(course)

        # Delete a milestone
        expect(page).to have_text(milestone_to_delete.title)
        find("#milestone-#{milestone_to_delete.id} button").click
        deletion_path = course_lesson_plan_milestone_path(course, milestone_to_delete)
        expect do
          find_link(nil, href: deletion_path).click
          expect(page).not_to have_link(nil, href: deletion_path)
          expect(page).to have_selector('.confirm-btn')
          accept_confirm_dialog
          expect(page).to have_selector('div.alert-success')
        end.to change(course.lesson_plan_milestones, :count).by(-1)

        # Go to edit milestone page
        expect(page).to have_text(milestone_to_edit.title)
        find("#milestone-#{milestone_to_edit.id} button").click
        find_link(nil, href: edit_course_lesson_plan_milestone_path(course, milestone_to_edit)).
          click
        expect(current_path).
          to eq(edit_course_lesson_plan_milestone_path(course, milestone_to_edit))
      end
    end
  end
end
