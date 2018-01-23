# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Lesson Plan' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let(:milestone_title_prefix) { 'Spec milestone ' }
    let(:event_title_prefix) { 'Spec event ' }

    let!(:milestones) do
      [2.days.ago, 2.days.from_now].map do |start_at|
        create(:course_lesson_plan_milestone,
               course: course,
               start_at: start_at,
               title: milestone_title_prefix + start_at.to_s)
      end
    end

    let!(:events) do
      past_dates = (1..3).map { |i| i.days.ago }
      future_dates = (0..3).map { |i| i.days.from_now }

      (past_dates + future_dates).map do |start_at|
        create(:course_lesson_plan_event,
               course: course,
               start_at: start_at,
               title: event_title_prefix + start_at.to_s,
               published: true)
      end
    end

    before do
      course.settings.course_lesson_plan_component = { milestones_expanded: 'all' }
      course.save!

      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view all lesson plan items and milestones', js: true do
        visit course_lesson_plan_path(course)

        milestones.each { |milestone| expect(page).to have_text(milestone.title) }
        events.each { |event| expect(page).to have_text(event.title) }
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the LessonPlan Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.lesson_plan.items.sidebar_title')
      end

      scenario 'I can view all lesson plan items and milestones', js: true do
        visit course_lesson_plan_path(course)

        milestones.each { |milestone| expect(page).to have_text(milestone.title) }
        events.each { |event| expect(page).to have_text(event.title) }
      end
    end
  end
end
