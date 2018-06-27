# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::VirtualClassroom, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:virtual_classrooms) }
  it { is_expected.to validate_presence_of(:title) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:user) { create(:user) }
    let(:course) { create(:course) }

    describe 'create an virtual_classroom' do
      context 'when title is not present' do
        subject { build(:course_virtual_classroom, title: '') }

        it { is_expected.not_to be_valid }
      end
    end
  end
end
