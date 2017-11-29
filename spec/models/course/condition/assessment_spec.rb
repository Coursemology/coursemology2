# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Assessment, type: :model do
  it { is_expected.to act_as(Course::Condition) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'validations' do
      subject do
        assessment = create(:assessment, course: course)
        build(:assessment_condition,
              course: course, assessment: assessment, conditional: assessment)
      end

      it 'validates minimum_grade_percentage' do
        expect(subject).to validate_numericality_of(:minimum_grade_percentage).allow_nil.
          is_greater_than_or_equal_to(0).is_less_than_or_equal_to(100)
      end

      context 'when an assessment is its own condition' do
        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:assessment]).to include(I18n.t('activerecord.errors.models.' \
            'course/condition/assessment.attributes.assessment.references_self'))
        end
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
          expect(subject.errors[:assessment]).to include(I18n.t('activerecord.errors.models.' \
            'course/condition/assessment.attributes.assessment.unique_dependency'))
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

      context 'when an achievement has the conditional as its own conditions' do
        subject do
          assessment1 = create(:assessment, course: course)
          assessment2 = create(:assessment, course: course)
          create(:assessment_condition,
                 course: course, assessment: assessment1, conditional: assessment2)
          build(:assessment_condition,
                course: course, assessment: assessment2, conditional: assessment1)
        end

        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:assessment]).to include(I18n.t('activerecord.errors.models.' \
            'course/condition/assessment.attributes.assessment.cyclic_dependency'))
        end
      end
    end

    describe 'callbacks' do
      describe '#assessment' do
        let(:course) { create(:course) }
        let(:student_user) { create(:course_student, course: course).user }
        let(:assessment) { create(:assessment, :published_with_mcq_question, course: course) }
        let(:submission) do
          create(:submission, *submission_traits, assessment: assessment, creator: student_user)
        end
        context 'when the submission is being attempted' do
          let(:submission_traits) { [:attempting] }
          it 'does not evaluate_conditional_for the affected course_user' do
            expect(Course::Condition::Assessment).
              to_not receive(:evaluate_conditional_for).with(submission.course_user)
            submission.save!
          end
        end

        context 'when the submission is being submitted' do
          let(:submission_traits) { [:attempting] }
          it 'evaluate_conditional_for the affected course_user' do
            expect(Course::Condition::Assessment).
              to receive(:evaluate_conditional_for).with(submission.course_user)
            submission.finalise!
            submission.save!
          end
        end

        context 'when the submission is being graded' do
          let(:submission_traits) { [:submitted] }
          it 'evaluate_conditional_for the affected course_user' do
            expect(Course::Condition::Assessment).
              to receive(:evaluate_conditional_for).with(submission.course_user)
            submission.publish!
            submission.save!
          end
        end

        context 'when the submission is already published' do
          let(:submission_traits) { [:published] }
          it 'does not evaluate_conditional_for the affected course_user' do
            expect(Course::Condition::Assessment).
              to_not receive(:evaluate_conditional_for).with(submission.course_user)
            submission.save!
          end
        end
      end
    end

    describe '#title' do
      let(:assessment) { create(:assessment, title: 'Dummy', course: course) }
      subject { create(:course_condition_assessment, assessment: assessment) }

      context 'when there is no minimum grade percentage' do
        it 'returns the statement to complete the assessment with the assessment title' do
          expect(subject.title).
            to eq(Course::Condition::Assessment.
                    human_attribute_name('title.complete', assessment_title: assessment.title))
        end
      end

      context 'when there is minimum grade percentage' do
        it 'returns the assessment title with the minimum grade percentage' do
          subject.minimum_grade_percentage = 33.333

          expect(subject.title).
            to eq(Course::Condition::Assessment.
                    human_attribute_name('title.minimum_score',
                                         assessment_title: assessment.title,
                                         minimum_grade_percentage: '33.33%'))
        end
      end
    end

    describe '#satisfied_by?' do
      let(:course) { create(:course) }
      let(:course_user) { create(:course_student, course: course) }
      let(:assessment) do
        assessment = create(:assessment, course: course)
        create(:course_assessment_question_multiple_response,
               maximum_grade: 10, assessment: assessment)
        assessment.published = true
        assessment.save!
        assessment
      end

      context 'when there is no minimum grade percentage' do
        subject { create(:course_condition_assessment, assessment: assessment) }

        context 'when there is no submission' do
          it 'returns false' do
            expect(subject.satisfied_by?(course_user)).to be_falsey
          end
        end

        context 'when the submission is attempted' do
          it 'returns false' do
            create(:submission, :attempting, assessment: assessment, creator: course_user.user)
            expect(subject.satisfied_by?(course_user)).to be_falsey
          end
        end

        context 'when the submission is submitted' do
          it 'returns true' do
            create(:submission, :submitted, assessment: assessment, creator: course_user.user)
            expect(subject.satisfied_by?(course_user)).to be_truthy
          end
        end

        context 'when the submission is published' do
          it 'returns true' do
            create(:submission, :published, assessment: assessment, creator: course_user.user)
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

        context 'when there are submitted submissions' do
          it 'returns false' do
            create(:submission, :submitted, assessment: assessment, creator: course_user.user)
            expect(subject.satisfied_by?(course_user)).to be_falsey
          end
        end

        context 'when there are published submissions' do
          let(:submission) do
            create(:submission, :published, assessment: assessment, creator: course_user.user)
          end

          context 'when there is no answer' do
            it 'returns false' do
              expect(subject.satisfied_by?(course_user)).to be_falsey
            end
          end

          context 'when the published submission is below the minimum grade percentage' do
            it 'returns false' do
              answers = submission.answers
              answers.each do |answer|
                answer.grade = 5
                answer.save!
              end

              expect(subject.satisfied_by?(course_user)).to be_falsey
            end
          end

          context 'when the submission is at least the minimum grade percentage' do
            it 'returns true' do
              answers = submission.answers
              answers.each do |answer|
                answer.grade = 6
                answer.save!
              end

              expect(subject.satisfied_by?(course_user)).to be_truthy
            end
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
