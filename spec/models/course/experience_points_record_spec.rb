# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExperiencePointsRecord do
  it { is_expected.to belong_to(:course_user).inverse_of(:experience_points_records) }
  it { is_expected.to validate_presence_of(:course_user) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_user) { create(:course_user, course: course) }

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

    context 'when manually created' do
      subject { build(:course_experience_points_record) }

      it { is_expected.to be_valid }
      it 'is a manual experience points record' do
        expect(subject.send(:manually_awarded?)).to be_truthy
      end

      context 'when the record does not have a reason' do
        before { subject.reason = nil }
        it { is_expected.to be_invalid }
      end
    end
  end
end
