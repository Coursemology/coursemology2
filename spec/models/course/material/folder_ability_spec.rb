# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Material::Folder, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject(:ability) { Ability.new(user) }
    let(:course) { create(:course) }
    let(:valid_folder) { build_stubbed(:folder, course: course) }
    let(:not_started_folder) { build_stubbed(:folder, :not_started, course: course) }
    let(:ended_folder) { build_stubbed(:folder, :ended, course: course) }
    let(:started_linked_folder) do
      create(:assessment, course: course, start_at: 1.day.ago).folder
    end
    let(:not_started_linked_folder) do
      create(:assessment, course: course, start_at: 1.day.from_now).folder
    end

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }

      it { is_expected.to be_able_to(:show, valid_folder) }
      it { is_expected.not_to be_able_to(:show, not_started_folder) }
      it { is_expected.not_to be_able_to(:show, ended_folder) }
      it { is_expected.to be_able_to(:show, started_linked_folder) }
      it { is_expected.not_to be_able_to(:show, not_started_linked_folder) }
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      it { is_expected.to be_able_to(:manage, valid_folder) }
      it { is_expected.to be_able_to(:manage, not_started_folder) }
      it { is_expected.to be_able_to(:manage, ended_folder) }
      it { is_expected.not_to be_able_to(:manage, started_linked_folder) }
      it { is_expected.to be_able_to(:show, started_linked_folder) }
      it { is_expected.to be_able_to(:show, not_started_linked_folder) }
    end
  end
end
