# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Lesson Plan Milestones' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let(:milestone) { create(:course_lesson_plan_milestone, course: course) }
    let(:new_milestone_title) { 'Modified milestone title' }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can create a milestone' do
        visit course_lesson_plan_path(course)
        find_link(nil, href: new_course_lesson_plan_milestone_path(course)).click

        fill_in 'title', with: 'Title'
        fill_in 'lesson_plan_milestone[start_at]', with: 1.day.from_now

        expect do
          click_button I18n.t('helpers.submit.lesson_plan_milestone.create')
        end.to change(course.lesson_plan_milestones, :count).by(1)
      end

      scenario 'I can edit a milestone' do
        milestone
        visit course_lesson_plan_path(course)

        find_link(nil, href: edit_course_lesson_plan_milestone_path(course, milestone)).click
        fill_in 'title', with: new_milestone_title
        click_button I18n.t('helpers.submit.lesson_plan_milestone.update')

        expect(milestone.reload.title).to eq(new_milestone_title)
      end

      scenario 'I can delete a milestone' do
        milestone
        visit course_lesson_plan_path(course)

        expect do
          find_link(nil, href: course_lesson_plan_milestone_path(course, milestone)).click
        end.to change(course.lesson_plan_milestones, :count).by(-1)
      end
    end
  end
end
