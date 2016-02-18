# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let!(:achievement) { create(:course_achievement, course: course) }
    let!(:draft_achievement) { create(:course_achievement, course: course, draft: true) }

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, :approved, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, achievement) }
      it { is_expected.not_to be_able_to(:show, draft_achievement) }
      it { is_expected.not_to be_able_to(:display_badge, achievement) }

      it 'sees the published achievements' do
        expect(course.achievements.accessible_by(subject)).to contain_exactly(achievement)
      end

      context 'when the user obtains the achievement' do
        before do
          create(:course_user_achievement, course_user: course_user, achievement: achievement)
        end

        it { is_expected.to be_able_to(:display_badge, achievement) }
      end
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      it { is_expected.to be_able_to(:manage, achievement) }
      it { is_expected.to be_able_to(:manage, draft_achievement) }

      it 'sees all achievements' do
        expect(course.achievements.accessible_by(subject)).
          to contain_exactly(achievement, draft_achievement)
      end
    end
  end
end
