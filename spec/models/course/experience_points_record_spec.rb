require 'rails_helper'

RSpec.describe Course::ExperiencePointsRecord, type: :model do
  it { is_expected.to belong_to(:course_user).inverse_of(:experience_points_records) }
  it { is_expected.to validate_presence_of(:course_user) }
  it { is_expected.to validate_numericality_of(:points_awarded).only_integer }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    context 'when manual' do
      subject { build :course_experience_points_record }

      it { is_expected.to be_valid }
      it { is_expected.to be_manual_exp }

      context 'with no reason' do
        before { subject.reason = nil }
        it { is_expected.to be_invalid }
      end
    end
  end
end
