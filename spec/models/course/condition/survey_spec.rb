# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Survey, type: :model do
  it { is_expected.to act_as(Course::Condition) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'validations' do
      subject do
        survey = create(:survey, course: course)
        build(:survey_condition,
              course: course, survey: survey, conditional: survey)
      end

      context "when a survey is already included in its conditional's conditions" do
        subject do
          existing_survey_condition = create(:survey_condition, course: course)
          build(:survey_condition,
                course: course, conditional: existing_survey_condition.conditional,
                survey: existing_survey_condition.survey)
        end

        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:survey]).to include(I18n.t('activerecord.errors.models.' \
            'course/condition/survey.attributes.survey.unique_dependency'))
        end
      end
    end

    describe 'callbacks' do
      let(:course) { create(:course) }
      let(:course_user) { create(:course_student, course: course) }
      let(:survey) do
        create(:survey, course: course, published: true,
                        end_at: Time.zone.now + 1.day)
      end

      describe '#survey' do
        context 'when the response is being submitted' do
          let(:response_traits) { { submitted_at: Time.zone.now } }
          it 'evaluate_conditional_for the affected course_user' do
            expect(Course::Condition::Survey).
              to receive(:evaluate_conditional_for).with(course_user)
            create(:response, survey: survey, course_user: course_user,
                              submitted_at: Time.zone.now, creator: course_user.user,
                              updater: course_user.user)
          end
        end

        context 'when the response is being unsubmitted' do
          it 'evaluate_conditional_for the affected course_user' do
            response = create(:response, survey: survey, course_user: course_user,
                                         submitted_at: Time.zone.now,
                                         creator: course_user.user,
                                         updater: course_user.user)
            expect(Course::Condition::Survey).
              to receive(:evaluate_conditional_for).with(course_user)
            response.unsubmit
            response.save!
          end
        end
      end
    end

    describe '#title' do
      let(:survey) { create(:survey, course: course) }
      subject { create(:course_condition_survey, survey: survey) }

      it 'returns the correct survey title' do
        expect(subject.title).
          to eq(Course::Condition::Survey.human_attribute_name('title.complete', survey_title: survey.title))
      end
    end

    describe '#satisfied_by?' do
      let(:course) { create(:course) }
      let(:course_user) { create(:course_student, course: course) }
      let(:survey) do
        create(:survey, course: course, published: true, end_at: Time.zone.now + 1.day)
      end
      subject { create(:course_condition_survey, survey: survey) }

      context 'when there is no response' do
        it 'returns false' do
          expect(subject.satisfied_by?(course_user)).to be_falsey
        end
      end

      context 'when the response is attempted' do
        it 'returns false' do
          create(:response, survey: survey, course_user: course_user,
                            submitted_at: nil, creator: course_user.user,
                            updater: course_user.user)
          expect(subject.satisfied_by?(course_user)).to be_falsey
        end
      end

      context 'when the response is submitted' do
        it 'returns true' do
          create(:response, survey: survey, course_user: course_user,
                            submitted_at: Time.zone.now,
                            creator: course_user.user, updater: course_user.user)
          expect(subject.satisfied_by?(course_user)).to be_truthy
        end
      end
    end

    describe '#dependent_object' do
      it 'returns the correct dependent survey object' do
        expect(subject.dependent_object).to eq(subject.survey)
      end
    end

    describe '.dependent_class' do
      it 'returns Course::Survey' do
        expect(Course::Condition::Survey.dependent_class).to eq(Course::Survey.name)
      end
    end
  end
end
