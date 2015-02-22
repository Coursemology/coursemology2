require 'rails_helper'

RSpec.describe Course, type: :model do

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    it { is_expected.to belong_to(:creator) }
    it { is_expected.to have_many(:course_users).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:users).through(:course_users) }
    it { is_expected.to have_many(:announcements).inverse_of(:course).dependent(:destroy) }

    it { is_expected.to validate_presence_of(:title) }

    context 'when course is created' do
      subject { Course.new }

      it { is_expected.not_to be_published }
      it { is_expected.not_to be_opened }
    end
  end
end
