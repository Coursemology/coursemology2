# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserAchievement, type: :model do
  it 'belongs to a course user' do
    expect(subject).to belong_to(:course_user).
      inverse_of(:course_user_achievements).
      without_validating_presence
  end
  it 'belongs to an achievement' do
    expect(subject).to belong_to(:achievement).
      inverse_of(:course_user_achievements).
      without_validating_presence
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#initialize' do
      it 'sets the obtained timestamp' do
        expect(subject.obtained_at).to be_within(1.second).of(Time.zone.now)
      end
    end

    describe 'validations' do
      context 'when course_user is not from the same course as achievement' do
        let(:course) { create(:course) }
        subject { build(:course_user_achievement) }
        before { subject.achievement.course = course }

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors[:course_user]).
            to include(I18n.t('activerecord.errors.models.course/user_achievement.'\
              'attributes.course_user.not_in_course'))
        end
      end
    end
  end
end
