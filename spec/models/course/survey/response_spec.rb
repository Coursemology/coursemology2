# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::Response do
  it { is_expected.to act_as(Course::ExperiencePointsRecord) }
  it { is_expected.to belong_to(:survey).inverse_of(:responses) }
  it { is_expected.to have_many(:answers).inverse_of(:response).dependent(:destroy) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course).user }
    let(:survey) { create(:course_survey, course: course) }
    let(:response) do
      create(:course_survey_response, *response_traits, survey: survey, creator: student)
    end
    let(:response_traits) { nil }

    describe '#submitted?' do
      subject { response.submitted? }

      context 'when response is not submitted' do
        it { is_expected.to be_falsey }
      end

      context 'when response is submitted' do
        let(:response_traits) { [:submitted] }

        it { is_expected.to be_truthy }
      end
    end

    describe '#submit' do
      subject { response.tap(&:submit) }

      it 'sets the correct attributes' do
        expect(subject.submitted_at).not_to be_nil
        expect(subject.points_awarded).to eq(survey.base_exp)
        expect(subject.awarded_at).not_to be_nil
        expect(subject.awarder).to eq(subject.creator)
      end
    end

    describe '#unsubmit' do
      let(:response_traits) { :submitted }
      subject { response.tap(&:unsubmit) }

      it 'sets the correct attributes' do
        expect(subject.submitted_at).to be_nil
        expect(subject.points_awarded).to eq(0)
        expect(subject.awarded_at).to be_nil
        expect(subject.awarder).to be_nil
      end
    end

    describe 'callbacks from Course::Survey::Response::TodoConcern' do
      subject do
        Course::LessonPlan::Todo.find_by(item_id: survey.lesson_plan_item.id, user_id: student.id)
      end
      before { response }

      context 'when response is not submitted' do
        it 'sets the todo to in progress' do
          expect(subject.in_progress?).to be_truthy
        end
      end

      context 'when response is submitted' do
        let(:response_traits) { [:submitted] }

        it 'sets the todo to completed' do
          expect(subject.completed?).to be_truthy
        end
      end

      context 'when response is destroyed' do
        it 'sets the todo state to not started' do
          response.destroy
          expect(subject.not_started?).to be_truthy
        end
      end

      context 'when survey is destroyed' do
        it 'deletes the todo' do
          survey.destroy
          expect(subject).to be_nil
        end
      end
    end
  end
end
