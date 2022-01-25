# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Skill do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }
    let(:other_course) { create(:course) }
    let(:skill) { create(:course_assessment_skill, course: course) }
    let(:skill_branch) do
      create(:course_assessment_skill_branch, skills: [skill], course: course)
    end
    let(:other_skill) { create(:course_assessment_skill, course: other_course) }
    let(:other_skill_branch) do
      create(:course_assessment_skill_branch, skills: [other_skill], course: other_course)
    end

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      it { is_expected.not_to be_able_to(:show, skill) }
      it { is_expected.not_to be_able_to(:show, skill_branch) }
    end

    context 'when the user is a Course Teaching Staff' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:manage, skill) }
      it { is_expected.to be_able_to(:manage, skill_branch) }
      it { is_expected.not_to be_able_to(:show, other_skill) }
      it { is_expected.not_to be_able_to(:show, other_skill_branch) }
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, skill) }
      it { is_expected.to be_able_to(:show, skill_branch) }
      it { is_expected.not_to be_able_to(:show, other_skill) }
      it { is_expected.not_to be_able_to(:show, other_skill_branch) }
      it { is_expected.not_to be_able_to(:manage, skill) }
      it { is_expected.not_to be_able_to(:manage, skill_branch) }
    end
  end
end
