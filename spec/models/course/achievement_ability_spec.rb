# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }
    let!(:achievement) { create(:course_achievement, course: course) }
    let!(:draft_achievement) { create(:course_achievement, course: course, published: false) }

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
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

    context 'when the user is a Course Teaching Staff' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:manage, achievement) }
      it { is_expected.to be_able_to(:manage, draft_achievement) }

      it 'sees all achievements' do
        expect(course.achievements.accessible_by(subject)).
          to contain_exactly(achievement, draft_achievement)
      end

      context 'when the achievement is manually awarded' do
        before { allow(achievement).to receive(:manually_awarded?).and_return(true) }

        it { is_expected.to be_able_to(:award, achievement) }
      end

      context 'when the achievement is not manually awarded' do
        before { allow(achievement).to receive(:manually_awarded?).and_return(false) }

        it { is_expected.not_to be_able_to(:award, achievement) }
      end
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:read, achievement) }
      it { is_expected.to be_able_to(:read, draft_achievement) }
      it { is_expected.to be_able_to(:display_badge, achievement) }
      it { is_expected.to be_able_to(:display_badge, draft_achievement) }
      it { is_expected.not_to be_able_to(:manage, achievement) }
      it { is_expected.not_to be_able_to(:manage, draft_achievement) }
    end
  end
end
