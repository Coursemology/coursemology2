require 'rails_helper'

RSpec.feature 'Course: Lesson Plan' do
  subject { page }
  let!(:instance) { create(:instance) }

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
               title: event_title_prefix + start_at.to_s)
      end
    end

    let!(:assessments) do
      create_list(:course_assessment_assessment, 1, course: course)
    end

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can view all lesson plan items grouped by milestone' do
        visit course_lesson_plan_path(course)
        milestones.each do |m|
          expect(subject).to have_text(m.title)
        end

        events.each do |item|
          expect(subject).to have_text(item.title)
        end
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }

      scenario 'I can view the LessonPlan Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.lesson_plan.items.sidebar_title')
      end

      scenario 'I can view all lesson plan items grouped by milestone' do
        visit course_lesson_plan_path(course)
        expect(page).not_to have_link(nil, href: new_course_lesson_plan_event_path(course))
        expect(page).not_to have_link(nil, href: new_course_lesson_plan_milestone_path(course))

        milestones.each do |m|
          expect(subject).to have_text(m.title)
        end

        events.each do |item|
          expect(subject).to have_text(item.title)
        end
      end
    end
  end
end
