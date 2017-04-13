# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Event do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course) }
    let(:survey) { create(:survey, *survey_traits, course: course) }
    let(:survey_traits) { [] }

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      it { is_expected.to be_able_to(:manage, survey) }

      it 'allows the user to see all surveys' do
        expect(course.surveys.accessible_by(subject)).
          to contain_exactly(survey)
      end

      context 'when the survey is being prepared' do
        let(:survey_traits) { [:unpublished, :not_started] }
        let(:response) { build(:response, survey: survey, creator: user) }
        let(:submitted_response) do
          build(:response, survey: survey, creator: user, submitted_at: Time.zone.now)
        end

        it 'allows the user to try out the survey before publishing it' do
          expect(subject).to be_able_to(:create, response)
          expect(subject).to be_able_to(:submit, response)
          expect(subject).to be_able_to(:modify, response)
          expect(subject).to be_able_to(:read_answers, response)
          expect(subject).not_to be_able_to(:submit, submitted_response)
        end
      end

      context 'when the survey is anonymous' do
        let(:survey_traits) { [:anonymous] }
        let(:response) { build(:response, survey: survey, creator: student.user) }

        it 'allows user to view response meta-data but not answers' do
          expect(subject).to be_able_to(:read, response)
          expect(subject).not_to be_able_to(:read_answers, response)
        end
      end
    end

    context 'when the user is a Course Student' do
      let(:user) { student.user }

      context 'when the survey is published' do
        let(:survey_traits) { [:published] }

        it { is_expected.to be_able_to(:show, survey) }

        it 'allows the user to see all published surveys' do
          expect(course.surveys.accessible_by(subject)).
            to contain_exactly(survey)
        end
      end

      context 'when the survey is not published' do
        let(:survey_traits) { [:unpublished] }

        it { is_expected.not_to be_able_to(:show, survey) }
      end

      context 'when the survey is published and has opened' do
        let(:survey_traits) { [:published, :currently_active] }
        let(:response) { build(:response, survey: survey, creator: user) }

        it { is_expected.to be_able_to(:create, response) }
        it { is_expected.to be_able_to(:modify, response) }
        it { is_expected.to be_able_to(:submit, response) }
        it { is_expected.to be_able_to(:read_answers, response) }
        it { is_expected.not_to be_able_to(:unsubmit, response) }
      end

      context 'when published survey is expired' do
        let(:response) { build(:response, survey: survey, creator: user) }

        context 'when responses are not allowed after survey expiry' do
          let(:survey_traits) { [:published, :expired] }

          it 'does not allow user to create a response' do
            expect(subject).not_to be_able_to(:create, response)
          end

          it 'does not allow user to submit a response' do
            expect(subject).not_to be_able_to(:submit, response)
          end

          context 'when responses has not been submitted' do
            it 'does not allow user to modify a response' do
              expect(subject).not_to be_able_to(:modify, response)
            end
          end
        end

        context 'when responses are allowed after survey expiry' do
          let(:survey_traits) { [:published, :expired, :allow_response_after_end] }

          it 'allows user to create a response' do
            expect(subject).to be_able_to(:create, response)
          end

          it 'allows user to submit a response' do
            expect(subject).to be_able_to(:submit, response)
          end

          context 'when responses has not been submitted' do
            it 'allows user to modify a response' do
              expect(subject).to be_able_to(:modify, response)
            end
          end
        end
      end

      context 'when survey response has been submitted' do
        let(:response) { build(:response, :submitted, survey: survey, creator: user) }

        it 'does not allow re-submission' do
          expect(subject).not_to be_able_to(:submit, response)
        end

        context 'when modifications are not allowed after survey response submission' do
          let(:survey_traits) { [:published, :currently_active] }

          it 'does not allow user to modify his response' do
            expect(subject).not_to be_able_to(:modify, response)
          end
        end

        context 'when modifications are allowed after survey response submission' do
          let(:survey_traits) { [:published, :currently_active, :allow_modify_after_submit] }

          it 'allows user to modify his response' do
            expect(subject).to be_able_to(:modify, response)
          end
        end
      end
    end
  end
end
