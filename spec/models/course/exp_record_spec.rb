require 'rails_helper'

RSpec.describe Course::ExpRecord, type: :model do
  it { is_expected.to belong_to(:course_user).inverse_of(:exp_records) }
  it { is_expected.to validate_presence_of(:course_user) }
  it { is_expected.to validate_numericality_of(:exp_awarded).only_integer }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    context 'when manual' do
      let(:manual_exp_record) { build :manual_exp_record }
      subject { manual_exp_record }

      it { is_expected.to be_valid }
      it { is_expected.to be_manual_exp }

      context 'with no reason' do
        before { manual_exp_record.reason = nil }
        it { is_expected.to be_invalid }
      end
    end
  end
end
