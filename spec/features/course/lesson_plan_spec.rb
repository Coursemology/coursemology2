require 'rails_helper'

RSpec.feature 'Course: Lesson Plan' do
  subject { page }
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let(:milestone_title_prefix) { 'Spec milestone ' }
    let(:event_title_prefix) { 'Spec event ' }

    let!(:milestones) do
      [2.days.ago, 2.days.from_now].map do |start_time|
        create(:course_lesson_plan_milestone,
               course: course,
               start_time: start_time,
               title: milestone_title_prefix + start_time.to_s)
      end
    end

    let!(:events) do
      past_dates = (1..3).map { |i| i.days.ago }
      future_dates = (0..3).map { |i| i.days.from_now }

      (past_dates + future_dates).map do |start_time|
        create(:course_event,
               course: course,
               start_time: start_time,
               title: event_title_prefix + start_time.to_s)
      end
    end

    let!(:assessments) do
      create_list(:course_assessment_assessment, 1, course: course)
    end

    context 'As a Course Administrator' do
      before do
        login_as(user, scope: :user)
      end

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
  end
end
