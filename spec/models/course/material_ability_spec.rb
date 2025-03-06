# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Material do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject(:ability) { Ability.new(user, course, course_user) }
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
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, valid_material) }
      it { is_expected.not_to be_able_to(:show, not_started_material) }
      it { is_expected.not_to be_able_to(:show, ended_material) }
      it { is_expected.to be_able_to(:show, started_linked_material) }
      it { is_expected.not_to be_able_to(:show, not_started_linked_material) }

      it { is_expected.to be_able_to(:download, valid_material.folder) }
      it { is_expected.not_to be_able_to(:download, not_started_material.folder) }
      it { is_expected.not_to be_able_to(:download, ended_material.folder) }
      it { is_expected.to be_able_to(:download, started_linked_material.folder) }
      it { is_expected.not_to be_able_to(:download, not_started_linked_material.folder) }

      it { is_expected.not_to be_able_to(:create_text_chunks, valid_material) }
      it { is_expected.not_to be_able_to(:destroy_text_chunks, valid_material) }
    end

    context 'when the user is a Course Teaching Staff' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:manage, valid_material) }
      it { is_expected.to be_able_to(:manage, not_started_material) }
      it { is_expected.to be_able_to(:manage, ended_material) }
      it { is_expected.to be_able_to(:manage, not_started_linked_material) }
      it { is_expected.to be_able_to(:show, not_started_linked_material) }
      it { is_expected.not_to be_able_to(:create_text_chunks, valid_material) }
      it { is_expected.not_to be_able_to(:destroy_text_chunks, valid_material) }
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, valid_material) }
      it { is_expected.to be_able_to(:show, not_started_material) }
      it { is_expected.to be_able_to(:show, ended_material) }
      it { is_expected.to be_able_to(:show, started_linked_material) }
      it { is_expected.to be_able_to(:show, not_started_linked_material) }

      it { is_expected.not_to be_able_to(:manage, valid_material) }
      it { is_expected.not_to be_able_to(:manage, not_started_material) }
      it { is_expected.not_to be_able_to(:manage, ended_material) }
      it { is_expected.not_to be_able_to(:manage, started_linked_material) }
      it { is_expected.not_to be_able_to(:manage, not_started_linked_material) }

      it { is_expected.to be_able_to(:download, valid_material.folder) }
      it { is_expected.to be_able_to(:download, not_started_material.folder) }
      it { is_expected.to be_able_to(:download, ended_material.folder) }
      it { is_expected.to be_able_to(:download, started_linked_material.folder) }
      it { is_expected.to be_able_to(:download, not_started_linked_material.folder) }

      it { is_expected.not_to be_able_to(:create_text_chunks, valid_material) }
      it { is_expected.not_to be_able_to(:destroy_text_chunks, valid_material) }
    end

    context 'when the user is a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:create_text_chunks, valid_material) }
      it { is_expected.to be_able_to(:destroy_text_chunks, valid_material) }
    end

    context 'when the user is a Course Owner' do
      let(:course_user) { create(:course_owner, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:create_text_chunks, valid_material) }
      it { is_expected.to be_able_to(:destroy_text_chunks, valid_material) }
    end
  end
end
