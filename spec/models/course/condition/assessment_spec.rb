# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Assessment, type: :model do
  it { is_expected.to act_as(Course::Condition) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'validations' do
      context 'when an assessment is its own condition' do
        subject do
          assessment = create(:assessment, course: course)
          build_stubbed(:assessment_condition,
                        course: course, assessment: assessment, conditional: assessment).
            tap do |assessment_condition|
            allow(assessment_condition).to receive(:assessment_id_changed?).and_return(true)
          end
        end
        it { is_expected.to_not be_valid }
      end

      context "when an assessment is already included in its conditional's conditions" do
        subject do
          existing_assessment_condition = create(:assessment_condition, course: course)
          build(:assessment_condition,
                course: course, conditional: existing_assessment_condition.conditional,
                assessment: existing_assessment_condition.assessment)
        end

        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:assessment]).to_not be_blank
        end
      end

      # TODO: remove this test when Course::Condition::Assessment#required_assessments_for uses
      # squeel.
      context 'when an assessment is required by another conditional with the same id' do
        subject do
          id = Time.now.to_i
          assessment = create(:assessment, course: course, id: id)
          achievement = create(:achievement, course: course, id: id)
          required_assessment = create(:assessment, course: course)
          create(:assessment_condition,
                 course: course, assessment: required_assessment, conditional: achievement)
          build_stubbed(:assessment_condition,
                        course: course, assessment: required_assessment, conditional: assessment)
        end
        it { is_expected.to be_valid }
      end
    end

    describe '#title' do
      let(:assessment) { create(:course_assessment_assessment, title: 'Dummy', course: course) }
      subject { create(:course_condition_assessment, assessment: assessment) }

      context 'when there is no minimum grade percentage' do
        it 'returns the assessment title' do
          expect(subject.title).to eq(assessment.title)
        end
      end

      context 'when there is minimum grade percentage' do
        it 'returns the assessment title with the minimum grade percentage' do
          subject.minimum_grade_percentage = 33.333

          expect(subject.title).
            to eq(Course::Condition::Assessment.
                    human_attribute_name('title.title',
                                         assessment_title: assessment.title,
                                         minimum_grade_percentage: '33.33%'))
        end
      end
    end

    describe '#satisfied_by?' do
      let(:course_user) { create(:course_user) }
      let(:assessment) do
        assessment = create(:assessment)
        create(:course_assessment_question_multiple_response,
               maximum_grade: 10, assessment: assessment)
        assessment
      end

      context 'when there is no minimum grade percentage' do
        subject { create(:course_condition_assessment, assessment: assessment) }

        context 'when there is no submission' do
          it 'returns false' do
            expect(subject.satisfied_by?(course_user)).to be_falsey
          end
        end

        context 'when the submission is not graded' do
          it 'returns false' do
            create(:submission, workflow_state: :attempting, assessment: assessment,
                                user: course_user.user)
            expect(subject.satisfied_by?(course_user)).to be_falsey
          end
        end

        context 'when the submission is graded' do
          it 'returns true' do
            create(:submission, workflow_state: :graded, assessment: assessment,
                                user: course_user.user)
            expect(subject.satisfied_by?(course_user)).to be_truthy
          end
        end
      end

      context 'when there is minimum grade percentage' do
        subject do
          condition = create(:course_condition_assessment, minimum_grade_percentage: 60)
          condition.assessment = assessment
          condition
        end

        let(:submission) do
          create(:submission, workflow_state: :graded, assessment: assessment,
                              user: course_user.user)
        end

        context 'when there is no answer' do
          it 'return false' do
            expect(subject.satisfied_by?(course_user)).to be_falsey
          end
        end

        context 'when all graded submissions are below the minimum grade percentage' do
          it 'returns false' do
            answers = assessment.questions.attempt(submission)
            answers.each do |answer|
              answer.finalise!
              answer.grade = 5
              answer.save!
            end

            expect(subject.satisfied_by?(course_user)).to be_falsey
          end
        end

        context 'when at least one submission is at least the minimum grade percentage' do
          it 'returns true' do
            answers = assessment.questions.attempt(submission)
            answers.each do |answer|
              answer.finalise!
              answer.grade = 6
              answer.save!
            end

            expect(subject.satisfied_by?(course_user)).to be_truthy
          end
        end
      end
    end

    describe '#dependent_object' do
      it 'returns the correct dependent assessment object' do
        expect(subject.dependent_object).to eq(subject.assessment)
      end
    end

    describe '.dependent_class' do
      it 'returns Course::Assessment' do
        expect(Course::Condition::Assessment.dependent_class).to eq(Course::Assessment.name)
      end
    end
  end
end
