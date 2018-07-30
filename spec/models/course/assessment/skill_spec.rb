# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Skill do
  it { is_expected.to belong_to(:course).inverse_of(:assessment_skills) }
  it { is_expected.to belong_to(:skill_branch) }
  it { is_expected.to have_and_belong_to_many(:question_assessments) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { build(:course) }
    let(:skill_branch) { nil }
    subject { build(:course_assessment_skill, skill_branch: skill_branch, course: course) }

    describe 'validations' do
      describe '#course' do
        context 'when the course does not match the skill branch' do
          let(:skill_branch) { build(:course_assessment_skill_branch) }
          it 'adds a :consistent_course error on :course' do
            expect(subject).not_to be_valid
            expect(subject.errors[:course]).to include(I18n.t('activerecord.errors.models.course/'\
                                                              'assessment/skill.attributes.course.'\
                                                              'consistent_course'))
          end
        end
      end
    end
  end
end
