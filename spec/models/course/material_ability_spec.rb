# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Material do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject(:ability) { Ability.new(user) }
    let(:course) { create(:course) }
    let(:valid_material) do
      folder = build_stubbed(:folder, course: course)
      build_stubbed(:material, folder: folder)
    end
    let(:not_started_material) do
      folder = build_stubbed(:folder, :not_started, course: course)
      build_stubbed(:material, folder: folder)
    end
    let(:ended_material) do
      folder = build_stubbed(:folder, :ended, course: course)
      build_stubbed(:material, folder: folder)
    end
    let(:started_linked_material) do
      folder = build_stubbed(:folder, course: course,
                                      owner: build_stubbed(:course_assessment_category))
      build_stubbed(:material, folder: folder)
    end
    let(:not_started_linked_material) do
      folder = build_stubbed(:folder, :not_started,
                             course: course, owner: build_stubbed(:course_assessment_category))
      build_stubbed(:material, folder: folder)
    end

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      it { is_expected.to be_able_to(:show, valid_material) }
      it { is_expected.not_to be_able_to(:show, not_started_material) }
      it { is_expected.not_to be_able_to(:show, ended_material) }
      it { is_expected.to be_able_to(:show, started_linked_material) }
      it { is_expected.not_to be_able_to(:show, not_started_linked_material) }
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      it { is_expected.to be_able_to(:manage, valid_material) }
      it { is_expected.to be_able_to(:manage, not_started_material) }
      it { is_expected.to be_able_to(:manage, ended_material) }
      it { is_expected.not_to be_able_to(:manage, not_started_linked_material) }
      it { is_expected.to be_able_to(:show, not_started_linked_material) }
    end
  end
end
