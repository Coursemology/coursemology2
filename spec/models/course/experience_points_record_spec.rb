# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExperiencePointsRecord do
  it { is_expected.to belong_to(:course_user).inverse_of(:experience_points_records) }
  it { is_expected.to validate_presence_of(:course_user) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_user) { create(:course_user, course: course) }

    describe 'after_create callbacks' do
      context 'when record is manually awarded' do
        # Build a record with nil attributes and test if the callback sets the attributes correctly.
        subject do
          build(:course_experience_points_record, awarder: nil, awarded_at: nil).tap(&:save)
        end
        it 'sets the awarded attributes' do
          expect(subject.reload.awarded_at).not_to be_nil
          expect(subject.reload.awarder).not_to be_nil
        end
      end

      context 'when record is not manually awarded' do
        subject { create(:course_assessment_submission).acting_as }
        it 'does not set awarded attributes' do
          expect(subject.reload.awarded_at).to be_nil
          expect(subject.reload.awarder).to be_nil
        end
      end
    end

    describe '.active' do
      it 'only returns active records' do
        active = create_list(:course_experience_points_record, 2, course_user: course_user)
        create_list(:course_experience_points_record, 2, :inactive, course_user: course_user)
        expect(course_user.experience_points_records.active).to contain_exactly(*active)
      end
    end

    describe '#active?' do
      context 'when the record has null for the number of points awarded' do
        it 'is inactive' do
          record = build_stubbed(:course_experience_points_record,
                                 points_awarded: nil, course_user: course_user)
          expect(record).not_to be_active
        end
      end
    end

    describe '#reached_new_level?' do
      let(:course) do
        course = create(:course)
        create_list(:course_level, 3, course: course)
        course.levels.reload
        course
      end
      let(:record) { create(:course_experience_points_record, course: course, points_awarded: 0) }
      subject do
        record.points_awarded += exp_to_award
        record.send(:reached_new_level?)
      end

      context 'when no exp is awarded' do
        let(:exp_to_award) { 0 }

        it { is_expected.to be_falsey }
      end

      context 'when enough exp is awarded' do
        let(:exp_to_award) do
          current_exp = record.course_user.experience_points
          next_level = course.level_for(current_exp).next
          next_level.experience_points_threshold - current_exp
        end

        it { is_expected.to be_truthy }
      end
    end

    context 'when manually created' do
      subject { build(:course_experience_points_record) }

      it { is_expected.to be_valid }
      it 'is a manual experience points record' do
        expect(subject.manually_awarded?).to be_truthy
      end

      context 'when the record does not have a reason' do
        before { subject.reason = nil }
        it { is_expected.to be_invalid }
      end
    end
  end
end
